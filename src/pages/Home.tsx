import { useEffect, useState } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { supabase, formatPrice, type Product } from '@/lib/supabase';
import { useCart } from '@/lib/cart';
import { useRouter } from '@/lib/router';

export default function Home() {
  const ref = useReveal<HTMLElement>({ threshold: 0.05 });
  const { navigate } = useRouter();

  const manifesto =
    'We make garments to outlast the season — heavyweight cloth, small-batch dye, and seams that hold.';

  return (
    <section ref={ref} id="top" className="relative">
      {/* Hero */}
      <div className="mx-auto grid min-h-[100svh] max-w-[1600px] grid-cols-12 gap-6 px-6 pt-28 md:px-10 md:pt-0">
        <aside className="col-span-12 flex flex-col justify-between pt-6 md:col-span-3 md:pt-32">
          <div className="reveal flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-500">
              Est. 2026
            </span>
            <span className="h-px w-10 bg-ink-900/30" />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-500">
              Berlin
            </span>
          </div>
          <p className="reveal reveal-delay-2 max-w-[18ch] font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-ink-500">
            Garments made to outlast the season.
          </p>
        </aside>

        <div className="col-span-12 flex flex-col justify-center md:col-span-6 md:px-4">
          <h1 className="font-serif text-[15vw] font-light leading-[0.86] tracking-[-0.02em] text-ink-900 md:text-[10.5vw]">
            <span className="block overflow-hidden">
              <span className="reveal block">Form</span>
            </span>
            <span className="block overflow-hidden pl-[12%]">
              <span className="reveal reveal-delay-1 block italic text-clay-500">
                follows
              </span>
            </span>
            <span className="block overflow-hidden pl-[4%]">
              <span className="reveal reveal-delay-2 block">cloth.</span>
            </span>
          </h1>
        </div>

        <div className="relative col-span-12 flex items-end justify-end md:col-span-3">
          <div className="clip-reveal relative mb-10 aspect-[3/4] w-full max-w-[260px] overflow-hidden">
            <img
              src="https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=700"
              alt="Model wearing heavyweight hoodie."
              className="h-full w-full object-cover grayscale"
              loading="eager"
            />
            <div className="absolute inset-0 bg-ink-900/10" />
          </div>

          <div
            className="absolute right-0 top-2 h-28 w-28 animate-spin-slow md:top-24"
            data-cursor="Shop"
            onClick={() => navigate('/shop')}
          >
            <svg viewBox="0 0 100 100" className="h-full w-full cursor-pointer">
              <defs>
                <path
                  id="seal"
                  d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                />
              </defs>
              <text className="fill-ink-700 font-mono text-[7.5px] uppercase tracking-[0.18em]">
                <textPath href="#seal">
                  Shop the collection · FOHG · 2026 ·
                </textPath>
              </text>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-clay-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Manifesto */}
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <p className="reveal mx-auto max-w-3xl text-center font-serif text-xl font-light italic leading-relaxed text-ink-700 md:text-2xl">
          {manifesto.split(' ').map((w, i) => (
            <span key={i} className="word" data-delay={i * 45}>
              {w}{' '}
            </span>
          ))}
        </p>
      </div>

      {/* Featured products */}
      <FeaturedProducts />

      {/* Marquee */}
      <section className="marquee-track relative overflow-hidden border-y hairline border-ink-900/10 bg-paper-100 py-6">
        <div className="flex w-max animate-marquee">
          {[...Array(2)].flatMap((_, dup) =>
            ['Heavyweight', '✦', 'Small-batch', '✦', 'Made to last', '✦', 'Plant-dyed', '✦', 'Berlin', '✦'].map((t, i) => (
              <span
                key={`${dup}-${i}`}
                className="mx-8 font-serif text-3xl font-light text-ink-800 md:text-5xl"
              >
                {t}
              </span>
            )),
          )}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-paper-100 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-paper-100 to-transparent" />
      </section>

      {/* Principles */}
      <Principles />
    </section>
  );
}

function FeaturedProducts() {
  const ref = useReveal<HTMLElement>();
  const [products, setProducts] = useState<Product[]>([]);
  const { addItem } = useCart();
  const { navigate } = useRouter();

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('status', 'available')
      .order('position', { ascending: true })
      .limit(4)
      .then(({ data }) => {
        if (data) setProducts(data as Product[]);
      });
  }, []);

  return (
    <section ref={ref} className="mx-auto max-w-[1600px] px-6 py-24 md:px-10 md:py-32">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <span className="reveal font-mono text-[10px] uppercase tracking-[0.3em] text-clay-500">
            §01 — Available now
          </span>
          <h2 className="reveal reveal-delay-1 mt-4 font-serif text-4xl font-light tracking-tight text-ink-900 md:text-6xl">
            The collection
          </h2>
        </div>
        <a
          href="#/shop"
          data-cursor="View all"
          className="hidden font-mono text-xs uppercase tracking-[0.2em] text-clay-500 md:block"
        >
          View all →
        </a>
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
        {products.map((p, i) => (
          <article
            key={p.id}
            className="reveal group cursor-pointer"
            data-delay={i * 60}
            data-cursor="View"
            onClick={() => navigate('/shop')}
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-ink-900/5">
              <img
                src={
                  p.image_url
                    ? p.image_url.startsWith('/')
                      ? import.meta.env.BASE_URL + p.image_url.slice(1)
                      : p.image_url
                    : ''
                }
                alt={p.name}
                loading="lazy"
                className="h-full w-full object-cover grayscale transition-all duration-[1.2s] ease-editorial group-hover:grayscale-0 group-hover:scale-[1.04]"
              />
            </div>
            <div className="mt-3 flex items-start justify-between gap-2">
              <h3 className="font-serif text-base font-light leading-tight text-ink-900">
                {p.name}
              </h3>
              <span className="font-mono text-xs text-ink-700">
                {formatPrice(p.price_cents, p.currency)}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Principles() {
  const ref = useReveal<HTMLElement>();
  const principles = [
    { no: 'i', title: 'Heavyweight', body: 'We start at 320gsm. The cloth has to feel like something in your hand.' },
    { no: 'ii', title: 'Small-batch', body: 'Every color is dyed in runs of 50 or fewer. No two garments are identical.' },
    { no: 'iii', title: 'Repairable', body: 'Every garment comes with a lifetime repair guarantee. We mend what we make.' },
  ];

  return (
    <section ref={ref} className="mx-auto max-w-[1600px] px-6 py-24 md:px-10 md:py-40">
      <div className="mb-16 flex items-center gap-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-clay-500">
          §02 — Principles
        </span>
        <span className="h-px flex-1 bg-ink-900/15" />
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-500">
          Three laws
        </span>
      </div>

      <div className="grid grid-cols-12 gap-x-6 gap-y-16">
        {principles.map((p, i) => (
          <div
            key={p.no}
            className={`reveal col-span-12 md:col-span-4 ${
              i === 1 ? 'md:mt-24' : i === 2 ? 'md:mt-48' : ''
            }`}
            data-delay={i * 120}
          >
            <span className="font-serif text-6xl italic font-light text-clay-500/40">
              {p.no}.
            </span>
            <h3 className="mt-4 font-serif text-3xl font-light text-ink-900 md:text-4xl">
              {p.title}
            </h3>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500">
              {p.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
