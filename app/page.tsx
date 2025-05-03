import { Footer } from "~/components/footer";
import { Header } from "~/components/header";
import HomeClient from "~/components/home-client";

export default function HomePage() {
  return (
    <>
      <main className="flex-1">
        {/* Hero Section */}
        <Header showAuth={true} />
        <HomeClient />
        <Footer />
      </main>
    </>
  );
}
