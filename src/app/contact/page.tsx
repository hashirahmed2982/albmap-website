"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Mail, HelpCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { submitContactForm } from "@/lib/contact-api";
import { useToast } from "@/lib/toast-context";
import { ApiError } from "@/lib/api";

export default function ContactPage() {
  const t = useTranslations("contact");
  const { showToast } = useToast();

  const INQUIRY_TYPES = [
    { value: "general", label: t("inquiryGeneral") },
    { value: "businessSupport", label: t("inquiryBusinessSupport") },
    { value: "bugReport", label: t("inquiryBugReport") },
    { value: "feedback", label: t("inquiryFeedback") },
    { value: "dataRequest", label: t("inquiryDataRequest") },
  ];

  const FAQS = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
  ];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inquiryType, setInquiryType] = useState("general");
  const [message, setMessage] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  // Sends via the backend's real SMTP endpoint now, instead of opening
  // the visitor's own email client — a mailto: link silently does
  // nothing for anyone without a configured desktop mail app (most
  // people using a browser-based webmail client), so submissions were
  // effectively going nowhere for a lot of visitors.
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        const inquiryLabel = INQUIRY_TYPES.find((opt) => opt.value === inquiryType)?.label || inquiryType;
        const result = await submitContactForm({ name, email, inquiryType: inquiryLabel, message });
        if (result.delivered) {
          showToast(t("sentSuccess"), "success");
          setSent(true);
          setName("");
          setEmail("");
          setMessage("");
        } else {
          // Request succeeded but SMTP isn't configured server-side —
          // tell the truth rather than claim success for a message that
          // has nowhere to go.
          showToast(t("sendFailed"), "error");
        }
      } catch (err) {
        showToast(err instanceof ApiError ? err.message : t("sendFailed"), "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, email, inquiryType, message, t, showToast],
  );

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Header />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <h1 className="font-display text-3xl font-bold text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink-soft">{t("subtitle")}</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl bg-surface p-6 shadow-soft">
          {sent && <div className="rounded-xl bg-success/10 px-4 py-3 text-sm text-success">{t("sentSuccess")}</div>}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">{t("yourName")}</label>
            <input
              required
              maxLength={150}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">{t("email")}</label>
            <input
              required
              type="email"
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">{t("whatsAbout")}</label>
            <select
              value={inquiryType}
              onChange={(e) => setInquiryType(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-primary"
            >
              {INQUIRY_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">{t("message")}</label>
            <textarea
              required
              rows={4}
              maxLength={2000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full resize-none rounded-xl border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lift disabled:opacity-60"
          >
            <Mail size={16} /> {isSubmitting ? "…" : t("sendMessage")}
          </button>
        </form>

        <div className="mt-12">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <HelpCircle size={18} className="text-primary" /> {t("faqTitle")}
          </h2>
          <div className="mt-4 space-y-2">
            {FAQS.map((faq, i) => (
              <button
                key={i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="block w-full rounded-2xl bg-surface p-5 text-left shadow-soft"
              >
                <p className="font-medium text-ink">{faq.q}</p>
                {openFaq === i && <p className="mt-2 text-sm text-ink-soft">{faq.a}</p>}
              </button>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
