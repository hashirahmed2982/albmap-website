import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = { title: "Privacy Policy — AlbMap" };

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Header />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <h1 className="font-display text-3xl font-bold text-ink">Privacy Policy</h1>
        <p className="mt-1 text-sm text-ink-soft">Last updated: 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink-soft">
          <section>
            <h2 className="font-display text-lg font-semibold text-ink">Information we collect</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong className="text-ink">Account information:</strong> name, email address, and
                phone number (if provided) when you sign up, including via Google or Facebook Sign-In.
              </li>
              <li>
                <strong className="text-ink">Location:</strong> your device&apos;s location, used to
                show nearby businesses and calculate distances. Only used while the app is in use.
              </li>
              <li>
                <strong className="text-ink">Business listing data:</strong> if you register a
                business, its name, address, description, category, phone/WhatsApp number, opening
                hours, and any logo image you upload.
              </li>
              <li>
                <strong className="text-ink">Event data:</strong> events you create, including any
                images you upload.
              </li>
              <li>
                <strong className="text-ink">Device push token:</strong> to deliver notifications
                you&apos;re eligible to receive.
              </li>
              <li>
                <strong className="text-ink">Favorites:</strong> businesses you save, synced to your
                account.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">How we use information</h2>
            <p className="mt-3">
              To operate the app and website&apos;s core features: showing nearby businesses and
              events, managing your account and business listings, and delivering notifications
              you&apos;re eligible to receive. We do not sell your personal information to third
              parties.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">Third-party services</h2>
            <p className="mt-3">
              We use Google Sign-In and Facebook Login for authentication, and Firebase Cloud
              Messaging for push notifications. Each provider&apos;s own privacy policy governs their
              handling of data during that interaction.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">Data retention &amp; deletion</h2>
            <p className="mt-3">
              You can request deletion of your account and associated data at any time via our{" "}
              <a href="/contact" className="font-medium text-primary hover:underline">
                Contact page
              </a>
              . We will delete your account, business listings, and personal data within 30 days of a
              verified request.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">Contact</h2>
            <p className="mt-3">
              Questions about this policy? Reach us via our{" "}
              <a href="/contact" className="font-medium text-primary hover:underline">
                Contact Us
              </a>{" "}
              page.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
