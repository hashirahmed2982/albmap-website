import { MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AboutClient } from "./AboutClient";

export const metadata = { title: "About Us — AlbMap" };

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Header />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lift">
          <MapPin size={30} strokeWidth={2.2} />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold text-ink">AlbMap</h1>
        <AboutClient />
      </main>

      <Footer />
    </div>
  );
}
