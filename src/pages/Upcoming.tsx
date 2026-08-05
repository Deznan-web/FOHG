import { useEffect, useState } from 'react';
import { normalizeImageUrl, supabase, formatPrice, type Product } from '@/lib/supabase';
import { useReveal } from '@/hooks/useReveal';

export default function Upcoming() {
  const ref = useReveal<HTMLElement>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('status', 'upcoming')
      .order('drop_date', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setProducts(data as Product[]);
        setLoading(false);
      });
  }, []);

  return (
    <section ref={ref} className="mx-auto max-w-[1600px] px-6 pt-28 md:px-10 md:pt-40">
      <header className="mb-16 grid grid-cols-12 items-end gap-6">
        <div className="col-span-12 md:col-span-7">
          <span className="reveal font-mono text-[10px] uppercase tracking-[0.3em] text-clay-500">
            §02 — Upcoming
          </span>
          <h1 className="reveal reveal-delay-1 mt-4 font-serif text-5xl font-light leading-[0.95] tracking-tight text-ink-900 md:text-7xl">
            Coming <span className="italic">soon</span>
          </h1>
        </div>
        <div className="col-span-12 md:col-span-4 md:col-start-9">
          <p className="reveal reveal-delay-2 text-sm leading-relaxed text-ink-500">
            Drops in production now. Each release is limited — subscribe to be
            notified when they go live.
          </p>
        </div>
      </header>

      {loading ? (
        <div className="space-y-12">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-80 animate-pulse bg-ink-900/5" />
          ))}
        </div>
      ) : (
        <div className="space-y-16 md:space-y-24">
          {products.map((p, i) => (
            <UpcomingItem key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}

function UpcomingItem({ product, index }: { product: Product; index: number }) {
  const reversed = index % 2 === 1;
  const dropDate = product.drop_date
    ? new Date(product.drop_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'TBD';

  return (
    <div
      className={`reveal grid grid-cols-12 items-center gap-6 md:gap-10`}
      data-delay={index * 80}
    >
      <div
        className={`col-span-12 md:col-span-7 ${
          reversed ? 'md:col-start-6' : ''
        }`}
      >
        <div className="clip-reveal relative aspect-[16/10] overflow-hidden bg-ink-900/5">
          <img
            src={normalizeImageUrl(product.image_url)}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              if (el.src !== normalizeImageUrl('')) el.src = normalizeImageUrl('');
            }}
            className="h-full w-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-ink-900/20" />
          <span className="absolute left-4 top-4 bg-clay-500 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-paper-50">
            Drops {dropDate}
          </span>
        </div>
      </div>

      <div
        className={`col-span-12 md:col-span-4 ${
          reversed ? 'md:col-start-1 md:row-start-1' : 'md:col-start-9'
        }`}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-500">
          {product.category}
        </span>
        <h2 className="mt-3 font-serif text-3xl font-light leading-tight text-ink-900 md:text-4xl">
          {product.name}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-ink-500">
          {product.description}
        </p>
        <div className="mt-6 flex items-center gap-4">
          <span className="font-mono text-sm text-ink-700">
            {product.price_cents > 0
              ? formatPrice(product.price_cents, product.currency)
              : 'Price TBA'}
          </span>
          <span className="h-px w-8 bg-ink-900/20" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
            {product.size_options.join(' / ')}
          </span>
        </div>
      </div>
    </div>
  );
}
