'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
gsap.registerPlugin(ScrollTrigger);
const MotionContext = createContext(false);
export function MotionProvider({ children }: { children: React.ReactNode }) { const [reduced, setReduced] = useState(true); useEffect(() => { const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; setReduced(prefersReduced); if (prefersReduced) return; const lenis = new Lenis({ autoRaf: false }); const onScroll = () => ScrollTrigger.update(); const tick = (time: number) => lenis.raf(time * 1000); lenis.on('scroll', onScroll); gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0); return () => { lenis.off('scroll', onScroll); gsap.ticker.remove(tick); lenis.destroy(); }; }, []); return <MotionContext.Provider value={!reduced}>{children}</MotionContext.Provider>; }
export function useGsapSection(ref: React.RefObject<HTMLElement>) { const motion = useContext(MotionContext); useEffect(() => { if (!ref.current) return; const ctx = gsap.context(() => { const mm = gsap.matchMedia(); mm.add('(prefers-reduced-motion: no-preference)', () => { if (motion) gsap.fromTo(ref.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: ref.current, start: 'top 85%' } }); }); return () => mm.revert(); }, ref); return () => ctx.revert(); }, [motion, ref]); }
