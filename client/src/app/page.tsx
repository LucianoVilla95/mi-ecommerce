import { JSX } from 'react'; 
import AnnouncementBar from "@/components/announcement-bar";
import CartDrawer from "@/components/cart-drawer/index";
import Categories from "@/components/categories";
import Products from "@/components/products";
import { cookies } from 'next/headers';

const Home = async (): Promise<JSX.Element> => {
  const cookieStore = await cookies();
  const isAuthenticated: boolean = cookieStore.has('access_token');

  return (
    <main className="min-h-screen bg-neutral-50 max-w-7xl mx-auto">
      <AnnouncementBar />
      <Categories />
      <Products isAuthenticated={isAuthenticated} />
      <CartDrawer isAuthenticated={isAuthenticated} />
    </main>
  );
}

export default Home;
