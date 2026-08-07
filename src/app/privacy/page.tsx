import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LegalPageClient } from "@/components/LegalPageClient";

export const metadata = { title: "Privacy Policy — AlbMap" };

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Header />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <h1 className="font-display text-3xl font-bold text-ink">Privacy Policy</h1>
        <LegalPageClient select={(content) => content.privacyPolicy} fallbackHeading="the Privacy Policy" />
      </main>

      <Footer />
    </div>
  );
}
