import{d as ne,S as se}from"./sessionBus-BwRge9Ne.js";import{W as p}from"./lessonData-BlxOmzWI.js";const G=new URLSearchParams(window.location.search),oe=G.get("session")||ne("week1"),ie=G.get("embed")==="1",S=ie&&window.self!==window.top,d=new se(oe,{role:"bigscreen",remoteEnabled:!S}),v=document.querySelector("[data-testid='bigscreen-frame']"),ce=document.querySelector("[data-testid='bigscreen-count']"),T=document.querySelector("[data-testid='bigscreen-status']"),ae=document.querySelector("[data-testid='bigscreen-points']"),g=document.querySelector("[data-testid='bigscreen-point-fx']"),Y=document.querySelector("[data-testid='bigscreen-point-fx-label']"),k=document.querySelector("[data-testid='bigscreen-end-fx']"),K=document.querySelector("[data-testid='bigscreen-end-fx-label']"),q=document.querySelector("[data-testid='fullscreen-btn']"),w=document.querySelector("[data-testid='bigscreen-reconnect-btn']"),_=document.querySelector("[data-testid='bigscreen-sync-chip']");let l={slideIndex:0,studentPoints:0,teacherPoints:0,updatedAt:0},x=null,m=null,V=!1,N="",D="",B=0,H="";const E=new Map;let L=null,j=d.getDiagnostics();const le=1900,J=[0,1,3,2],ue=S?0:4,h=[[0,1],[1,2],[2,3],[0,3]];function Q(){const e=Math.min(p.length-1,Math.max(0,l.slideIndex||0)),t=p[e];if(!t)return;const r=t.screenPath;v.getAttribute("src")!==r&&v.setAttribute("src",r),ce.textContent=`${e+1} / ${p.length}`,ae.textContent=`みんな ${l.studentPoints??0} / むつみ先生 ${l.teacherPoints??0}`,t.id,re(),C()}function z(e){if(!Number.isFinite(e)||e<=0)return"-";const t=Math.max(0,Math.floor((Date.now()-e)/1e3));if(t<60)return`${t}s`;const r=Math.floor(t/60),n=t%60;return`${r}m${n}s`}function de(e){switch(e){case"open":return"OK";case"loading":return"LOAD";case"restarting":return"RESTART";case"reconnecting":case"disconnected":return"RETRY";case"unavailable":return"OFF";case"error":return"ERR";case"closed":return"STOP";default:return e||"-"}}function fe(e){switch(e){case"connected":return"接続中";case"connecting":return"接続中...";case"waiting":return"待機";case"reconnecting":return"再接続";case"disabled":return"OFF";case"closed":return"停止";default:return e||"-"}}function C(){const e=j||d.getDiagnostics(),t=e.remoteState==="connected";if(T&&(T.textContent=t?"Mirror Connected":"Mirror Waiting",T.classList.toggle("hot",t)),_){const r=fe(e.remoteState),n=de(e.peerState),s=z(e.lastOutboundAt),i=z(e.lastInboundAt),o=e.lastError?` err:${e.lastError}`:"";_.textContent=`接続:${r} Peer:${n} ↑${s} ↓${i}${o}`,_.classList.toggle("hot",t)}if(w){const r=e.peerState==="loading"||e.peerState==="restarting";w.disabled=r,w.textContent=r?"再接続中...":"再接続"}}async function me(){const e=document.documentElement,t=document.body,r=document;if(r.fullscreenElement||r.webkitFullscreenElement||r.mozFullScreenElement||r.msFullscreenElement){if(r.exitFullscreen){await r.exitFullscreen();return}if(r.webkitExitFullscreen){r.webkitExitFullscreen();return}r.msExitFullscreen&&r.msExitFullscreen();return}if(e.requestFullscreen){await e.requestFullscreen();return}if(e.webkitRequestFullscreen){e.webkitRequestFullscreen();return}if(t&&t.webkitRequestFullscreen){t.webkitRequestFullscreen();return}if(e.msRequestFullscreen){e.msRequestFullscreen();return}throw new Error("fullscreen not supported")}function $(){if(!q)return;const e=document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement;q.textContent=e?"全画面解除":"全画面"}function pe(){if(m)return m;const e=window.AudioContext||window.webkitAudioContext;return e?(m=new e,m.state==="suspended"&&m.resume().catch(()=>{}),m):null}function be(e){const t=pe();if(!t)return;const r=t.currentTime;(e==="teacher"?[587,784,1047]:[880,1175,1568]).forEach((s,i)=>{const o=t.createOscillator(),c=t.createGain();o.type="triangle",o.frequency.setValueAtTime(s,r+i*.06),c.gain.setValueAtTime(1e-4,r+i*.06),c.gain.exponentialRampToValueAtTime(.08,r+i*.06+.01),c.gain.exponentialRampToValueAtTime(1e-4,r+i*.06+.16),o.connect(c),c.connect(t.destination),o.start(r+i*.06),o.stop(r+i*.06+.18)})}function U(e,t,r){return`<span class="${r?"winner":"plain"}">${e}　${t}てん</span>`}function he(){if(!k||!K)return;const e=Number(l.studentPoints??0),t=Number(l.teacherPoints??0),r=e>t,n=t>e;K.innerHTML=["けっか　はっぴょう！","",U("みんな",e,r),U("むつみせんせい",t,n)].join("<br>"),k.classList.remove("burst"),k.offsetWidth,k.classList.add("show","burst")}function A(e,t){!g||!Y||(x&&(window.clearTimeout(x),x=null),g.classList.remove("student","teacher","correct","incorrect","active"),g.classList.add(e),g.classList.toggle("symbol",e==="correct"||e==="incorrect"),Y.textContent=t,g.offsetWidth,g.classList.add("active"),!S&&(e==="student"||e==="teacher")&&be(e),x=window.setTimeout(()=>{g.classList.remove("active","student","teacher","correct","incorrect","symbol"),x=null},le))}function X(){k&&k.classList.remove("show","burst")}function ge(e){const t=e==null?void 0:e.fxEvent;if(!(!t||typeof t!="object"||!t.id)){if(!V){N=t.id,V=!0;return}if(t.id!==N){if(N=t.id,t.kind==="student"){A("student","みんな＋１点");return}if(t.kind==="teacher"){A("teacher","むつみせんせい +1点");return}if(t.kind==="correct"){A("correct","◯");return}t.kind==="incorrect"&&A("incorrect","×")}}}function Z(e){!e||typeof e!="object"||(e.updatedAt||0)<(l.updatedAt||0)||(l={...l,...e},ge(l),Q())}function M(){return v&&v.contentDocument||null}function ke(e){if(!e||e.getElementById("week5-live-effects-style"))return;const t=e.head||e.body||e.documentElement;if(!t)return;const r=e.createElement("style");r.id="week5-live-effects-style",r.textContent=`
    .option-card.live-selected {
      box-shadow: 0 0 0 4px rgba(255, 79, 125, 0.22);
      border-color: #ff4f7d !important;
    }
    .option-card.live-correct {
      box-shadow: 0 0 0 4px rgba(62, 202, 130, 0.22);
      border-color: #29b563 !important;
    }
    .option-card.live-wrong {
      box-shadow: 0 0 0 4px rgba(235, 78, 98, 0.22);
      border-color: #e24862 !important;
    }
    .option-card.live-pulse {
      animation: live-pop 420ms ease-out;
    }
    .option-card.live-kick {
      border-color: #2d7dff !important;
      box-shadow: 0 0 0 7px rgba(45, 125, 255, 0.24), 0 10px 20px rgba(19, 24, 47, 0.18);
      transform: translateY(-2px) scale(1.015);
      transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
    }
    .target-large.live-target-correct,
    .focus-card.live-target-correct {
      box-shadow: 0 0 0 5px rgba(62, 202, 130, 0.25);
    }
    .target-large.live-target-wrong,
    .focus-card.live-target-wrong {
      box-shadow: 0 0 0 5px rgba(235, 78, 98, 0.22);
    }
    .deep-item.live-highlight {
      border: 4px solid #2d7dff !important;
      box-shadow: 0 0 0 6px rgba(45, 125, 255, 0.26);
    }
    .deep-item.live-selected {
      box-shadow: 0 0 0 4px rgba(255, 79, 125, 0.22);
      border-color: #ff4f7d !important;
    }
    .deep-item.live-correct {
      box-shadow: 0 0 0 4px rgba(62, 202, 130, 0.22);
      border-color: #29b563 !important;
    }
    .deep-item.live-wrong {
      box-shadow: 0 0 0 4px rgba(235, 78, 98, 0.22);
      border-color: #e24862 !important;
    }
    .deep-item.live-pulse {
      animation: live-pop 420ms ease-out;
    }
    .deep-item.live-kick {
      border: 4px solid #2d7dff !important;
      box-shadow: 0 0 0 7px rgba(45, 125, 255, 0.34), 0 9px 18px rgba(19, 24, 47, 0.2);
      transform: translateY(-2px) scale(1.03);
      transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
      animation: live-deep-kick 180ms ease-out;
    }
    .deep-item.live-kick-bump {
      animation: live-kick-bump-deep 180ms ease-out;
    }
    .flow-progress span.live-beat {
      background: #fff38e !important;
      box-shadow: 0 0 14px rgba(255, 241, 140, 0.78);
    }
    .focus-card.live-kick {
      border: 4px solid #2d7dff !important;
      box-shadow: 0 0 0 7px rgba(45, 125, 255, 0.3), 0 12px 24px rgba(19, 24, 47, 0.2);
      transform: translateY(-2px) scale(1.015);
      transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
    }
    .focus-card.live-kick-bump {
      animation: live-kick-bump-focus 180ms ease-out;
    }
    @keyframes live-pop {
      0% { transform: scale(0.94); }
      55% { transform: scale(1.03); }
      100% { transform: scale(1); }
    }
    @keyframes live-deep-kick {
      0% { transform: scale(0.97); }
      55% { transform: scale(1.04); }
      100% { transform: scale(1); }
    }
    @keyframes live-kick-bump-deep {
      0% { transform: translateY(-2px) scale(1.03); }
      45% { transform: translateY(-2px) scale(1.09); }
      100% { transform: translateY(-2px) scale(1.03); }
    }
    @keyframes live-kick-bump-focus {
      0% { transform: translateY(-2px) scale(1.015); }
      45% { transform: translateY(-2px) scale(1.07); }
      100% { transform: translateY(-2px) scale(1.015); }
    }
  `,t.appendChild(r)}function ee(e){if(!e||e.kind!=="deep_compare")return 0;const t=/deep_compare_(\d+)$/.exec(e.id||"");return t?Math.min(3,Math.max(0,Number(t[1])-1)):0}function ve(e){const t=M();if(!t)return;const r=Array.from(t.querySelectorAll(".flow-progress span"));if(!r.length)return;const n=e%r.length;r.forEach((s,i)=>{s.classList.toggle("live-beat",i===n)})}function xe(e){e&&(e.querySelectorAll(".flow-progress span.live-beat").forEach(t=>{t.classList.remove("live-beat")}),e.querySelectorAll(".focus-card.live-kick").forEach(t=>{t.classList.remove("live-kick")}))}function we(e,t,r){if(!e||!t||t.kind!=="rhythm")return;const n=((Number(r)||0)%16+16)%16,s=n===0||n===8;if(s){const a=`${t.id}:${n}:${D}`;if(a!==H){const b=E.get(t.id)??0;E.set(t.id,b+1),H=a}}const i=Array.from(e.querySelectorAll(".deep-item"));if(i.length>0){const a=i.length===4?J:i.map((f,P)=>P),b=E.get(t.id)??0,R=Math.floor(Math.max(0,b-1)/2)%a.length,y=a[R]??0;if(i.forEach((f,P)=>{f.classList.remove("live-kick-bump"),f.classList.toggle("live-kick",P===y)}),s){const f=i[y];f&&(f.classList.remove("live-kick-bump"),f.offsetWidth,f.classList.add("live-kick-bump"))}e.querySelectorAll(".focus-card.live-kick").forEach(f=>{f.classList.remove("live-kick")}),e.querySelectorAll(".focus-card.live-kick-bump").forEach(f=>{f.classList.remove("live-kick-bump")});return}const o=Array.from(e.querySelectorAll(".focus-card"));if(o.length<2)return;const c=E.get(t.id)??0,u=Math.floor(Math.max(0,c-1)/2)%o.length;if(o.forEach((a,b)=>{a.classList.remove("live-kick-bump"),a.classList.toggle("live-kick",b===u)}),s){const a=o[u];a&&(a.classList.remove("live-kick-bump"),a.offsetWidth,a.classList.add("live-kick-bump"))}}function Se(e,t){var c;if(!e||t.kind!=="work")return;const r=((c=l.slideInteractions)==null?void 0:c[t.id])||{},n=Number.isFinite(r.selectedChoice)?Number(r.selectedChoice):null,s=r.judgedResult==="correct"?"correct":r.judgedResult==="incorrect"?"incorrect":null,i=Array.from(e.querySelectorAll(".option-card")),o=e.querySelector(".target-large, .focus-card");o&&o.classList.remove("live-target-correct","live-target-wrong"),i.forEach((u,a)=>{u.classList.remove("live-selected","live-correct","live-wrong","live-pulse"),n!==null&&a===n&&(u.classList.add("live-selected","live-pulse"),s==="correct"?u.classList.add("live-correct"):u.classList.add("live-wrong"))}),o&&n!==null&&o.classList.add(s==="correct"?"live-target-correct":"live-target-wrong")}function ye(e,t){var o;if(!e||t.kind!=="deep_step")return;const r=((o=l.slideInteractions)==null?void 0:o[t.id])||{},n=Number.isFinite(r.selectedChoice)?Number(r.selectedChoice):null,s=r.judgedResult==="correct"?"correct":r.judgedResult==="incorrect"?"incorrect":null;Array.from(e.querySelectorAll(".deep-item")).forEach((c,u)=>{c.classList.remove("live-selected","live-correct","live-wrong","live-pulse"),!(n===null||u!==n)&&(c.classList.add("live-selected","live-pulse"),s==="correct"?c.classList.add("live-correct"):s==="incorrect"&&c.classList.add("live-wrong"))})}function Ee(e,t){var o;if(!e||t.kind!=="deep_compare")return;const r=((o=l.slideInteractions)==null?void 0:o[t.id])||{},n=Number.isFinite(r.subStep)?Number(r.subStep):ee(t),s=h[(n%h.length+h.length)%h.length];Array.from(e.querySelectorAll(".deep-item")).forEach((c,u)=>{c.classList.remove("highlight"),c.classList.toggle("live-highlight",s.includes(u))})}function O(e){e&&e.querySelectorAll(".deep-item.live-kick").forEach(t=>{t.classList.remove("live-kick")})}function Le(e,t,r){var b;if(!e||!t||t.kind!=="deep_compare"){O(e);return}const n=((b=l.slideInteractions)==null?void 0:b[t.id])||{},s=Number.isFinite(n.subStep)?Number(n.subStep):ee(t),i=h[(s%h.length+h.length)%h.length],c=((Number(r)||0)%16+16)%16<8?0:1,u=i[c];Array.from(e.querySelectorAll(".deep-item")).forEach((R,y)=>{R.classList.toggle("live-kick",y===u)})}function I(e){e&&e.querySelectorAll(".option-card.live-kick").forEach(t=>{t.classList.remove("live-kick")})}function Ae(e,t,r){if(!e||!t||t.kind!=="work"){I(e);return}const n=Array.from(e.querySelectorAll(".option-card"));if(!n.length)return;const s=((Number(r)||0)%16+16)%16,i=Math.floor(s/4),o=n.length===4?J:n.map((u,a)=>a),c=o[i%o.length];n.forEach((u,a)=>{u.classList.toggle("live-kick",a===c)})}function te(e,t,r){if(!(!e||!t)){if(t.kind==="deep_compare"||t.kind==="work"?ve(r):xe(e),t.kind==="rhythm"){we(e,t,r),I(e);return}if(t.kind==="deep_compare"){e.querySelectorAll(".focus-card.live-kick").forEach(n=>{n.classList.remove("live-kick")}),Le(e,t,r),I(e);return}if(t.kind==="work"){e.querySelectorAll(".focus-card.live-kick").forEach(n=>{n.classList.remove("live-kick")}),O(e),Ae(e,t,r);return}O(e),I(e)}}function W(e){return((Number(e)||0)%16+16)%16}function Fe(e){const t=W(e==null?void 0:e.step16),r=Number(e==null?void 0:e.bpm),n=Number(e==null?void 0:e.at);if(!Number.isFinite(r)||r<=0||!Number.isFinite(n))return t;const s=Math.max(30,Math.floor(6e4/r/4)),i=Date.now()-n,o=Math.max(-s*2,Math.min(i,s*64)),c=Math.round(o/s);return W(t+c)}function re(){var r;const e=M(),t=p[Math.min(p.length-1,Math.max(0,l.slideIndex||0))];if(!(!e||!t))if(ke(e),Se(e,t),ye(e,t),Ee(e,t),te(e,t,B),t.kind==="end"){const n=((r=l.slideInteractions)==null?void 0:r[t.id])||{};n.endRevealAt&&n.endRevealAt!==L?(he(),L=n.endRevealAt):n.endRevealAt||(X(),L=null)}else X(),L=null}function Ie(){const e=M(),t=p[Math.min(p.length-1,Math.max(0,l.slideIndex||0))];if(!(!e||!t)){if(t.kind==="work"){Array.from(e.querySelectorAll(".option-card")).forEach((n,s)=>{n.style.cursor="pointer",n.onclick=null,n.addEventListener("click",()=>{d.publishSignal("work-choice",{id:`${Date.now()}-${Math.random().toString(16).slice(2,7)}`,slideId:t.id,choiceIndex:s})})});return}t.kind==="deep_step"&&Array.from(e.querySelectorAll(".deep-item")).forEach((n,s)=>{n.style.cursor="pointer",n.onclick=null,n.addEventListener("click",()=>{d.publishSignal("deep-step-choice",{id:`${Date.now()}-${Math.random().toString(16).slice(2,7)}`,slideId:t.id,choiceIndex:s})})})}}d.onState(e=>{Z(e)});d.onSignal(e=>{if(!e||e.name!=="beat"||!e.payload||e.payload.id===D)return;const t=p[Math.min(p.length-1,Math.max(0,l.slideIndex||0))];if(!t||e.payload.slideId!==t.id)return;D=e.payload.id,B=W(Fe(e.payload)+ue);const r=M();r&&te(r,t,B)});d.onDiagnostics(e=>{j=e,C()});const F=d.getLatestState();F!=null&&F.payload?Z(F.payload):Q();S&&document.body.classList.add("embed-bigscreen");v&&v.addEventListener("load",()=>{re(),Ie()});S||(w&&w.addEventListener("click",()=>{d.forceReconnect(),j=d.getDiagnostics(),C()}),q&&q.addEventListener("click",()=>{me().catch(()=>{})}),document.addEventListener("fullscreenchange",$),document.addEventListener("webkitfullscreenchange",$),$(),window.setInterval(()=>{d.publishPresence("bigscreen"),C()},1500),d.publishPresence("bigscreen"));window.addEventListener("beforeunload",()=>{m&&(m.close().catch(()=>{}),m=null),d.close()});
