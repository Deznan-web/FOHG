import { useEffect, useRef } from 'react';

/**
 * Adds `is-visible` to the element (and to descendants carrying the
 * `reveal` / `word` / `clip-reveal` classes) once it scrolls into view.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(options?: {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}) {
  const ref = useRef<T | null>(null);
  const { threshold = 0.18, rootMargin = '0px 0px -8% 0px', once = true } =
    options ?? {};

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const targets: HTMLElement[] = [];
    node.querySelectorAll<HTMLElement>('.reveal, .word, .clip-reveal').forEach(
      (el) => targets.push(el),
    );
    if (node.classList.contains('reveal') || node.classList.contains('word')) {
      targets.push(node);
    }
    if (targets.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.dataset.delay;
            if (delay) el.style.transitionDelay = `${delay}ms`;
            el.classList.add('is-visible');
            if (once) io.unobserve(el);
          } else if (!once) {
            entry.target.classList.remove('is-visible');
          }
        });
      },
      { threshold, rootMargin },
    );

    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [threshold, rootMargin, once]);

  return ref;
}
