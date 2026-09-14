import { JSX, Suspense } from 'react'; 
import AnnouncementBar from "@/components/announcement-bar";
import CartDrawer from "@/components/cart-drawer/index";
import Categories from "@/components/categories";
import Products from "@/components/products/index";
import { cookies } from 'next/headers';
import SearchBar from '@/components/header/search-bar';

interface HomeProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

const Home = async ({ searchParams }: HomeProps): Promise<JSX.Element> => {
  const cookieStore = await cookies();
  const isAuthenticated: boolean = cookieStore.has('access_token');

  const resolvedSearchParams = await searchParams;
  const searchQuery: string = resolvedSearchParams?.search || '';
  const currentPage: number = Number(resolvedSearchParams?.page) || 1;

  return (
    <main className="min-h-screen bg-neutral-50 mx-auto lg:max-w-7xl">
      <AnnouncementBar />
      <div className="p-2 sm:hidden">
        <Suspense fallback={<div className="h-10 w-full bg-neutral-100 animate-pulse rounded-xl" />}>
          <SearchBar />
        </Suspense>
      </div>
      <Categories />
      <Suspense key={searchQuery} fallback={<div className="p-4 text-center text-gray-500">Buscando productos...</div>}>
        <Products isAuthenticated={isAuthenticated} searchQuery={searchQuery} currentPage={currentPage} />
      </Suspense>
      <CartDrawer isAuthenticated={isAuthenticated} />
    </main>
  );
}

export default Home;