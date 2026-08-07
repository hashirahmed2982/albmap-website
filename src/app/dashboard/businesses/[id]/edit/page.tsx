"use client";

import { useState, useEffect, useCallback, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { OpeningHoursEditor } from "@/components/OpeningHoursEditor";
import { LocationPickerClient } from "@/components/LocationPickerClient";
import { getCategories } from "@/lib/category-api";
import { getBusinessById, updateBusiness } from "@/lib/business-api";
import { ApiError } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import type { Business, Category } from "@/lib/types";

const SENSITIVE_FIELDS = ["name", "category", "streetAddress", "city", "postalCode", "country", "latitude", "longitude"];

function EditBusinessContent({ id }: { id: string }) {
  const router = useRouter();
  // Field labels (Business name, City, etc.) are shared with the Add
  // Business form, so reused from that namespace rather than duplicated.
  const tf = useTranslations("addBusiness");
  const t = useTranslations("editBusiness");
  const { showToast } = useToast();
  const [original, setOriginal] = useState<Business | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [openingHours, setOpeningHours] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showReviewWarning, setShowReviewWarning] = useState(false);

  useEffect(() => {
    Promise.all([getBusinessById(id), getCategories()])
      .then(([biz, cats]) => {
        setOriginal(biz);
        setCategories(cats);
        setName(biz.name);
        setDescription(biz.description || "");
        setCategory(biz.category);
        setStreetAddress(biz.streetAddress);
        setCity(biz.city);
        setPostalCode(biz.postalCode);
        setCountry(biz.country);
        setPhone(biz.phone || "");
        setWhatsapp(biz.whatsappNumber || "");
        setLocation({ lat: biz.latitude, lng: biz.longitude });
        setOpeningHours(biz.openingHours);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const touchesSensitiveField = useCallback(() => {
    if (!original) return false;
    return (
      name !== original.name ||
      category !== original.category ||
      streetAddress !== original.streetAddress ||
      city !== original.city ||
      postalCode !== original.postalCode ||
      country !== original.country ||
      location?.lat !== original.latitude ||
      location?.lng !== original.longitude
    );
  }, [original, name, category, streetAddress, city, postalCode, country, location]);

  const doSave = useCallback(async () => {
    if (!location) return;
    setIsSubmitting(true);
    setMessage(null);
    try {
      const updated = await updateBusiness(id, {
        name, description: description || undefined, category, streetAddress, city, postalCode, country,
        latitude: location.lat, longitude: location.lng,
        phone: phone || undefined, whatsappNumber: whatsapp || undefined, openingHours,
      });
      const successMessage = updated.status === "pending" ? t("savedPending") : t("saved");
      setMessage(successMessage);
      showToast(successMessage, "success");
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : t("saveFailed");
      setMessage(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  }, [id, name, description, category, streetAddress, city, postalCode, country, location, phone, whatsapp, openingHours, router, t, showToast]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (original?.status === "approved" && touchesSensitiveField()) {
      setShowReviewWarning(true);
      return;
    }
    doSave();
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper">
        <Header />
        <div className="mx-auto max-w-2xl animate-pulse px-6 py-12">
          <div className="h-8 w-1/3 rounded bg-paper-warm" />
        </div>
      </div>
    );
  }

  if (!original) {
    return (
      <div className="min-h-screen bg-paper">
        <Header />
        <div className="mx-auto max-w-2xl px-6 py-24 text-center text-ink-soft">{t("notFound")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <div className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="font-display text-3xl font-bold text-ink">{t("title")}</h1>

        <div className="mt-4 rounded-xl bg-info/10 px-4 py-3 text-xs text-info">{t("reviewNotice")}</div>

        {message && <div className="mt-4 rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">{message}</div>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl bg-surface p-6 shadow-soft">
          <Field label={tf("businessName")}>
            <input required maxLength={30} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </Field>
          <Field label={tf("description")}>
            <textarea rows={3} maxLength={300} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-none`} />
          </Field>
          <Field label={tf("category")}>
            <select required value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              {categories.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </Field>
          <Field label={tf("streetAddress")}>
            <input required maxLength={70} value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={tf("city")}>
              <input required maxLength={20} value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
            </Field>
            <Field label={tf("postalCode")}>
              <input required type="text" inputMode="numeric" pattern="[0-9]*" maxLength={10} value={postalCode} onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ""))} className={inputClass} />
            </Field>
          </div>
          <Field label={tf("country")}>
            <input required maxLength={20} value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
          </Field>
          <Field label={t("location")}>
            <div className="relative z-0 h-64 overflow-hidden rounded-2xl">
              <LocationPickerClient value={location} onChange={(lat, lng) => setLocation({ lat, lng })} />
            </div>
          </Field>
          <Field label={tf("phoneNumber")}>
            <input type="tel" maxLength={20} value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </Field>
          <Field label={tf("whatsappNumber")}>
            <input type="tel" maxLength={20} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputClass} />
          </Field>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">{tf("openingHours")}</label>
            <OpeningHoursEditor value={openingHours} onChange={setOpeningHours} />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white shadow-lift disabled:opacity-60">
            {isSubmitting ? t("saving") : t("saveChanges")}
          </button>
        </form>
      </div>

      {showReviewWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-lift">
            <h3 className="font-display text-lg font-semibold text-ink">{t("reviewWarningTitle")}</h3>
            <p className="mt-2 text-sm text-ink-soft">{t("reviewWarningBody")}</p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setShowReviewWarning(false)} className="flex-1 rounded-full border border-line py-2.5 text-sm font-medium text-ink">
                {t("cancel")}
              </button>
              <button
                onClick={() => { setShowReviewWarning(false); doSave(); }}
                className="flex-1 rounded-full bg-primary py-2.5 text-sm font-semibold text-white"
              >
                {t("continueAnyway")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass = "w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      {children}
    </div>
  );
}

export default function EditBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  return (
    <ProtectedRoute>
      <EditBusinessContent id={id} />
    </ProtectedRoute>
  );
}
