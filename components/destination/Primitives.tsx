'use client';
import { useRef } from 'react';
import { useGsapSection } from '../motion/MotionProvider';
export function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) { const ref = useRef<HTMLElement>(null); useGsapSection(ref); return <section ref={ref} className={className}>{children}</section>; }
export function SplitHeading({ children }: { children: React.ReactNode }) { return <>{children}</>; }
