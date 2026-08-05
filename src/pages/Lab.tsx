import { useEffect, useState } from 'react';
import { normalizeImageUrl, supabase, type Product } from '@/lib/supabase';
import { useReveal } from '@/hooks/useReveal';

export default function Lab() {
  const ref = useReveal<HTMLElement>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('status', 'lab')
      .order('position', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setProducts(data as Product[]);
        setLoading(false);
      });
  }, []);

  return (
    <section ref={ref} className="relative bg-ink-900 text-paper-50">
      <div className="mx-auto max-w-[1600px] px-6 pt-28 md:px-10 md:pt-40">
        <header className="mb-16 grid grid-cols-12 items-end gap-6">
          <div className="col-span-12 md:col-span-7">
            <span className="reveal font-mono text-[10px] uppercase tracking-[0.3em] text-clay-400">
              §03 — The Lab
            </span>
            <h1 className="reveal reveal-delay-1 mt-4 font-serif text-5xl font-light leading-[0.95] tracking-tight text-paper-50 md:text-7xl">
              Ideas in <span className="italic text-clay-400">progress</span>
            </h1>
          </div>
          <div className="col-span-12 md:col-span-4 md:col-start-9">
            <p className="reveal reveal-delay-2 text-sm leading-relaxed text-paper-400/70">
              Prototypes we're testing — closures, dyes, patterns. Not for sale
              yet. Some will graduate to the shop. Others stay here.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 animate-pulse bg-paper-50/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 pb-24 md:grid-cols-3 md:pb-40">
            {products.map((p, i) => (
              <LabCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function LabCard({ product, index }: { product: Product; index: number }) {
  return (
    <article
      className="reveal group relative overflow-hidden"
      data-delay={index * 100}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-paper-50/5">
        <img
          src={normalizeImageUrl(product.image_url)}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            if (el.src !== normalizeImageUrl('')) el.src = normalizeImageUrl('');
          }}
          className="h-full w-full object-cover opacity-80 grayscale transition-all duration-[1.2s] ease-editorial group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/20 to-transparent" />
        <span className="absolute left-4 top-4 border border-paper-50/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-paper-50/80">
          Prototype 0{index + 1}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-clay-400">
          {product.category}
        </span>
        <h3 className="mt-2 font-serif text-2xl font-light leading-tight text-paper-50">
          {product.name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-paper-400/70">
          {product.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {product.size_options.map((s) => (
            <span
              key={s}
              className="border border-paper-50/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-paper-400/60"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
