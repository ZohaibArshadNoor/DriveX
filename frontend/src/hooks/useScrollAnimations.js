/**
 * useScrollAnimations.js
 * Place at: src/hooks/useScrollAnimations.js
 *
 * A reusable hook that attaches common scroll-triggered GSAP animations
 * to elements decorated with data-* attributes.
 *
 * Supported attributes:
 *   data-fade-up          — fade in + translate Y
 *   data-fade-left        — fade in + translate X (from left)
 *   data-fade-right       — fade in + translate X (from right)
 *   data-stagger-children — staggers direct children fade-up
 *   data-split-text       — character-level split reveal (requires SplitText plugin or manual split)
 *   data-parallax="N"     — vertical parallax (N = multiplier, e.g. "0.3")
 *   data-scale-reveal     — scale from 0.85 → 1
 *   data-blur-reveal      — blur from 12px → 0
 *
 * Call inside a useEffect after the DOM has mounted:
 *   const { refresh } = useScrollAnimations(containerRef);
 *
 * `refresh` can be called after dynamic content loads to re-register triggers.
 */
import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollAnimations(containerRef, deps = []) {
  const triggersRef = useRef([]);

  const killAll = useCallback(() => {
    triggersRef.current.forEach((t) => t.kill());
    triggersRef.current = [];
  }, []);

  const init = useCallback(() => {
    killAll();
    const ctx = gsap.context(() => {
      const root = containerRef?.current ?? document;

      /* ── fade-up ─────────────────────────────────────────── */
      root.querySelectorAll('[data-fade-up]').forEach((el) => {
        const delay = parseFloat(el.dataset.delay ?? '0');
        gsap.fromTo(
          el,
          { opacity: 0, y: 55 },
          {
            opacity: 1, y: 0,
            duration: 0.9,
            delay,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              once: true,
            },
          }
        );
      });

      /* ── fade-left ───────────────────────────────────────── */
      root.querySelectorAll('[data-fade-left]').forEach((el) => {
        const delay = parseFloat(el.dataset.delay ?? '0');
        gsap.fromTo(
          el,
          { opacity: 0, x: -60 },
          {
            opacity: 1, x: 0,
            duration: 0.9,
            delay,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          }
        );
      });

      /* ── fade-right ──────────────────────────────────────── */
      root.querySelectorAll('[data-fade-right]').forEach((el) => {
        const delay = parseFloat(el.dataset.delay ?? '0');
        gsap.fromTo(
          el,
          { opacity: 0, x: 60 },
          {
            opacity: 1, x: 0,
            duration: 0.9,
            delay,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          }
        );
      });

      /* ── stagger children ────────────────────────────────── */
      root.querySelectorAll('[data-stagger-children]').forEach((el) => {
        const children = Array.from(el.children);
        gsap.fromTo(
          children,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0,
            duration: 0.75,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          }
        );
      });

      /* ── scale reveal ────────────────────────────────────── */
      root.querySelectorAll('[data-scale-reveal]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.88 },
          {
            opacity: 1, scale: 1,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          }
        );
      });

      /* ── blur reveal ─────────────────────────────────────── */
      root.querySelectorAll('[data-blur-reveal]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, filter: 'blur(14px)' },
          {
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1.1,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          }
        );
      });

      /* ── parallax ────────────────────────────────────────── */
      root.querySelectorAll('[data-parallax]').forEach((el) => {
        const multiplier = parseFloat(el.dataset.parallax ?? '0.2');
        gsap.to(el, {
          yPercent: -100 * multiplier,
          ease: 'none',
          scrollTrigger: {
            trigger: el.closest('section') ?? el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      /* ── split-text (manual char split, no plugin needed) ── */
      root.querySelectorAll('[data-split-text]').forEach((el) => {
        const text  = el.innerText;
        const chars = text.split('').map((ch) => {
          const span = document.createElement('span');
          span.style.cssText = 'display:inline-block;opacity:0;transform:translateY(1em)';
          span.innerText = ch === ' ' ? '\u00A0' : ch;
          return span;
        });
        el.innerHTML = '';
        chars.forEach((s) => el.appendChild(s));
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.022,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });
    }, containerRef?.current ?? document.body);

    /* Store context for cleanup */
    triggersRef.current = [{ kill: () => ctx.revert() }];
  }, [containerRef, killAll]);

  useEffect(() => {
    init();
    return killAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { refresh: init };
}