'use client';

import { useEffect, useState } from 'react';
import { images } from '../data/images';

const featuredDestinations = [
  { place: 'Ladakh', state: 'Ladakh', region: 'North', image: images['ladakh-pangong-tso-ladakh'].file, tag: 'High altitude / silence' },
  { place: 'Meghalaya', state: 'Meghalaya', region: 'Northeast', image: images['meghalaya-cherrapunji-waterfall'].file, tag: 'Rain / living roots' },
  { place: 'Kerala', state: 'Kerala', region: 'South', image: images['kerala-alleppey-backwaters'].file, tag: 'Backwaters / green' },
];

export default function Home() {
  const [intro, setIntro] = useState(true);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (sessionStorage.getItem('dzonga-intro-seen') || reduced) { setIntro(false); return; }
    const timer = window.setTimeout(() => { sessionStorage.setItem('dzonga-intro-seen', '1'); setIntro(false); document.getElementById('top')?.focus(); }, 6500);
    return () => window.clearTimeout(timer);
  }, []);
  const skip = () => { sessionStorage.setItem('dzonga-intro-seen', '1'); setIntro(false); document.getElementById('top')?.focus(); };
  return <main>
    {intro && <section className="intro" aria-label="DZÖNGA introduction">
      <div className="intro-copy">Every place holds<br /><em>a treasure.</em></div>
      <div className="peaks"><i>Places</i><i>Culture</i><i>Food</i><i>Nature</i><i>Stories</i></div>
      <button className="skip" onClick={skip}>Skip intro <span>↗</span></button>
    </section>}
    <nav className="nav"><a className="wordmark" href="#top">DZ<span>Ö</span>NGA <b></b></a><div className="nav-right"><a href="#explore">Explore</a><button onClick={() => setMenu(true)} aria-label="Open menu">Menu <span className="menu-icon">↗</span></button></div></nav>
    {menu && <div className="menu-overlay"><button className="close" onClick={() => setMenu(false)}>Close ×</button><p className="eyebrow">Five treasures</p><div className="menu-links">{['Places','Culture','Food','Nature','Stories'].map((x,i)=><a href="#explore" onClick={() => setMenu(false)} key={x}><small>0{i+1}</small>{x}</a>)}</div><p className="menu-footer">An atlas for the curious.<br />India, in all its wonder.</p></div>}
    <section id="top" tabIndex={-1} className="hero dark"><div className="hero-kicker">A living atlas of India <span>—</span> 01 / 05</div><h1>Five treasures.<br /><em>Infinite India.</em></h1><p className="hero-intro">A slow journey through the places, cultures, flavours, landscapes and stories that make this country impossible to hold in one frame.</p><a className="circle-link" href="#explore">Begin exploring <span>↓</span></a><div className="hero-image" style={{ backgroundImage: `url(${images['ladakh-pangong-tso-ladakh'].file})` }} /> <div className="scroll-note">Scroll to wander <span>↓</span></div></section>
    <section className="manifesto"><p className="eyebrow">The idea</p><h2>Not a checklist.<br /><em>A deeper way in.</em></h2><div className="manifesto-copy"><p>India is not one story. It is a chorus of thousands: a mountain pass at dawn, a recipe carried across generations, a monsoon that changes the air.</p><p>DZÖNGA is a destination storytelling platform for finding your way into those stories — with care, context and curiosity.</p></div></section>
    <section id="explore" className="explore"><div className="section-top"><p className="eyebrow">Start anywhere</p><a href="/destinations/ladakh">View all places ↗</a></div><h2>Where will you<br /><em>go next?</em></h2><div className="cards">{featuredDestinations.map((d,i)=><article className={`place-card card-${i}`} key={d.place}><a href={i===0?'/destinations/ladakh':'#explore'}><div className="place-image" style={{backgroundImage:`url(${d.image})`}}><span className="card-number">0{i+1}</span><span className="card-arrow">↗</span></div><div className="card-meta"><div><h3>{d.place}</h3><p>{d.state} · {d.region}</p></div><span>{d.tag}</span></div></a></article>)}</div></section>
    <section className="treasures dark"><p className="eyebrow">The five treasures</p><h2>Every place<br /><em>has many doors.</em></h2><div className="treasure-list">{['Places','Culture','Food','Nature','Stories'].map((x,i)=><a href="#explore" key={x}><span>0{i+1}</span><strong>{x}</strong><i>↗</i></a>)}</div></section>
    <footer className="footer dark"><a className="wordmark" href="#top">DZ<span>Ö</span>NGA <b></b></a><p>Five treasures. Infinite India.</p><div><a href="#explore">Explore</a><a href="#top">About</a><a href="/credits">Credits</a></div></footer>
  </main>;
}
