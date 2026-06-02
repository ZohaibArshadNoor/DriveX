/**
 * useLenis.js
 * Place at: src/hooks/useLenis.js
 *
 * Sets up Lenis smooth scroll and integrates it with GSAP's ticker
 * so that ScrollTrigger stays in sync without a custom scrollerProxy.
 *
 * Install:  npm install @studio-freight/lenis
 *
 * Usage:
 *   const lenis = useLenis();
 *   // lenis instance available for programmatic scrolling if needed
 */
import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useLenis() {
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    /* Keep GSAP ScrollTrigger in sync */
    lenis.on('scroll', () => ScrollTrigger.update());

    /* Drive Lenis from GSAP ticker — prevents double-RAF conflicts */
    const ticker = gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    /* Disable GSAP's own lag-smoothing (Lenis already smooths) */
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(ticker);
      lenis.destroy();
    };
  }, []);

  return lenisRef;
}