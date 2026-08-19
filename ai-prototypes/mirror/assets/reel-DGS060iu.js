import"./modulepreload-polyfill-B5Qt9EMX.js";import{b as y,i as E}from"./characters-YN7HJd80.js";const r=document.querySelector("#reel-root"),l=y();r.innerHTML=`
  <section class="ensemble" aria-label="Five personalities, five particle worlds">
    ${l.map((e,t)=>`
      <button
        class="world"
        data-index="${t}"
        type="button"
        aria-label="Focus ${e.name}, ${e.tagline}"
        style="--accent:${e.colorA}; --accent-soft:${e.colorB}"
      >
        <canvas aria-hidden="true"></canvas>
        <span class="world-shade" aria-hidden="true"></span>
        <span class="identity">
          <strong>${e.name}</strong>
        </span>
      </button>
    `).join("")}

    <header class="reel-lockup">
      <span>MIRROR</span>
      <h1>Five personalities.<br />Five particle worlds.</h1>
    </header>

    <p class="reel-hint">Select a world</p>
  </section>
`;const d=[...r.querySelectorAll(".world")],c=[];let n=-1,w=0,i=0,p=0;const F=performance.now();function h(e,t=!0){n=t&&n===e?-1:e,r.classList.toggle("has-focus",n>=0),d.forEach((s,a)=>{const o=a===n;s.classList.toggle("is-focused",o),s.setAttribute("aria-pressed",String(o))})}d.forEach((e,t)=>{e.addEventListener("click",()=>{window.clearInterval(i),h(t),window.setTimeout(m,12e3)})});function m(){window.clearInterval(i),i=window.setInterval(()=>{h(p%l.length,!1),p+=1},4200)}async function L(){if(!("gpu"in navigator)){r.innerHTML='<p class="unsupported">MIRROR needs a WebGPU-capable browser.</p>';return}await Promise.all(d.map(async(e,t)=>{const s=e.querySelector("canvas"),a=await E(s);a.setProfile(l[t]),a.start(),c[t]=a})),r.classList.add("is-ready"),window.setTimeout(m,2200),f()}function f(e=performance.now()){const t=(e-F)/1e3;c.forEach((s,a)=>{const o=a*.82,v=(Math.sin(t*.92+o)+1)*.5,b=(Math.sin(t*2.1+o*1.7)+1)*.5,u=n<0?.72:n===a?1:.2,g=Math.pow(v*.68+b*.32,1.5)*u;s.setSpeaking(u>.45),s.setMouth(g),s.setThinking(n>=0&&n!==a)}),w=requestAnimationFrame(f)}window.addEventListener("resize",()=>c.forEach(e=>e.resize()));window.addEventListener("pagehide",()=>{window.clearInterval(i),cancelAnimationFrame(w),c.forEach(e=>e.dispose())});L();
