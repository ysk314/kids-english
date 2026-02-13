import{d as H,S as K,W as u}from"./sessionBus-BN4ixBh7.js";const B=new URLSearchParams(window.location.search),O=B.get("session")||H(),w=B.get("embed")==="1",p=new K(O,{role:"bigscreen",remoteEnabled:!w}),h=document.querySelector("[data-testid='bigscreen-frame']"),Y=document.querySelector("[data-testid='bigscreen-count']"),q=document.querySelector("[data-testid='bigscreen-status']"),G=document.querySelector("[data-testid='bigscreen-points']"),m=document.querySelector("[data-testid='bigscreen-point-fx']"),C=document.querySelector("[data-testid='bigscreen-point-fx-label']"),b=document.querySelector("[data-testid='bigscreen-end-fx']"),P=document.querySelector("[data-testid='bigscreen-end-fx-label']"),y=document.querySelector("[data-testid='fullscreen-btn']");let o={slideIndex:0,studentPoints:0,teacherPoints:0,updatedAt:0},g=null,l=null,R=!1,E="",M="",F=0,x=null;const d=[[0,1],[1,2],[2,3],[0,3]];function _(){const e=Math.min(u.length-1,Math.max(0,o.slideIndex||0)),t=u[e];if(!t)return;const r=t.screenPath;h.getAttribute("src")!==r&&h.setAttribute("src",r),Y.textContent=`${e+1} / ${u.length}`,q.textContent="Mirror Connected",q.classList.add("hot"),G.textContent=`みんな ${o.studentPoints??0} / むつみ先生 ${o.teacherPoints??0}`,t.id,V()}async function U(){const e=document.documentElement,t=document.body,r=document;if(r.fullscreenElement||r.webkitFullscreenElement||r.mozFullScreenElement||r.msFullscreenElement){if(r.exitFullscreen){await r.exitFullscreen();return}if(r.webkitExitFullscreen){r.webkitExitFullscreen();return}r.msExitFullscreen&&r.msExitFullscreen();return}if(e.requestFullscreen){await e.requestFullscreen();return}if(e.webkitRequestFullscreen){e.webkitRequestFullscreen();return}if(t&&t.webkitRequestFullscreen){t.webkitRequestFullscreen();return}if(e.msRequestFullscreen){e.msRequestFullscreen();return}throw new Error("fullscreen not supported")}function L(){if(!y)return;const e=document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement;y.textContent=e?"全画面解除":"全画面"}function J(){if(l)return l;const e=window.AudioContext||window.webkitAudioContext;return e?(l=new e,l.state==="suspended"&&l.resume().catch(()=>{}),l):null}function Q(e){const t=J();if(!t)return;const r=t.currentTime;(e==="teacher"?[587,784,1047]:[880,1175,1568]).forEach((a,s)=>{const c=t.createOscillator(),i=t.createGain();c.type="triangle",c.frequency.setValueAtTime(a,r+s*.06),i.gain.setValueAtTime(1e-4,r+s*.06),i.gain.exponentialRampToValueAtTime(.08,r+s*.06+.01),i.gain.exponentialRampToValueAtTime(1e-4,r+s*.06+.16),c.connect(i),i.connect(t.destination),c.start(r+s*.06),c.stop(r+s*.06+.18)})}function T(e,t,r){return`<span class="${r?"winner":"plain"}">${e}　${t}てん</span>`}function X(){if(!b||!P)return;const e=Number(o.studentPoints??0),t=Number(o.teacherPoints??0),r=e>t,n=t>e;P.innerHTML=["けっか　はっぴょう！","",T("みんな",e,r),T("むつみせんせい",t,n)].join("<br>"),b.classList.remove("burst"),b.offsetWidth,b.classList.add("show","burst")}function v(e,t){!m||!C||(g&&(window.clearTimeout(g),g=null),m.classList.remove("student","teacher","correct","incorrect","active"),m.classList.add(e),m.classList.toggle("symbol",e==="correct"||e==="incorrect"),C.textContent=t,m.offsetWidth,m.classList.add("active"),!w&&(e==="student"||e==="teacher")&&Q(e),g=window.setTimeout(()=>{m.classList.remove("active","student","teacher","correct","incorrect","symbol"),g=null},1150))}function N(){b&&b.classList.remove("show","burst")}function Z(e){const t=e==null?void 0:e.fxEvent;if(!(!t||typeof t!="object"||!t.id)){if(!R){E=t.id,R=!0;return}if(t.id!==E){if(E=t.id,t.kind==="student"){v("student","みんな +1");return}if(t.kind==="teacher"){v("teacher","むつみせんせい +1");return}if(t.kind==="correct"){v("correct","◯");return}t.kind==="incorrect"&&v("incorrect","×")}}}function $(e){!e||typeof e!="object"||(e.updatedAt||0)<(o.updatedAt||0)||(o={...o,...e},Z(o),_())}function S(){return h&&h.contentDocument||null}function ee(e){if(!e||e.getElementById("week5-live-effects-style"))return;const t=e.createElement("style");t.id="week5-live-effects-style",t.textContent=`
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
    .target-large.live-target-correct,
    .focus-card.live-target-correct {
      box-shadow: 0 0 0 5px rgba(62, 202, 130, 0.25);
    }
    .target-large.live-target-wrong,
    .focus-card.live-target-wrong {
      box-shadow: 0 0 0 5px rgba(235, 78, 98, 0.22);
    }
    .deep-item.live-highlight {
      border-color: #ff4f7d !important;
      box-shadow: 0 0 0 4px rgba(255, 79, 125, 0.24);
    }
    .deep-item.live-kick {
      border-color: #ff8aa6 !important;
      box-shadow: 0 0 0 5px rgba(255, 138, 166, 0.34), 0 9px 18px rgba(19, 24, 47, 0.2);
      transform: translateY(-2px) scale(1.03);
      transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
      animation: live-deep-kick 180ms ease-out;
    }
    .flow-progress span.live-beat {
      background: #fff38e !important;
      box-shadow: 0 0 14px rgba(255, 241, 140, 0.78);
    }
    .focus-card.live-kick {
      border-color: #ffd95a !important;
      box-shadow: 0 0 0 5px rgba(255, 217, 90, 0.28), 0 12px 24px rgba(19, 24, 47, 0.2);
      transform: translateY(-2px) scale(1.015);
      transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
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
  `,e.head.appendChild(t)}function D(e){if(!e||e.kind!=="deep_compare")return 0;const t=/deep_compare_(\d+)$/.exec(e.id||"");return t?Math.min(3,Math.max(0,Number(t[1])-1)):0}function te(e){const t=S();if(!t)return;const r=Array.from(t.querySelectorAll(".flow-progress span"));if(!r.length)return;const n=e%r.length;r.forEach((a,s)=>{a.classList.toggle("live-beat",s===n)})}function re(e){e&&(e.querySelectorAll(".flow-progress span.live-beat").forEach(t=>{t.classList.remove("live-beat")}),e.querySelectorAll(".focus-card.live-kick").forEach(t=>{t.classList.remove("live-kick")}))}function ne(e,t,r){if(!e||!t||t.kind!=="rhythm")return;if(t.id.includes("rhythm_summary")){e.querySelectorAll(".focus-card.live-kick").forEach(s=>{s.classList.remove("live-kick")});return}const n=Array.from(e.querySelectorAll(".focus-card"));if(n.length<2)return;const a=r<8?0:1;n.forEach((s,c)=>{s.classList.toggle("live-kick",c===a)})}function se(e,t){var c;if(!e||t.kind!=="work")return;const r=((c=o.slideInteractions)==null?void 0:c[t.id])||{},n=Number.isFinite(r.selectedChoice)?Number(r.selectedChoice):null,a=Array.from(e.querySelectorAll(".option-card")),s=e.querySelector(".target-large, .focus-card");s&&s.classList.remove("live-target-correct","live-target-wrong"),a.forEach((i,f)=>{i.classList.remove("live-selected","live-correct","live-wrong","live-pulse"),n!==null&&(f===n&&i.classList.add("live-selected","live-pulse"),f===t.correctIndex&&i.classList.add("live-correct"),f===n&&n!==t.correctIndex&&i.classList.add("live-wrong"))}),s&&n!==null&&s.classList.add(n===t.correctIndex?"live-target-correct":"live-target-wrong")}function oe(e,t){var c;if(!e||t.kind!=="deep_compare")return;const r=((c=o.slideInteractions)==null?void 0:c[t.id])||{},n=Number.isFinite(r.subStep)?Number(r.subStep):D(t),a=d[(n%d.length+d.length)%d.length];Array.from(e.querySelectorAll(".deep-item")).forEach((i,f)=>{i.classList.remove("highlight"),i.classList.toggle("live-highlight",a.includes(f))})}function A(e){e&&e.querySelectorAll(".deep-item.live-kick").forEach(t=>{t.classList.remove("live-kick")})}function ie(e,t,r){var I;if(!e||!t||t.kind!=="deep_compare"){A(e);return}const n=((I=o.slideInteractions)==null?void 0:I[t.id])||{},a=Number.isFinite(n.subStep)?Number(n.subStep):D(t),s=d[(a%d.length+d.length)%d.length],i=((Number(r)||0)%16+16)%16<8?0:1,f=s[i];Array.from(e.querySelectorAll(".deep-item")).forEach((j,z)=>{j.classList.toggle("live-kick",z===f)})}function W(e,t,r){if(!(!e||!t)){if(t.kind==="rhythm"||t.kind==="deep_compare"?te(r):re(e),t.kind==="rhythm"){ne(e,t,r),A(e);return}if(t.kind==="deep_compare"){e.querySelectorAll(".focus-card.live-kick").forEach(n=>{n.classList.remove("live-kick")}),ie(e,t,r);return}A(e)}}function V(){var r;const e=S(),t=u[Math.min(u.length-1,Math.max(0,o.slideIndex||0))];if(!(!e||!t))if(ee(e),se(e,t),oe(e,t),W(e,t,F),t.kind==="end"){const n=((r=o.slideInteractions)==null?void 0:r[t.id])||{};n.endRevealAt&&n.endRevealAt!==x?(X(),x=n.endRevealAt):n.endRevealAt||(N(),x=null)}else N(),x=null}function ce(){const e=S(),t=u[Math.min(u.length-1,Math.max(0,o.slideIndex||0))];if(!e||!t||t.kind!=="work")return;Array.from(e.querySelectorAll(".option-card")).forEach((n,a)=>{n.style.cursor="pointer",n.onclick=null,n.addEventListener("click",()=>{p.publishSignal("work-choice",{id:`${Date.now()}-${Math.random().toString(16).slice(2,7)}`,slideId:t.id,choiceIndex:a})})})}p.onState(e=>{$(e)});p.onSignal(e=>{if(!e||e.name!=="beat"||!e.payload||e.payload.id===M)return;const t=u[Math.min(u.length-1,Math.max(0,o.slideIndex||0))];if(!t||e.payload.slideId!==t.id)return;M=e.payload.id,F=Number(e.payload.step16)||0;const r=S();r&&W(r,t,F)});const k=p.getLatestState();k!=null&&k.payload?$(k.payload):_();w&&document.body.classList.add("embed-bigscreen");h&&h.addEventListener("load",()=>{V(),ce()});w||(y&&y.addEventListener("click",()=>{U().catch(()=>{})}),document.addEventListener("fullscreenchange",L),document.addEventListener("webkitfullscreenchange",L),L(),window.setInterval(()=>{p.publishPresence("bigscreen")},1500),p.publishPresence("bigscreen"));window.addEventListener("beforeunload",()=>{l&&(l.close().catch(()=>{}),l=null),p.close()});
