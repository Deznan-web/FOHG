import { CartProvider } from '@/lib/cart';
import { useRouter } from '@/lib/router';
import Cursor from '@/components/Cursor';
import Nav from '@/components/Nav';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Shop from '@/pages/Shop';
import Upcoming from '@/pages/Upcoming';
import Lab from '@/pages/Lab';
import Checkout from '@/pages/Checkout';
import Admin from '@/pages/Admin';

function Routes() {
  const { path } = useRouter();

  const render = () => {
    switch (path) {
      case '/shop':
        return <Shop />;
      case '/upcoming':
        return <Upcoming />;
      case '/lab':
        return <Lab />;
      case '/checkout':
        return <Checkout />;
      case '/admin':
        return <Admin />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="relative min-h-screen bg-paper-100 text-ink-900">
      <Cursor />
      <Nav />
      <CartDrawer />
      <main>{render()}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Routes />
    </CartProvider>
  );
}
