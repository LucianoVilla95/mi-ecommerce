import { JSX } from 'react'; 
import AnnouncementBar from "@/components/announcement-bar";
import CartDrawer from "@/components/cart-drawer/index";
import Categories from "@/components/categories";
import Products from "@/components/products";
import { cookies } from 'next/headers';

interface HomeProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

const Home = async ({ searchParams }: HomeProps): Promise<JSX.Element> => {
  const cookieStore = await cookies();
  const isAuthenticated: boolean = cookieStore.has('access_token');

  return (
    <main className="min-h-screen bg-neutral-50 max-w-7xl mx-auto">
      <AnnouncementBar />
      <Categories />
      <Products isAuthenticated={isAuthenticated} searchParams={searchParams} />
      <CartDrawer isAuthenticated={isAuthenticated} />
    </main>
  );
}

export default Home;
