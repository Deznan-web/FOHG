import { useEffect, useRef, useState } from 'react';

/**
 * A two-part custom cursor: a small dot that tracks the pointer 1:1, and a
 * larger ring that lags behind with spring easing. The ring scales and labels
 * itself when hovering elements marked with `data-cursor="..."`.
 *
 * On dark-background pages (e.g. the Lab) the cursor inverts to light tones
 * so it stays visible.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [label, setLabel] = useState<string>('');
  const [active, setActive] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // Skip on touch / coarse pointers.
    if (!window.matchMedia('(pointer: fine)').matches) return;

    document.body.classList.add('custom-cursor');
    setHidden(false);

    const checkDark = () => {
      const route = window.location.hash.replace(/^#/, '') || '/';
      setDark(route === '/lab');
    };
    checkDark();
    window.addEventListener('hashchange', checkDark);

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: pos.x, y: pos.y };
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      }
      const target = (e.target as HTMLElement)?.closest<HTMLElement>(
        '[data-cursor]',
      );
      if (target) {
        setLabel(target.dataset.cursor ?? '');
        setActive(true);
      } else {
        setLabel('');
        setActive(false);
      }
    };

    const onLeave = () => setHidden(true);
    const onEnter = () => setHidden(false);

    const tick = () => {
      ring.x += (pos.x - ring.x) * 0.16;
      ring.y += (pos.y - ring.y) * 0.16;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('hashchange', checkDark);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      document.body.classList.remove('custom-cursor');
    };
  }, []);

  if (hidden) return null;

  const dotColor = dark ? 'bg-paper-50' : 'bg-ink-900';
  const ringBorder = dark
    ? active
      ? 'border-clay-400/80'
      : 'border-paper-50/60'
    : active
      ? 'border-clay-500/70'
      : 'border-ink-900/60';
  const ringBg = dark
    ? active
      ? 'bg-clay-400/10'
      : 'bg-transparent'
    : active
      ? 'bg-clay-500/10'
      : 'bg-transparent';
  const labelColor = dark ? 'text-paper-50' : 'text-ink-900';

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      <div
        ref={dotRef}
        className={`fixed left-0 top-0 h-1.5 w-1.5 rounded-full ${dotColor} mix-blend-difference`}
      />
      <div
        ref={ringRef}
        className={`fixed left-0 top-0 flex items-center justify-center rounded-full border transition-[width,height,background-color,border-color] duration-300 ease-editorial ${ringBorder} ${ringBg} ${
          active ? 'h-20 w-20' : 'h-8 w-8'
        }`}
      >
        {label && (
          <span className={`font-mono text-[9px] uppercase tracking-[0.2em] ${labelColor}`}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
