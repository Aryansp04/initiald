"use client";

import { useEffect, useRef, useState } from "react";

declare global { interface Window { gsap?: any; ScrollTrigger?: any; Lenis?: any; } }

const races = [
  { no:"01", title:"HATCH / RED COUPE", pass:"AKINA PASS", distance:"5.8 KM", condition:"DRY", winner:"HATCH" },
  { no:"04", title:"WHITE / YELLOW", pass:"USUI RIDGE", distance:"6.2 KM", condition:"FOG", winner:"WHITE" },
  { no:"07", title:"DOWNHILL / UPHILL", pass:"MYOGI LINE", distance:"7.1 KM", condition:"DAMP", winner:"DOWNHILL" },
  { no:"11", title:"OLD SCHOOL / TURBO", pass:"AKAGI ROUTE", distance:"8.4 KM", condition:"COLD", winner:"OLD SCHOOL" },
];

function RoadCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=ref.current,ctx=canvas?.getContext("2d"); if(!canvas||!ctx)return;
    let raf=0,phase=0,lastY=scrollY,velocity=0;
    const resize=()=>{const dpr=Math.min(devicePixelRatio,1.5);canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;canvas.style.width=`${innerWidth}px`;canvas.style.height=`${innerHeight}px`;ctx.setTransform(dpr,0,0,dpr,0,0)};
    const draw=()=>{const w=innerWidth,h=innerHeight;velocity+=((scrollY-lastY)-velocity)*.08;lastY=scrollY;phase+=.018+Math.min(Math.abs(velocity)*.0015,.18);ctx.clearRect(0,0,w,h);
      const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,"#030303");sky.addColorStop(1,"#121212");ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
      ctx.fillStyle="#0a0a0a";ctx.beginPath();ctx.moveTo(0,h*.38);for(let x=0;x<=w;x+=50)ctx.lineTo(x,h*(.3+Math.sin(x*.009)*.08));ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();
      ctx.fillStyle="#181818";ctx.beginPath();ctx.moveTo(w*.44,h*.42);ctx.lineTo(w*.56,h*.42);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();ctx.fill();
      ctx.strokeStyle="rgba(245,245,240,.75)";ctx.lineWidth=2;for(let i=0;i<16;i++){const z=(i/16+phase)%1,y=h*.42+Math.pow(z,2)*h*.64,half=3+Math.pow(z,1.8)*w*.34;ctx.globalAlpha=z;ctx.beginPath();ctx.moveTo(w/2-half,y);ctx.lineTo(w/2-half-25*z,y+16+z*45);ctx.stroke();ctx.beginPath();ctx.moveTo(w/2+half,y);ctx.lineTo(w/2+half+25*z,y+16+z*45);ctx.stroke()}
      ctx.globalAlpha=1;ctx.fillStyle="#d90000";ctx.shadowColor="#d90000";ctx.shadowBlur=18;ctx.fillRect(w*.475,h*.47,8,4);ctx.fillRect(w*.52,h*.47,8,4);ctx.shadowBlur=0;raf=requestAnimationFrame(draw)};
    resize();addEventListener("resize",resize);draw();return()=>{cancelAnimationFrame(raf);removeEventListener("resize",resize)};
  },[]);
  return <canvas ref={ref} className="road-canvas" aria-hidden="true"/>;
}

export default function Home(){
  const [sound,setSound]=useState(false),[race,setRace]=useState(0),[speed,setSpeed]=useState(184),[page,setPage]=useState("01");
  const audio=useRef<AudioContext|null>(null);
  const blip=(type:"shift"|"hover"="hover")=>{if(!sound)return;const Ctx=window.AudioContext||(window as any).webkitAudioContext,ctx=audio.current??=new Ctx(),o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime;o.type=type==="shift"?"sawtooth":"triangle";o.frequency.setValueAtTime(type==="shift"?150:65,t);o.frequency.exponentialRampToValueAtTime(type==="shift"?55:95,t+.16);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.08,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.18);o.connect(g).connect(ctx.destination);o.start();o.stop(t+.2)};
  useEffect(()=>{
    const root=document.documentElement,cursor=document.querySelector<HTMLElement>(".cursor");let last=scrollY,velocity=0;
    const onMove=(e:MouseEvent)=>{root.style.setProperty("--mx",`${e.clientX}px`);root.style.setProperty("--my",`${e.clientY}px`);if(cursor)cursor.dataset.label=(e.target as HTMLElement).closest("[data-cursor]")?.getAttribute("data-cursor")||""};
    const onScroll=()=>{velocity+=((scrollY-last)-velocity)*.22;last=scrollY;root.style.setProperty("--velocity",String(Math.min(Math.abs(velocity),80)));setSpeed(Math.round(118+Math.min(Math.abs(velocity)*2.7,102)));const sections=[...document.querySelectorAll<HTMLElement>("[data-section]")];let nearest=sections[0];for(const section of sections)if(Math.abs(section.getBoundingClientRect().top)<Math.abs(nearest.getBoundingClientRect().top))nearest=section;setPage(nearest?.dataset.section||"01")};
    addEventListener("mousemove",onMove);addEventListener("scroll",onScroll,{passive:true});let lenis:any;
    const startMotion=()=>{if(window.Lenis){lenis=new window.Lenis({duration:1.15,smoothWheel:true});const raf=(t:number)=>{lenis?.raf(t);requestAnimationFrame(raf)};requestAnimationFrame(raf)}const gsap=window.gsap,ST=window.ScrollTrigger;if(!gsap||!ST)return;gsap.registerPlugin(ST);gsap.to(".hero-car",{xPercent:12,scale:1.08,ease:"none",scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:1}});gsap.to(".hero-copy",{xPercent:-15,ease:"none",scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:1.2}});gsap.to(".route-line",{strokeDashoffset:0,scrollTrigger:{trigger:".akina",start:"top 70%",end:"bottom 45%",scrub:1}});gsap.utils.toArray<HTMLElement>(".reveal").forEach((el)=>gsap.fromTo(el,{y:80,opacity:0},{y:0,opacity:1,duration:1,scrollTrigger:{trigger:el,start:"top 85%"}}))};
    const timer=setTimeout(startMotion,350);return()=>{clearTimeout(timer);lenis?.destroy();removeEventListener("mousemove",onMove);removeEventListener("scroll",onScroll);window.ScrollTrigger?.getAll().forEach((t:any)=>t.kill())};
  },[]);
  return <main>
    <div className="grain" aria-hidden="true"/><div className="scan" aria-hidden="true"/><div className="cursor" aria-hidden="true"/>
    <header className="header"><a href="#top" className="brand">INITIAL / D</a><span className="archive">TOUGE ARCHIVE</span><nav><a href="#driver">DRIVERS</a><a href="#car">CARS</a><a href="#akina">MOUNTAINS</a><a href="#races">RACES</a></nav><span className="counter">{page} / 10</span><button className="sound" onClick={()=>{setSound(!sound);blip("shift")}}>{sound?"SOUND ON":"SOUND OFF"}</button></header>

    <section id="top" className="hero panel" data-section="01"><img className="hero-bg" src="/hero-touge.png" alt="Original artwork of a classic Japanese hatchback drifting on a mountain road at night"/><div className="hero-vignette"/><h1 className="hero-copy"><span>INITIAL</span><b>D.</b></h1><div className="hero-car" aria-hidden="true"/><div className="hero-call"><small>THE</small><strong>MOUNTAIN</strong><strong>CALLS.</strong></div><div className="tech top"><b>01</b><span>TOUGE / AKINA</span><span>NIGHT RUN</span><span>86 / 4A-G</span></div><div className="telemetry"><span>KM/H</span><b>{speed}</b><span>RPM</span><b>8,900</b></div><a className="scroll-hint" href="#akina">SCROLL TO DESCEND <i>↓</i></a></section>

    <section id="akina" className="akina panel paper" data-section="02" data-cursor="TOUGE"><div className="section-no">02 / AKINA PASS</div><h2 className="mega reveal">AKINA.</h2><p className="vertical-title">THE MOUNTAIN ROAD.</p><svg className="route" viewBox="0 0 1000 600" aria-label="Stylized Akina downhill route"><path className="route-shadow" d="M120 75 C620 20 230 180 760 165 S260 310 820 340 S290 440 700 530"/><path className="route-line" d="M120 75 C620 20 230 180 760 165 S260 310 820 340 S290 440 700 530"/><circle className="route-car" cx="120" cy="75" r="9"/></svg><div className="akina-copy"><span>NIGHT / DOWNHILL</span><h3>THE ROAD<br/>REMEMBERS.</h3></div><div className="stats"><span>ELEVATION <b>1,200m</b></span><span>HAIRPINS <b>86</b></span><span>DISTANCE <b>5.8km</b></span></div></section>

    <section id="driver" className="driver panel" data-section="03" data-cursor="DRIVER"><img src="/driver.png" alt="Original fan-art portrait of Takumi Fujiwara driving at night"/><div className="driver-mask"/><div className="section-no">03 / DRIVER PROFILE</div><h2 className="driver-title reveal"><span>THE</span><span>DRIVER.</span></h2><p className="driver-mantra">NO SHOWBOAT.<br/>NO FEAR.</p><div className="meters"><span>REFLEX <i style={{"--fill":"96%"} as React.CSSProperties}/></span><span>TECHNIQUE <i style={{"--fill":"91%"} as React.CSSProperties}/></span><span>COURAGE <i style={{"--fill":"99%"} as React.CSSProperties}/></span></div></section>

    <section id="car" className="car panel paper" data-section="04" data-cursor="CAR"><div className="section-no">04 / MACHINE PROFILE</div><h2 className="car-number">86.</h2><div className="car-cut"><img src="/hero-touge.png" alt="Classic white and black mountain hatchback"/><span className="marker engine">ENGINE / 4A-G</span><span className="marker drive">DRIVETRAIN / FR</span><span className="marker weight">WEIGHT / 950 KG</span></div><h3 className="car-copy reveal">LIGHT.<br/>BALANCED.<br/><em>FAST.</em></h3><div className="blueprint"><b>AE86 / TRUENO</b><span>4A-GE / 1.6L</span><span>FR / 5MT</span><span>REDLINE / 8,900</span></div></section>

    <section className="rivals panel" data-section="05" data-cursor="RACE" onPointerMove={(e)=>{const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty("--px",`${(e.clientX-r.left)/r.width-.5}`)}}><div className="section-no">05 / RIVALRY</div><h2>RIVALRY.</h2><div className="rival left"><img src="/hero-touge.png" alt="White classic hatchback"/></div><div className="rival right"><img src="/hero-touge.png" alt="Red rival sports coupe interpretation"/></div><div className="versus"><b>FR</b><span>VS</span><b>FR</b></div><div className="collision"/></section>

    <section className="touge panel" data-section="06" data-cursor="TOUGE"><RoadCanvas/><div className="speed-lines"/><div className="section-no">06 / DESCENT CAMERA</div><h2 className="downhill reveal">DOWNHILL.</h2><p>NO<br/>BRAKES.</p><div className="tail-car"><i/><i/></div><div className="velocity">SCROLL VELOCITY / <b>{speed}</b></div></section>

    <section id="races" className="races panel" data-section="07"><div className="section-no">07 / BATTLE ARCHIVE</div><h2 className="race-head">RACE<br/>ARCHIVE.</h2><div className="race-list">{races.map((r,i)=><button key={r.no} onMouseEnter={()=>{setRace(i);blip()}} onFocus={()=>setRace(i)} data-cursor="RACE"><small>{r.no}</small><span>{r.title}</span><i/></button>)}</div><aside className="race-detail"><small>RACE {races[race].no}</small><h3>{races[race].pass}</h3><dl><div><dt>DISTANCE</dt><dd>{races[race].distance}</dd></div><div><dt>CONDITIONS</dt><dd>{races[race].condition}</dd></div><div><dt>WINNER</dt><dd>{races[race].winner}</dd></div></dl><div className="rpm"><i/></div></aside></section>

    <section className="speed panel paper" data-section="08"><div className="section-no">08 / ANALOG CLUSTER</div><div className="speed-stack"><b>180.</b><b>200.</b><b>220.</b></div><div className="dial"><span>0</span><span>3</span><span>6</span><span>9</span><i/></div><div className="speed-meta"><span>RPM / 8.9</span><span>GEAR / 5</span><span>G-FORCE / 1.12</span></div></section>

    <section className="night panel" data-section="09"><div className="section-no">09 / ZERO VISIBILITY</div><h2>NIGHT<br/>RUN.</h2><div className="headlights"><i/><i/></div><div className="approach-car"/><p>LISTEN FOR THE APEX.</p></section>

    <section className="culture panel paper" data-section="10"><img src="/culture.png" alt="Original Japanese mountain racing culture collage"/><div className="culture-wash"/><div className="section-no">10 / STREET CULTURE</div><h2 className="reveal">RUN<br/>THE<br/><em>NIGHT.</em></h2><p>CASSETTES / GLOVES / TIRE MARKS<br/>PARKING LOTS / VENDING LIGHT</p></section>

    <section className="final panel paper"><h2 className="reveal">THE<br/>ROAD<br/>NEVER<br/><em>ENDS.</em></h2><div className="final-meta"><b>INITIAL D</b><span>TOUGE ARCHIVE<br/>1995 — PRESENT</span></div><div className="tiny-car"/><a href="#top">BACK TO TOP ↑</a></section>
  </main>;
}
