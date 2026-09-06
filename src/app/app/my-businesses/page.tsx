import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RedirectClient } from "./RedirectClient";

export const metadata = { title: "Opening AlbMap… — AlbMap" };

export default function AppMyBusinessesRedirectPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Header />
      <main className="flex-1">
        <RedirectClient />
      </main>
      <Footer />
    </div>
  );
}
