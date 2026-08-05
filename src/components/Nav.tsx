import { useEffect, useState } from 'react';
import { useCart } from '@/lib/cart';
import { useClock } from '@/hooks/useClock';
import { normalizeImageUrl } from '@/lib/supabase';

const links = [
  { label: 'Shop', href: '#/shop' },
  { label: 'Upcoming', href: '#/upcoming' },
  { label: 'Lab', href: '#/lab' },
  { label: 'Admin', href: '#/admin' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { count, open: openCart } = useCart();
  const nigeria = useClock('Africa/Lagos');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          scrolled ? 'bg-paper-50/85 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 md:px-10">
          <a
            href="#/"
            data-cursor="Home"
            className="flex items-center"
          >
            <img
              src={normalizeImageUrl('images/WhatsApp_Image_2026-08-05_at_12.32.10.jpeg')}
              alt="FOHG"
              className="h-9 w-auto object-contain md:h-11"
            />
          </a>

          <ul className="hidden items-center gap-10 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  data-cursor="View"
                  className="group relative font-mono text-xs uppercase tracking-[0.22em] text-ink-700"
                >
                  {l.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-clay-500 transition-all duration-500 ease-editorial group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-5">
            <button
              onClick={openCart}
              data-cursor="Cart"
              className="relative font-mono text-xs uppercase tracking-[0.22em] text-ink-700"
            >
              Cart
              {count > 0 && (
                <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-clay-500 text-[10px] text-paper-50">
                  {count}
                </span>
              )}
            </button>

            <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500 md:flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss-500 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-moss-500" />
              </span>
              Nigeria {nigeria}
            </div>

            <button
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
              aria-label="Menu"
            >
              <span
                className={`h-px w-6 bg-ink-900 transition-transform duration-300 ${
                  open ? 'translate-y-[3.5px] rotate-45' : ''
                }`}
              />
              <span
                className={`h-px w-6 bg-ink-900 transition-transform duration-300 ${
                  open ? '-translate-y-[3.5px] -rotate-45' : ''
                }`}
              />
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-ink-900 text-paper-50 transition-transform duration-700 ease-editorial md:hidden ${
          open ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex h-full flex-col justify-center gap-2 px-8">
          {links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-serif text-5xl font-light leading-tight text-paper-50"
            >
              <span className="mr-4 font-mono text-xs align-middle text-clay-400">
                0{i + 1}
              </span>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
