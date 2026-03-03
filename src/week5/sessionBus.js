const STORAGE_PREFIX = "yoji-week5-session";
const REMOTE_RECONNECT_DELAY_MS = 1500;
const PEERJS_CDN_URL = "https://esm.sh/peerjs@1.5.5?bundle";

function safeParse(jsonText) {
  try {
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
}

function sanitizeSessionId(sessionId) {
  return String(sessionId || "week5-main")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
}

function buildRunnerPeerId(sessionId) {
  return `${STORAGE_PREFIX}-${sanitizeSessionId(sessionId)}-runner`;
}

async function loadPeerConstructor() {
  if (typeof window === "undefined") {
    return null;
  }
  if (typeof window.Peer === "function") {
    return window.Peer;
  }
  try {
    const mod = await import(/* @vite-ignore */ PEERJS_CDN_URL);
    return mod?.default || mod?.Peer || null;
  } catch {
    return null;
  }
}

export class SessionBus {
  constructor(sessionId, options = {}) {
    this.sessionId = sessionId;
    this.role = options.role === "bigscreen" ? "bigscreen" : "runner";
    this.remoteEnabled = options.remoteEnabled !== false;
    this.clientId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `client-${Math.random().toString(36).slice(2)}`;
    this.storageKey = `${STORAGE_PREFIX}:${sessionId}:state`;
    this.signalStorageKey = `${STORAGE_PREFIX}:${sessionId}:signal`;
    this.channelName = `${STORAGE_PREFIX}:${sessionId}:channel`;
    this.channel =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel(this.channelName)
        : null;
    this.runnerPeerId = buildRunnerPeerId(sessionId);
    this.peer = null;
    this.peerReady = false;
    this.closed = false;
    this.setupRemoteSyncPending = false;
    this.runnerConnections = new Map();
    this.remoteConnection = null;
    this.connectTimeoutTimer = null;
    this.reconnectTimer = null;

    this.stateHandlers = new Set();
    this.presenceHandlers = new Set();
    this.signalHandlers = new Set();

    this.handleStorage = this.handleStorage.bind(this);
    this.handleChannelMessage = this.handleChannelMessage.bind(this);

    window.addEventListener("storage", this.handleStorage);
    this.channel?.addEventListener("message", this.handleChannelMessage);

    if (this.remoteEnabled) {
      this.setupRemoteSync().catch(() => {});
    }
  }

  getLatestState() {
    const raw = localStorage.getItem(this.storageKey);
    const parsed = raw ? safeParse(raw) : null;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return parsed;
  }

  publishState(payload) {
    const envelope = {
      sender: this.clientId,
      at: Date.now(),
      type: "state",
      payload
    };
    localStorage.setItem(this.storageKey, JSON.stringify(envelope));
    this.channel?.postMessage(envelope);
    this.broadcastRemote(envelope);
  }

  publishPresence(role) {
    const envelope = {
      sender: this.clientId,
      at: Date.now(),
      type: "presence",
      role
    };
    this.channel?.postMessage(envelope);
    this.broadcastRemote(envelope);
  }

  publishSignal(name, payload = {}) {
    const envelope = {
      sender: this.clientId,
      at: Date.now(),
      type: "signal",
      name,
      payload
    };
    localStorage.setItem(this.signalStorageKey, JSON.stringify(envelope));
    this.channel?.postMessage(envelope);
    this.broadcastRemote(envelope);
  }

  onState(handler) {
    this.stateHandlers.add(handler);
    return () => this.stateHandlers.delete(handler);
  }

  onPresence(handler) {
    this.presenceHandlers.add(handler);
    return () => this.presenceHandlers.delete(handler);
  }

  onSignal(handler) {
    this.signalHandlers.add(handler);
    return () => this.signalHandlers.delete(handler);
  }

  handleStorage(event) {
    if (!event.newValue) {
      return;
    }
    if (event.key === this.storageKey) {
      const envelope = safeParse(event.newValue);
      if (!envelope || envelope.sender === this.clientId || envelope.type !== "state") {
        return;
      }
      this.dispatchEnvelope(envelope);
      return;
    }
    if (event.key === this.signalStorageKey) {
      const envelope = safeParse(event.newValue);
      if (!envelope || envelope.sender === this.clientId || envelope.type !== "signal") {
        return;
      }
      this.dispatchEnvelope(envelope);
    }
  }

  handleChannelMessage(event) {
    const envelope = event.data;
    if (!envelope || envelope.sender === this.clientId) {
      return;
    }
    this.dispatchEnvelope(envelope);
  }

  dispatchEnvelope(envelope) {
    if (envelope.type === "state") {
      this.stateHandlers.forEach((handler) => handler(envelope.payload));
      return;
    }
    if (envelope.type === "presence") {
      this.presenceHandlers.forEach((handler) => handler(envelope));
      return;
    }
    if (envelope.type === "signal") {
      this.signalHandlers.forEach((handler) => handler(envelope));
    }
  }

  async setupRemoteSync() {
    if (this.closed || this.setupRemoteSyncPending) {
      return;
    }
    this.setupRemoteSyncPending = true;
    try {
      const PeerCtor = await loadPeerConstructor();
      if (!PeerCtor) {
        this.remoteEnabled = false;
        return;
      }

      if (this.closed) {
        return;
      }

      const peerId = this.role === "runner" ? this.runnerPeerId : undefined;
      this.peer = new PeerCtor(peerId);

      this.peer.on("open", () => {
        this.peerReady = true;
        this.clearReconnectTimer();
        if (this.role === "bigscreen") {
          this.connectToRunner();
        }
      });

      this.peer.on("connection", (connection) => {
        if (this.role !== "runner") {
          connection.close();
          return;
        }
        this.attachRunnerConnection(connection);
      });

      this.peer.on("disconnected", () => {
        this.peerReady = false;
        this.scheduleReconnect();
      });

      this.peer.on("close", () => {
        this.peerReady = false;
        this.scheduleReconnect();
      });

      this.peer.on("error", (error) => {
        if (error && typeof error.type === "string" && error.type === "unavailable-id") {
          try {
            this.peer?.destroy();
          } catch {
            // no-op
          }
          this.peer = null;
        }
        this.peerReady = false;
        this.scheduleReconnect();
      });
    } finally {
      this.setupRemoteSyncPending = false;
    }
  }

  attachRunnerConnection(connection) {
    connection.on("open", () => {
      this.runnerConnections.set(connection.peer, connection);
      const latest = this.getLatestState();
      if (latest?.type === "state") {
        try {
          connection.send(latest);
        } catch {
          // no-op
        }
      }
    });

    connection.on("data", (rawEnvelope) => {
      this.handleRemoteEnvelope(rawEnvelope);
    });

    const cleanup = () => {
      this.runnerConnections.delete(connection.peer);
    };
    connection.on("close", cleanup);
    connection.on("error", cleanup);
  }

  connectToRunner() {
    if (!this.peer || !this.peerReady) {
      this.scheduleReconnect();
      return;
    }
    if (this.remoteConnection?.open) {
      return;
    }

    const connection = this.peer.connect(this.runnerPeerId, {
      reliable: true
    });
    this.remoteConnection = connection;
    this.clearConnectTimeout();
    this.connectTimeoutTimer = window.setTimeout(() => {
      if (this.closed) {
        return;
      }
      if (this.remoteConnection === connection && !connection.open) {
        try {
          connection.close();
        } catch {
          // no-op
        }
        this.remoteConnection = null;
        this.scheduleReconnect();
      }
    }, 5_000);

    connection.on("open", () => {
      this.clearConnectTimeout();
      this.clearReconnectTimer();
    });

    connection.on("data", (rawEnvelope) => {
      this.handleRemoteEnvelope(rawEnvelope);
    });

    const recover = () => {
      this.clearConnectTimeout();
      if (this.remoteConnection === connection) {
        this.remoteConnection = null;
      }
      this.scheduleReconnect();
    };
    connection.on("close", recover);
    connection.on("error", recover);
  }

  scheduleReconnect() {
    if (this.closed || this.reconnectTimer || !this.remoteEnabled) {
      return;
    }
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      if (this.closed || !this.remoteEnabled) {
        return;
      }
      if (!this.peer || this.peer.destroyed) {
        this.setupRemoteSync().catch(() => {
          this.scheduleReconnect();
        });
        return;
      }
      const needPeerReconnect = !this.peerReady || this.peer.disconnected;
      if (needPeerReconnect && typeof this.peer.reconnect === "function") {
        try {
          this.peer.reconnect();
        } catch {
          // no-op
        }
      }
      if (this.role === "bigscreen") {
        this.connectToRunner();
      }
    }, REMOTE_RECONNECT_DELAY_MS);
  }

  clearReconnectTimer() {
    if (!this.reconnectTimer) {
      return;
    }
    window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  clearConnectTimeout() {
    if (!this.connectTimeoutTimer) {
      return;
    }
    window.clearTimeout(this.connectTimeoutTimer);
    this.connectTimeoutTimer = null;
  }

  broadcastRemote(envelope) {
    if (!this.remoteEnabled || !envelope) {
      return;
    }

    if (this.role === "runner") {
      this.runnerConnections.forEach((connection) => {
        if (!connection?.open) {
          return;
        }
        try {
          connection.send(envelope);
        } catch {
          // no-op
        }
      });
      return;
    }

    if (!this.remoteConnection?.open) {
      return;
    }
    try {
      this.remoteConnection.send(envelope);
    } catch {
      // no-op
    }
  }

  handleRemoteEnvelope(rawEnvelope) {
    const envelope =
      rawEnvelope && typeof rawEnvelope === "string" ? safeParse(rawEnvelope) : rawEnvelope;
    if (!envelope || typeof envelope !== "object") {
      return;
    }
    if (envelope.sender === this.clientId) {
      return;
    }

    if (envelope.type === "state") {
      localStorage.setItem(this.storageKey, JSON.stringify(envelope));
    } else if (envelope.type === "signal") {
      localStorage.setItem(this.signalStorageKey, JSON.stringify(envelope));
    }
    this.channel?.postMessage(envelope);
    this.dispatchEnvelope(envelope);
  }

  close() {
    this.closed = true;
    this.remoteEnabled = false;
    window.removeEventListener("storage", this.handleStorage);
    this.channel?.removeEventListener("message", this.handleChannelMessage);
    this.channel?.close();
    this.clearConnectTimeout();
    this.clearReconnectTimer();
    if (this.remoteConnection) {
      this.remoteConnection.close();
      this.remoteConnection = null;
    }
    this.runnerConnections.forEach((connection) => {
      try {
        connection.close();
      } catch {
        // no-op
      }
    });
    this.runnerConnections.clear();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}

export function defaultSessionId(scope = "week5") {
  const normalizedScope = sanitizeSessionId(scope || "week5").replace(/-main$/, "");
  return `${normalizedScope || "week5"}-main`;
}
