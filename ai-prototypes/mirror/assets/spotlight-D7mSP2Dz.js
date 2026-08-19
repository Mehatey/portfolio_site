import"./modulepreload-polyfill-B5Qt9EMX.js";import{b as y,i as b}from"./characters-YN7HJd80.js";const t=document.querySelector("#spotlight-root"),r=y();t.innerHTML=`
  <section class="spotlight">
    <canvas class="spotlight-canvas" aria-hidden="true"></canvas>
    <div class="atmosphere" aria-hidden="true"></div>

    <header class="brand">MIRROR</header>

    <div class="identity" aria-live="polite">
      <p class="scene"></p>
      <h1></h1>
      <p class="role"></p>
    </div>

    <nav class="personality-rail" aria-label="Choose a personality">
      ${r.map((n,e)=>`
        <button type="button" data-index="${e}" aria-label="Show ${n.name}">
          <span class="marker" style="--tone:${n.colorA}"></span>
          <span>${n.name}</span>
        </button>
      `).join("")}
    </nav>

    <p class="counter"><span>01</span> / 05</p>
  </section>
`;const w=t.querySelector(".spotlight-canvas"),f=t.querySelector(".identity h1"),g=t.querySelector(".role"),S=t.querySelector(".scene"),L=t.querySelector(".counter span"),p=[...t.querySelectorAll(".personality-rail button")];let a=null,s=0,l=0,u=0,v=performance.now();function c(n){s=(n+r.length)%r.length;const e=r[s];v=performance.now(),t.style.setProperty("--tone",e.colorA),t.style.setProperty("--tone-soft",e.colorB),t.classList.remove("identity-visible"),window.setTimeout(()=>{f.textContent=e.name,g.textContent=e.tagline,S.textContent=e.sceneLabel,L.textContent=String(s+1).padStart(2,"0"),p.forEach((o,i)=>{const d=i===s;o.classList.toggle("is-active",d),o.setAttribute("aria-current",d?"true":"false")}),t.classList.add("identity-visible")},180),a?.setProfile(e)}function h(){window.clearInterval(l),l=window.setInterval(()=>c(s+1),5200)}p.forEach((n,e)=>{n.addEventListener("click",()=>{c(e),h()})});function m(n=performance.now()){const e=(n-v)/1e3,o=(Math.sin(e*1.35)+1)*.5,i=(Math.sin(e*3.1)+Math.sin(e*1.7+.7)+2)*.25;a?.setSpeaking(e>1.1&&e<4.35),a?.setMouth((o*.32+i*.68)*(e>1.1&&e<4.35?.86:.08)),u=requestAnimationFrame(m)}async function E(){if(!("gpu"in navigator)){t.innerHTML='<p class="unsupported">MIRROR needs a WebGPU-capable browser.</p>';return}a=await b(w),a.start(),c(0),h(),m(),t.classList.add("is-ready")}window.addEventListener("resize",()=>a?.resize());window.addEventListener("pagehide",()=>{window.clearInterval(l),cancelAnimationFrame(u),a?.dispose()});E();
