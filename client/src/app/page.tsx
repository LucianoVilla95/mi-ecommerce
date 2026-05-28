import AnnouncementBar from "@/components/announcement-bar";
import Header from "@/components/header";
import SearchBar from "@/components/search-bar";
import Categories from "@/components/categories";
import Products from "@/components/products";

export default function Home() {
  return (
    <main className="max-w-md mx-auto pb-16">
      <AnnouncementBar />
      <Header />
      <SearchBar />
      <Categories />
      <Products />
    </main>
  );
}
