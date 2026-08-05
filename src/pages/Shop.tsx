import { useEffect, useState } from 'react';
import { supabase, formatPrice, type Product } from '@/lib/supabase';
import { useCart } from '@/lib/cart';
import { useReveal } from '@/hooks/useReveal';

export default function Shop() {
  const ref = useReveal<HTMLElement>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('status', 'available')
      .order('position', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setProducts(data as Product[]);
        setLoading(false);
      });
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = filter === 'All' ? products : products.filter((p) => p.category === filter);

  return (
    <section ref={ref} className="mx-auto max-w-[1600px] px-6 pt-28 md:px-10 md:pt-40">
      <header className="mb-12 grid grid-cols-12 items-end gap-6">
        <div className="col-span-12 md:col-span-7">
          <span className="reveal font-mono text-[10px] uppercase tracking-[0.3em] text-clay-500">
            §01 — Shop
          </span>
          <h1 className="reveal reveal-delay-1 mt-4 font-serif text-5xl font-light leading-[0.95] tracking-tight text-ink-900 md:text-7xl">
            Available now
          </h1>
        </div>
        <div className="col-span-12 md:col-span-4 md:col-start-9">
          <p className="reveal reveal-delay-2 text-sm leading-relaxed text-ink-500">
            Heavyweight essentials in small batches. Each garment is dyed and
            cut to order. Select a size to add to your bag.
          </p>
        </div>
      </header>

      {/* Category filter */}
      <div className="mb-10 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
              filter === c
                ? 'border-ink-900 bg-ink-900 text-paper-50'
                : 'border-ink-900/20 text-ink-700 hover:border-ink-900/50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse bg-ink-900/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} delay={i * 60} />
          ))}
        </div>
      )}
    </section>
  );
}

function ProductCard({ product, delay }: { product: Product; delay: number }) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>('');

  const handleAdd = () => {
    if (product.size_options.length === 0) return;
    const size = selectedSize || product.size_options[0];
    addItem(product, size);
    setSelectedSize('');
  };

  return (
    <article className="reveal group" data-delay={delay}>
      <div className="relative aspect-[3/4] overflow-hidden bg-ink-900/5" data-cursor="View">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover grayscale transition-all duration-[1.2s] ease-editorial group-hover:grayscale-0 group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-[0.2em] text-paper-50 mix-blend-difference">
          {product.category}
        </span>
      </div>

      <div className="mt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-base font-light leading-tight text-ink-900">
            {product.name}
          </h3>
          <span className="font-mono text-xs text-ink-700">
            {formatPrice(product.price_cents, product.currency)}
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-ink-500 line-clamp-2">
          {product.description}
        </p>

        {/* Size selector */}
        {product.size_options.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.size_options.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                className={`border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
                  selectedSize === s
                    ? 'border-ink-900 bg-ink-900 text-paper-50'
                    : 'border-ink-900/20 text-ink-700 hover:border-ink-900/50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleAdd}
          data-cursor="Add to bag"
          className="mt-3 w-full border hairline border-ink-900/20 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-800 transition-colors hover:bg-ink-900 hover:text-paper-50"
        >
          Add to bag
        </button>
      </div>
    </article>
  );
}
