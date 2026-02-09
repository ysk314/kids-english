const STORAGE_PREFIX = "yoji-week5-session";

function safeParse(jsonText) {
  try {
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
}

export class SessionBus {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.clientId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `client-${Math.random().toString(36).slice(2)}`;
    this.storageKey = `${STORAGE_PREFIX}:${sessionId}:state`;
    this.channelName = `${STORAGE_PREFIX}:${sessionId}:channel`;
    this.channel =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel(this.channelName)
        : null;

    this.stateHandlers = new Set();
    this.presenceHandlers = new Set();

    this.handleStorage = this.handleStorage.bind(this);
    this.handleChannelMessage = this.handleChannelMessage.bind(this);

    window.addEventListener("storage", this.handleStorage);
    this.channel?.addEventListener("message", this.handleChannelMessage);
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
  }

  publishPresence(role) {
    const envelope = {
      sender: this.clientId,
      at: Date.now(),
      type: "presence",
      role
    };
    this.channel?.postMessage(envelope);
  }

  onState(handler) {
    this.stateHandlers.add(handler);
    return () => this.stateHandlers.delete(handler);
  }

  onPresence(handler) {
    this.presenceHandlers.add(handler);
    return () => this.presenceHandlers.delete(handler);
  }

  handleStorage(event) {
    if (event.key !== this.storageKey || !event.newValue) {
      return;
    }
    const envelope = safeParse(event.newValue);
    if (!envelope || envelope.sender === this.clientId || envelope.type !== "state") {
      return;
    }
    this.stateHandlers.forEach((handler) => handler(envelope.payload));
  }

  handleChannelMessage(event) {
    const envelope = event.data;
    if (!envelope || envelope.sender === this.clientId) {
      return;
    }
    if (envelope.type === "state") {
      this.stateHandlers.forEach((handler) => handler(envelope.payload));
      return;
    }
    if (envelope.type === "presence") {
      this.presenceHandlers.forEach((handler) => handler(envelope));
    }
  }

  close() {
    window.removeEventListener("storage", this.handleStorage);
    this.channel?.removeEventListener("message", this.handleChannelMessage);
    this.channel?.close();
  }
}

export function defaultSessionId() {
  return "week5-main";
}
