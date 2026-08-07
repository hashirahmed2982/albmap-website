import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = { title: "Terms & Conditions — AlbMap" };

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Header />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <h1 className="font-display text-3xl font-bold text-ink">Terms &amp; Conditions</h1>
        <p className="mt-1 text-sm text-ink-soft">Last updated: 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink-soft">
          <section>
            <h2 className="font-display text-lg font-semibold text-ink">1. Acceptance of terms</h2>
            <p className="mt-3">
              By creating an account or using AlbMap (the app or this website), you agree to these
              terms. If you don&apos;t agree, please don&apos;t use the service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">2. Accounts</h2>
            <p className="mt-3">
              You&apos;re responsible for the accuracy of the information you provide and for keeping
              your account credentials secure. You must be legally able to enter into these terms in
              your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">3. Business listings</h2>
            <p className="mt-3">
              Business owners are responsible for the accuracy of their listing&apos;s information
              (name, address, hours, contact details, images). Every new listing — and certain edits
              to an existing one — goes through admin review before appearing publicly. We reserve
              the right to reject, suspend, or remove any listing that violates these terms or is
              inaccurate, fraudulent, or misleading.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">4. Notifications</h2>
            <p className="mt-3">
              Business owners may submit offers or announcements for broadcast to users. Every
              submission is reviewed by an admin before being sent — nothing reaches users
              automatically. We reserve the right to reject any submission.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">5. User conduct</h2>
            <p className="mt-3">
              You agree not to submit false reviews, impersonate another business or person, upload
              content you don&apos;t have rights to, or otherwise misuse the platform.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">6. Content</h2>
            <p className="mt-3">
              You retain ownership of content you submit (business descriptions, images, reviews), but
              grant AlbMap a license to display it as part of the service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">7. Limitation of liability</h2>
            <p className="mt-3">
              AlbMap is provided &quot;as is.&quot; We don&apos;t guarantee the accuracy of listings,
              opening hours, or event details submitted by business owners, and we&apos;re not liable
              for any loss arising from reliance on that information.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">8. Changes to these terms</h2>
            <p className="mt-3">
              We may update these terms from time to time. Continued use of the service after a
              change constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">9. Contact</h2>
            <p className="mt-3">
              Questions about these terms? Reach us via our{" "}
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
