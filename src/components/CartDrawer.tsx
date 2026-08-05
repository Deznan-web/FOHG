import { useCart } from '@/lib/cart';
import { formatPrice, normalizeImageUrl } from '@/lib/supabase';
import { useRouter } from '@/lib/router';
import { X, Plus, Minus } from 'lucide-react';

export default function CartDrawer() {
  const { items, isOpen, close, removeItem, updateQuantity, totalCents, count } =
    useCart();
  const { navigate } = useRouter();

  const goToCheckout = () => {
    close();
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-ink-900/40 backdrop-blur-sm transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={close}
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-paper-50 shadow-2xl transition-transform duration-500 ease-editorial ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b hairline border-ink-900/15 px-6 py-5">
          <h2 className="font-serif text-xl font-light text-ink-900">
            Your bag{' '}
            <span className="font-mono text-xs text-ink-500">({count})</span>
          </h2>
          <button onClick={close} aria-label="Close cart" data-cursor="Close">
            <X size={20} className="text-ink-700" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
            <p className="font-serif text-xl font-light italic text-ink-500">
              Your bag is empty.
            </p>
            <button
              onClick={() => {
                close();
                navigate('/shop');
              }}
              className="font-mono text-xs uppercase tracking-[0.2em] text-clay-500"
            >
              Browse the shop →
            </button>
          </div>
        ) : (
          <>
            <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="flex gap-4 border-b hairline border-ink-900/10 py-5"
                >
                  <div className="h-24 w-20 shrink-0 overflow-hidden bg-ink-900/5">
                    <img
                      src={normalizeImageUrl(item.imageUrl)}
                      alt={item.name}
                      onError={(e) => {
                        const el = e.currentTarget as HTMLImageElement;
                        if (el.src !== normalizeImageUrl('')) el.src = normalizeImageUrl('');
                      }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <h3 className="font-serif text-base font-light text-ink-900">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => removeItem(item.productId, item.size)}
                        className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-400 hover:text-clay-500"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                      Size {item.size}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.size, -1)
                          }
                          className="grid h-7 w-7 place-items-center border hairline border-ink-900/20"
                          aria-label="Decrease"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-mono text-sm text-ink-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.size, 1)
                          }
                          className="grid h-7 w-7 place-items-center border hairline border-ink-900/20"
                          aria-label="Increase"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="font-mono text-sm text-ink-900">
                        {formatPrice(item.priceCents * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t hairline border-ink-900/15 px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-500">
                  Subtotal
                </span>
                <span className="font-serif text-2xl font-light text-ink-900">
                  {formatPrice(totalCents)}
                </span>
              </div>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-400">
                Shipping calculated at checkout
              </p>
              <button
                onClick={goToCheckout}
                data-cursor="Checkout"
                className="mt-5 w-full bg-ink-900 py-4 font-mono text-xs uppercase tracking-[0.25em] text-paper-50 transition-colors hover:bg-clay-500"
              >
                Proceed to checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
