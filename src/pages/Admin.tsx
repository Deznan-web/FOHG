import { useEffect, useState } from 'react';
import { supabase, formatPrice, type Order, type OrderItem, type OrderStatus } from '@/lib/supabase';
import { useReveal } from '@/hooks/useReveal';
import { useRouter } from '@/lib/router';
import { Lock, Mail, MapPin, Phone, Clock, UserPlus } from 'lucide-react';

const STATUSES: OrderStatus[] = ['pending', 'paid', 'shipped', 'cancelled'];

export default function Admin() {
  const ref = useReveal<HTMLElement>();
  const [session, setSession] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [itemsByOrder, setItemsByOrder] = useState<Record<string, OrderItem[]>>({});
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(!!s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === null || !session) return;
    setLoadingOrders(true);
    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setOrders(data as Order[]);
        setLoadingOrders(false);
      });
  }, [session]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setAuthError(error.message);
        return;
      }
      if (data.user) {
        setAuthError('');
        setSession(true);
      }
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setAuthError(error.message);
  };

  const signOut = () => supabase.auth.signOut().then(() => setSession(false));

  const loadItems = async (orderId: string) => {
    const { data } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    if (data) setItemsByOrder((prev) => ({ ...prev, [orderId]: data as OrderItem[] }));
  };

  const toggleOrder = (orderId: string) => {
    setExpanded((prev) => {
      if (prev === orderId) return null;
      loadItems(orderId);
      return orderId;
    });
  };

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
    );
  };

  if (session === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-28">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-500">
          Loading…
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <section ref={ref} className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-6 pt-28">
        <div className="reveal flex h-16 w-16 items-center justify-center rounded-full border hairline border-ink-900/20">
          {mode === 'signin' ? (
            <Lock size={24} className="text-ink-700" />
          ) : (
            <UserPlus size={24} className="text-ink-700" />
          )}
        </div>
        <h1 className="reveal reveal-delay-1 mt-6 font-serif text-3xl font-light text-ink-900">
          {mode === 'signin' ? 'FOHG Admin' : 'Create admin account'}
        </h1>
        <p className="reveal reveal-delay-2 mt-2 text-sm text-ink-500">
          {mode === 'signin'
            ? 'Sign in to manage orders.'
            : 'First time? Create your studio account.'}
        </p>

        <form onSubmit={signIn} className="reveal reveal-delay-3 mt-8 w-full space-y-5">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
              Email
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b hairline border-ink-900/20 bg-transparent py-3 text-ink-900 placeholder:text-ink-400 focus:border-clay-500 focus:outline-none"
              placeholder="admin@fohg.com"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
              Password
            </label>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b hairline border-ink-900/20 bg-transparent py-3 text-ink-900 placeholder:text-ink-400 focus:border-clay-500 focus:outline-none"
              placeholder="••••••••"
            />
            {mode === 'signup' && (
              <p className="mt-1 font-mono text-[10px] text-ink-400">
                At least 6 characters.
              </p>
            )}
          </div>
          {authError && (
            <p className="font-mono text-xs text-clay-600">{authError}</p>
          )}
          <button
            type="submit"
            className="w-full bg-ink-900 py-4 font-mono text-xs uppercase tracking-[0.25em] text-paper-50 transition-colors hover:bg-clay-500"
          >
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setAuthError('');
          }}
          className="reveal reveal-delay-4 mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500 hover:text-clay-500"
        >
          {mode === 'signin'
            ? 'No account? Create one →'
            : '← Already have an account? Sign in'}
        </button>
      </section>
    );
  }

  const statusColor: Record<OrderStatus, string> = {
    pending: 'bg-clay-500/15 text-clay-600',
    paid: 'bg-moss-500/15 text-moss-600',
    shipped: 'bg-ink-900/10 text-ink-700',
    cancelled: 'bg-red-500/15 text-red-600',
  };

  return (
    <section ref={ref} className="mx-auto max-w-[1400px] px-6 pt-28 md:px-10 md:pt-40">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <span className="reveal font-mono text-[10px] uppercase tracking-[0.3em] text-clay-500">
            Admin
          </span>
          <h1 className="reveal reveal-delay-1 mt-4 font-serif text-4xl font-light tracking-tight text-ink-900 md:text-5xl">
            Orders
          </h1>
        </div>
        <button
          onClick={signOut}
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500 hover:text-clay-500"
        >
          Sign out
        </button>
      </div>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {STATUSES.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          return (
            <div key={s} className="rounded-lg border hairline border-ink-900/15 bg-paper-50 px-5 py-4">
              <p className="font-serif text-3xl font-light text-ink-900">{count}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                {s}
              </p>
            </div>
          );
        })}
      </div>

      {loadingOrders ? (
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-500">
          Loading orders…
        </p>
      ) : orders.length === 0 ? (
        <p className="font-serif text-xl font-light italic text-ink-500">
          No orders yet.
        </p>
      ) : (
        <div className="border-t hairline border-ink-900/15">
          {orders.map((order, i) => (
            <div key={order.id} className="reveal border-b hairline border-ink-900/15" data-delay={i * 40}>
              <button
                onClick={() => toggleOrder(order.id)}
                className="flex w-full items-center gap-4 py-5 text-left"
              >
                <span className="font-mono text-xs text-ink-400">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-mono text-sm text-ink-900">
                  {order.order_number}
                </span>
                <span className="hidden font-serif text-sm text-ink-700 md:block">
                  {order.customer_name}
                </span>
                <span className={`ml-auto rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] ${statusColor[order.status]}`}>
                  {order.status}
                </span>
                <span className="font-mono text-sm text-ink-700">
                  {formatPrice(order.total_cents, order.currency)}
                </span>
                <span className="font-mono text-[10px] text-ink-400">
                  {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </button>

              {expanded === order.id && (
                <div className="grid grid-cols-1 gap-8 pb-8 md:grid-cols-2">
                  {/* Customer details */}
                  <div className="space-y-3">
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-500">
                      Customer
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-ink-800">
                      <Mail size={14} className="text-ink-400" />
                      {order.customer_email}
                    </div>
                    {order.customer_phone && (
                      <div className="flex items-center gap-2 text-sm text-ink-800">
                        <Phone size={14} className="text-ink-400" />
                        {order.customer_phone}
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-sm text-ink-800">
                      <MapPin size={14} className="mt-0.5 text-ink-400" />
                      <span>
                        {order.location}
                        <br />
                        {order.city}, {order.country}
                      </span>
                    </div>
                    {order.notes && (
                      <p className="mt-3 rounded-lg bg-paper-100 px-4 py-3 text-xs italic text-ink-600">
                        "{order.notes}"
                      </p>
                    )}
                  </div>

                  {/* Items + status */}
                  <div className="space-y-4">
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-500">
                      Items
                    </h3>
                    {(itemsByOrder[order.id] || []).map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b hairline border-ink-900/10 pb-2">
                        <div>
                          <p className="font-serif text-sm text-ink-900">{item.product_name}</p>
                          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-500">
                            {item.size} × {item.quantity}
                          </p>
                        </div>
                        <span className="font-mono text-xs text-ink-700">
                          {formatPrice(item.unit_price_cents * item.quantity)}
                        </span>
                      </div>
                    ))}

                    <div className="flex items-center gap-2 pt-2">
                      <Clock size={14} className="text-ink-400" />
                      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-500">
                        {new Date(order.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(order.id, s)}
                          className={`rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors ${
                            order.status === s
                              ? 'border-ink-900 bg-ink-900 text-paper-50'
                              : 'border-ink-900/20 text-ink-700 hover:border-ink-900/50'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
