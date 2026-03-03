import{d as J,S as Q}from"./sessionBus-CHWj0f0z.js";import{W as m}from"./lessonData-Bjq6eHja.js";const K=new URLSearchParams(window.location.search),Z=K.get("session")||J("week1"),I=K.get("embed")==="1",h=new Q(Z,{role:"bigscreen",remoteEnabled:!I}),g=document.querySelector("[data-testid='bigscreen-frame']"),ee=document.querySelector("[data-testid='bigscreen-count']"),B=document.querySelector("[data-testid='bigscreen-status']"),te=document.querySelector("[data-testid='bigscreen-points']"),k=document.querySelector("[data-testid='bigscreen-point-fx']"),$=document.querySelector("[data-testid='bigscreen-point-fx-label']"),v=document.querySelector("[data-testid='bigscreen-end-fx']"),D=document.querySelector("[data-testid='bigscreen-end-fx-label']"),F=document.querySelector("[data-testid='fullscreen-btn']");let l={slideIndex:0,studentPoints:0,teacherPoints:0,updatedAt:0},x=null,f=null,W=!1,M="",_="",N=0,j="";const w=new Map;let S=null;const re=1900,V=[0,1,3,2],b=[[0,1],[1,2],[2,3],[0,3]];function z(){const e=Math.min(m.length-1,Math.max(0,l.slideIndex||0)),t=m[e];if(!t)return;const r=t.screenPath;g.getAttribute("src")!==r&&g.setAttribute("src",r),ee.textContent=`${e+1} / ${m.length}`,B.textContent="Mirror Connected",B.classList.add("hot"),te.textContent=`みんな ${l.studentPoints??0} / むつみ先生 ${l.teacherPoints??0}`,t.id,G()}async function ne(){const e=document.documentElement,t=document.body,r=document;if(r.fullscreenElement||r.webkitFullscreenElement||r.mozFullScreenElement||r.msFullscreenElement){if(r.exitFullscreen){await r.exitFullscreen();return}if(r.webkitExitFullscreen){r.webkitExitFullscreen();return}r.msExitFullscreen&&r.msExitFullscreen();return}if(e.requestFullscreen){await e.requestFullscreen();return}if(e.webkitRequestFullscreen){e.webkitRequestFullscreen();return}if(t&&t.webkitRequestFullscreen){t.webkitRequestFullscreen();return}if(e.msRequestFullscreen){e.msRequestFullscreen();return}throw new Error("fullscreen not supported")}function P(){if(!F)return;const e=document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement;F.textContent=e?"全画面解除":"全画面"}function se(){if(f)return f;const e=window.AudioContext||window.webkitAudioContext;return e?(f=new e,f.state==="suspended"&&f.resume().catch(()=>{}),f):null}function oe(e){const t=se();if(!t)return;const r=t.currentTime;(e==="teacher"?[587,784,1047]:[880,1175,1568]).forEach((o,i)=>{const s=t.createOscillator(),c=t.createGain();s.type="triangle",s.frequency.setValueAtTime(o,r+i*.06),c.gain.setValueAtTime(1e-4,r+i*.06),c.gain.exponentialRampToValueAtTime(.08,r+i*.06+.01),c.gain.exponentialRampToValueAtTime(1e-4,r+i*.06+.16),s.connect(c),c.connect(t.destination),s.start(r+i*.06),s.stop(r+i*.06+.18)})}function Y(e,t,r){return`<span class="${r?"winner":"plain"}">${e}　${t}てん</span>`}function ie(){if(!v||!D)return;const e=Number(l.studentPoints??0),t=Number(l.teacherPoints??0),r=e>t,n=t>e;D.innerHTML=["けっか　はっぴょう！","",Y("みんな",e,r),Y("むつみせんせい",t,n)].join("<br>"),v.classList.remove("burst"),v.offsetWidth,v.classList.add("show","burst")}function E(e,t){!k||!$||(x&&(window.clearTimeout(x),x=null),k.classList.remove("student","teacher","correct","incorrect","active"),k.classList.add(e),k.classList.toggle("symbol",e==="correct"||e==="incorrect"),$.textContent=t,k.offsetWidth,k.classList.add("active"),!I&&(e==="student"||e==="teacher")&&oe(e),x=window.setTimeout(()=>{k.classList.remove("active","student","teacher","correct","incorrect","symbol"),x=null},re))}function O(){v&&v.classList.remove("show","burst")}function ce(e){const t=e==null?void 0:e.fxEvent;if(!(!t||typeof t!="object"||!t.id)){if(!W){M=t.id,W=!0;return}if(t.id!==M){if(M=t.id,t.kind==="student"){E("student","みんな＋１点");return}if(t.kind==="teacher"){E("teacher","むつみせんせい +1点");return}if(t.kind==="correct"){E("correct","◯");return}t.kind==="incorrect"&&E("incorrect","×")}}}function H(e){!e||typeof e!="object"||(e.updatedAt||0)<(l.updatedAt||0)||(l={...l,...e},ce(l),z())}function q(){return g&&g.contentDocument||null}function ae(e){if(!e||e.getElementById("week5-live-effects-style"))return;const t=e.head||e.body||e.documentElement;if(!t)return;const r=e.createElement("style");r.id="week5-live-effects-style",r.textContent=`
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
  `,t.appendChild(r)}function U(e){if(!e||e.kind!=="deep_compare")return 0;const t=/deep_compare_(\d+)$/.exec(e.id||"");return t?Math.min(3,Math.max(0,Number(t[1])-1)):0}function le(e){const t=q();if(!t)return;const r=Array.from(t.querySelectorAll(".flow-progress span"));if(!r.length)return;const n=e%r.length;r.forEach((o,i)=>{o.classList.toggle("live-beat",i===n)})}function ue(e){e&&(e.querySelectorAll(".flow-progress span.live-beat").forEach(t=>{t.classList.remove("live-beat")}),e.querySelectorAll(".focus-card.live-kick").forEach(t=>{t.classList.remove("live-kick")}))}function de(e,t,r){if(!e||!t||t.kind!=="rhythm")return;const n=((Number(r)||0)%16+16)%16,o=n===0||n===8;if(o){const a=`${t.id}:${n}:${_}`;if(a!==j){const p=w.get(t.id)??0;w.set(t.id,p+1),j=a}}const i=Array.from(e.querySelectorAll(".deep-item"));if(i.length>0){const a=i.length===4?V:i.map((d,R)=>R),p=w.get(t.id)??0,C=Math.floor(Math.max(0,p-1)/2)%a.length,y=a[C]??0;if(i.forEach((d,R)=>{d.classList.remove("live-kick-bump"),d.classList.toggle("live-kick",R===y)}),o){const d=i[y];d&&(d.classList.remove("live-kick-bump"),d.offsetWidth,d.classList.add("live-kick-bump"))}e.querySelectorAll(".focus-card.live-kick").forEach(d=>{d.classList.remove("live-kick")}),e.querySelectorAll(".focus-card.live-kick-bump").forEach(d=>{d.classList.remove("live-kick-bump")});return}const s=Array.from(e.querySelectorAll(".focus-card"));if(s.length<2)return;const c=w.get(t.id)??0,u=Math.floor(Math.max(0,c-1)/2)%s.length;if(s.forEach((a,p)=>{a.classList.remove("live-kick-bump"),a.classList.toggle("live-kick",p===u)}),o){const a=s[u];a&&(a.classList.remove("live-kick-bump"),a.offsetWidth,a.classList.add("live-kick-bump"))}}function fe(e,t){var c;if(!e||t.kind!=="work")return;const r=((c=l.slideInteractions)==null?void 0:c[t.id])||{},n=Number.isFinite(r.selectedChoice)?Number(r.selectedChoice):null,o=r.judgedResult==="correct"?"correct":r.judgedResult==="incorrect"?"incorrect":null,i=Array.from(e.querySelectorAll(".option-card")),s=e.querySelector(".target-large, .focus-card");s&&s.classList.remove("live-target-correct","live-target-wrong"),i.forEach((u,a)=>{u.classList.remove("live-selected","live-correct","live-wrong","live-pulse"),n!==null&&a===n&&(u.classList.add("live-selected","live-pulse"),o==="correct"?u.classList.add("live-correct"):u.classList.add("live-wrong"))}),s&&n!==null&&s.classList.add(o==="correct"?"live-target-correct":"live-target-wrong")}function me(e,t){var s;if(!e||t.kind!=="deep_step")return;const r=((s=l.slideInteractions)==null?void 0:s[t.id])||{},n=Number.isFinite(r.selectedChoice)?Number(r.selectedChoice):null,o=r.judgedResult==="correct"?"correct":r.judgedResult==="incorrect"?"incorrect":null;Array.from(e.querySelectorAll(".deep-item")).forEach((c,u)=>{c.classList.remove("live-selected","live-correct","live-wrong","live-pulse"),!(n===null||u!==n)&&(c.classList.add("live-selected","live-pulse"),o==="correct"?c.classList.add("live-correct"):o==="incorrect"&&c.classList.add("live-wrong"))})}function pe(e,t){var s;if(!e||t.kind!=="deep_compare")return;const r=((s=l.slideInteractions)==null?void 0:s[t.id])||{},n=Number.isFinite(r.subStep)?Number(r.subStep):U(t),o=b[(n%b.length+b.length)%b.length];Array.from(e.querySelectorAll(".deep-item")).forEach((c,u)=>{c.classList.remove("highlight"),c.classList.toggle("live-highlight",o.includes(u))})}function T(e){e&&e.querySelectorAll(".deep-item.live-kick").forEach(t=>{t.classList.remove("live-kick")})}function be(e,t,r){var p;if(!e||!t||t.kind!=="deep_compare"){T(e);return}const n=((p=l.slideInteractions)==null?void 0:p[t.id])||{},o=Number.isFinite(n.subStep)?Number(n.subStep):U(t),i=b[(o%b.length+b.length)%b.length],c=((Number(r)||0)%16+16)%16<8?0:1,u=i[c];Array.from(e.querySelectorAll(".deep-item")).forEach((C,y)=>{C.classList.toggle("live-kick",y===u)})}function A(e){e&&e.querySelectorAll(".option-card.live-kick").forEach(t=>{t.classList.remove("live-kick")})}function he(e,t,r){if(!e||!t||t.kind!=="work"){A(e);return}const n=Array.from(e.querySelectorAll(".option-card"));if(!n.length)return;const o=((Number(r)||0)%16+16)%16,i=Math.floor(o/4),s=n.length===4?V:n.map((u,a)=>a),c=s[i%s.length];n.forEach((u,a)=>{u.classList.toggle("live-kick",a===c)})}function X(e,t,r){if(!(!e||!t)){if(t.kind==="deep_compare"||t.kind==="work"?le(r):ue(e),t.kind==="rhythm"){de(e,t,r),A(e);return}if(t.kind==="deep_compare"){e.querySelectorAll(".focus-card.live-kick").forEach(n=>{n.classList.remove("live-kick")}),be(e,t,r),A(e);return}if(t.kind==="work"){e.querySelectorAll(".focus-card.live-kick").forEach(n=>{n.classList.remove("live-kick")}),T(e),he(e,t,r);return}T(e),A(e)}}function G(){var r;const e=q(),t=m[Math.min(m.length-1,Math.max(0,l.slideIndex||0))];if(!(!e||!t))if(ae(e),fe(e,t),me(e,t),pe(e,t),X(e,t,N),t.kind==="end"){const n=((r=l.slideInteractions)==null?void 0:r[t.id])||{};n.endRevealAt&&n.endRevealAt!==S?(ie(),S=n.endRevealAt):n.endRevealAt||(O(),S=null)}else O(),S=null}function ke(){const e=q(),t=m[Math.min(m.length-1,Math.max(0,l.slideIndex||0))];if(!(!e||!t)){if(t.kind==="work"){Array.from(e.querySelectorAll(".option-card")).forEach((n,o)=>{n.style.cursor="pointer",n.onclick=null,n.addEventListener("click",()=>{h.publishSignal("work-choice",{id:`${Date.now()}-${Math.random().toString(16).slice(2,7)}`,slideId:t.id,choiceIndex:o})})});return}t.kind==="deep_step"&&Array.from(e.querySelectorAll(".deep-item")).forEach((n,o)=>{n.style.cursor="pointer",n.onclick=null,n.addEventListener("click",()=>{h.publishSignal("deep-step-choice",{id:`${Date.now()}-${Math.random().toString(16).slice(2,7)}`,slideId:t.id,choiceIndex:o})})})}}h.onState(e=>{H(e)});h.onSignal(e=>{if(!e||e.name!=="beat"||!e.payload||e.payload.id===_)return;const t=m[Math.min(m.length-1,Math.max(0,l.slideIndex||0))];if(!t||e.payload.slideId!==t.id)return;_=e.payload.id,N=Number(e.payload.step16)||0;const r=q();r&&X(r,t,N)});const L=h.getLatestState();L!=null&&L.payload?H(L.payload):z();I&&document.body.classList.add("embed-bigscreen");g&&g.addEventListener("load",()=>{G(),ke()});I||(F&&F.addEventListener("click",()=>{ne().catch(()=>{})}),document.addEventListener("fullscreenchange",P),document.addEventListener("webkitfullscreenchange",P),P(),window.setInterval(()=>{h.publishPresence("bigscreen")},1500),h.publishPresence("bigscreen"));window.addEventListener("beforeunload",()=>{f&&(f.close().catch(()=>{}),f=null),h.close()});
