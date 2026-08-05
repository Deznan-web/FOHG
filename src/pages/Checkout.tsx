import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { supabase, formatPrice, normalizeImageUrl } from '@/lib/supabase';
import { useRouter } from '@/lib/router';
import { useReveal } from '@/hooks/useReveal';
import { Check, ArrowLeft } from 'lucide-react';

type Status = 'form' | 'submitting' | 'confirmed' | 'error';

export default function Checkout() {
  const ref = useReveal<HTMLElement>();
  const { items, totalCents, clear } = useCart();
  const { navigate } = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    city: '',
    country: '',
    notes: '',
  });
  const [status, setStatus] = useState<Status>('form');
  const [orderNumber, setOrderNumber] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting' || items.length === 0) return;

    setStatus('submitting');

    const num = `FOHG-${Date.now().toString().slice(-6)}`;
    setOrderNumber(num);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: num,
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone || null,
        location: form.location,
        city: form.city,
        country: form.country,
        total_cents: totalCents,
        currency: 'ngn',
        status: 'pending',
        notes: form.notes || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      setStatus('error');
      return;
    }

    const orderItems = items.map((i) => ({
      order_id: order.id,
      product_id: i.productId,
      product_name: i.name,
      size: i.size,
      quantity: i.quantity,
      unit_price_cents: i.priceCents,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      setStatus('error');
      return;
    }

    setStatus('confirmed');
    clear();
  };

  if (items.length === 0 && status !== 'confirmed') {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 pt-28 text-center">
        <h1 className="font-serif text-4xl font-light italic text-ink-500">
          Your bag is empty.
        </h1>
        <button
          onClick={() => navigate('/shop')}
          className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-clay-500"
        >
          Browse the shop →
        </button>
      </section>
    );
  }

  if (status === 'confirmed') {
    return (
      <section className="mx-auto flex min-h-[80vh] max-w-3xl flex-col items-center justify-center px-6 pt-28 text-center">
        <div className="reveal flex h-20 w-20 items-center justify-center rounded-full bg-moss-500">
          <Check size={32} className="text-paper-50" />
        </div>
        <h1 className="reveal reveal-delay-1 mt-8 font-serif text-4xl font-light text-ink-900 md:text-5xl">
          Order received.
        </h1>
        <p className="reveal reveal-delay-2 mt-4 text-sm leading-relaxed text-ink-500">
          Your order <span className="font-mono text-ink-900">{orderNumber}</span>{' '}
          has been placed. The studio will contact you shortly with payment
          instructions.
        </p>
        <div className="reveal reveal-delay-3 mt-8 rounded-lg border hairline border-ink-900/15 bg-paper-100 px-8 py-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
            Next step
          </p>
          <p className="mt-2 text-sm text-ink-700">
            The studio will contact you shortly with payment instructions —
            bank transfer, Paystack, or another method. Your order is confirmed
            once payment is received.
          </p>
        </div>
        <button
          onClick={() => navigate('/shop')}
          className="reveal reveal-delay-4 mt-10 font-mono text-xs uppercase tracking-[0.2em] text-clay-500"
        >
          Continue shopping →
        </button>
      </section>
    );
  }

  const field =
    'w-full border-b hairline border-ink-900/20 bg-transparent py-3 font-serif text-lg text-ink-900 placeholder:text-ink-400 focus:border-clay-500 focus:outline-none transition-colors';
  const label =
    'font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500';

  return (
    <section ref={ref} className="mx-auto max-w-[1600px] px-6 pt-28 md:px-10 md:pt-40">
      <button
        onClick={() => navigate('/shop')}
        className="reveal mb-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500 hover:text-clay-500"
      >
        <ArrowLeft size={14} /> Back to shop
      </button>

      <h1 className="reveal reveal-delay-1 mb-12 font-serif text-4xl font-light tracking-tight text-ink-900 md:text-6xl">
        Checkout
      </h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Form */}
        <form onSubmit={submit} className="reveal reveal-delay-2 lg:col-span-7">
          <div className="space-y-8">
            <div>
              <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-ink-900">
                Contact
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className={label}>Full name</label>
                  <input required type="text" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Jane Doe" className={field} />
                </div>
                <div>
                  <label className={label}>Email</label>
                  <input required type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="jane@email.com" className={field} />
                </div>
                <div>
                  <label className={label}>Phone (optional)</label>
                  <input type="tel" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+49 30 1234 5678" className={field} />
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-ink-900">
                Shipping location
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className={label}>Address / Location</label>
                  <input required type="text" value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Street address, building, unit" className={field} />
                </div>
                <div>
                  <label className={label}>City</label>
                  <input required type="text" value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Berlin" className={field} />
                </div>
                <div>
                  <label className={label}>Country</label>
                  <input required type="text" value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    placeholder="Germany" className={field} />
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-ink-900">
                Notes (optional)
              </h2>
              <textarea rows={3} value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Sizing questions, shipping preferences…"
                className={`${field} resize-none`} />
            </div>

            <div>
              <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-ink-900">
                Payment
              </h2>
              <div className="rounded-lg border hairline border-ink-900/15 bg-paper-100 px-6 py-5">
                <p className="text-sm leading-relaxed text-ink-500">
                  No online payment yet. Place your order and the studio will
                  contact you with payment instructions — bank transfer,
                  Paystack, or another method that works for you. Your order is
                  confirmed once payment is received.
                </p>
              </div>
            </div>
          </div>

          {status === 'error' && (
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-clay-600">
              Something went wrong placing your order. Please try again.
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            data-cursor="Place order"
            className="mt-10 w-full bg-ink-900 py-5 font-mono text-xs uppercase tracking-[0.25em] text-paper-50 transition-colors hover:bg-clay-500 disabled:opacity-50"
          >
            {status === 'submitting' ? 'Placing order…' : `Place order — ${formatPrice(totalCents)}`}
          </button>
        </form>

        {/* Order summary */}
        <aside className="reveal reveal-delay-3 lg:col-span-4 lg:col-start-9">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-ink-900">
            Order summary
          </h2>
          <div className="border-t hairline border-ink-900/15">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="flex items-center gap-4 border-b hairline border-ink-900/10 py-4"
              >
                <div className="h-16 w-14 shrink-0 overflow-hidden bg-ink-900/5">
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
                <div className="flex-1">
                  <h3 className="font-serif text-sm font-light text-ink-900">{item.name}</h3>
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-500">
                    {item.size} × {item.quantity}
                  </p>
                </div>
                <span className="font-mono text-xs text-ink-700">
                  {formatPrice(item.priceCents * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t hairline border-ink-900/15 pt-4">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-500">Total</span>
            <span className="font-serif text-2xl font-light text-ink-900">
              {formatPrice(totalCents)}
            </span>
          </div>
        </aside>
      </div>
    </section>
  );
}
