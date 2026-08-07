import { MapPin, Target, Eye } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = { title: "About Us — AlbMap" };

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Header />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lift">
          <MapPin size={30} strokeWidth={2.2} />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold text-ink">AlbMap</h1>
        <p className="mt-2 text-ink-soft">{t("tagline")}</p>

        <div className="mt-12 space-y-10 text-left">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
              <Target size={18} className="text-primary" /> {t("missionTitle")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t("missionBody")}</p>
          </div>

          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
              <Eye size={18} className="text-primary" /> {t("visionTitle")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t("visionBody")}</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
