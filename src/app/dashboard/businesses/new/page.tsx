"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Store, Upload } from "lucide-react";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { OpeningHoursEditor } from "@/components/OpeningHoursEditor";
import { LocationPickerClient } from "@/components/LocationPickerClient";
import { getCategories } from "@/lib/category-api";
import { submitBusiness, uploadLogo, type DuplicateBusinessError } from "@/lib/business-api";
import { ApiError } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { Category } from "@/lib/types";

function AddBusinessContent() {
  const router = useRouter();
  const t = useTranslations("addBusiness");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const { position: userPosition } = useGeolocation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Albania");
  const [phone, setPhone] = useState("");
  const [whatsappSame, setWhatsappSame] = useState(true);
  const [whatsapp, setWhatsapp] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [openingHours, setOpeningHours] = useState<Record<string, string>>({});
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Surfaces as both the existing inline banner AND an immediately-visible
  // toast — on a long form like this one (map picker near the bottom),
  // an error appearing only at the top previously meant scrolling back up
  // to even see what went wrong.
  const reportError = useCallback(
    (message: string) => {
      setError(message);
      showToast(message, "error");
    },
    [showToast],
  );
  const [duplicate, setDuplicate] = useState<DuplicateBusinessError | null>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const handleLogoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setLogoPreview(URL.createObjectURL(file));
      setIsUploadingLogo(true);
      try {
        const url = await uploadLogo(file);
        setLogoUrl(url);
      } catch {
        reportError(t("logoUploadFailed"));
      } finally {
        setIsUploadingLogo(false);
      }
    },
    [t, reportError],
  );

  const doSubmit = useCallback(
    async (confirmDuplicate = false) => {
      if (!location) {
        reportError(t("locationRequiredError"));
        return;
      }
      if (!category) {
        reportError(t("categoryRequiredError"));
        return;
      }
      setIsSubmitting(true);
      setError(null);
      try {
        await submitBusiness({
          name,
          description: description || undefined,
          category,
          streetAddress,
          city,
          postalCode,
          country,
          latitude: location.lat,
          longitude: location.lng,
          phone: phone || undefined,
          whatsappNumber: whatsappSame ? phone || undefined : whatsapp || undefined,
          logoUrl: logoUrl || undefined,
          openingHours,
          confirmDuplicate,
        });
        router.push("/dashboard");
      } catch (err) {
        if (err instanceof ApiError && err.duplicate) {
          setDuplicate(err.duplicate);
        } else {
          reportError(err instanceof ApiError ? err.message : t("submitFailed"));
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, description, category, streetAddress, city, postalCode, country, location, phone, whatsappSame, whatsapp, logoUrl, openingHours, router, t, reportError],
  );

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <div className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="font-display text-3xl font-bold text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink-soft">{t("subtitle")}</p>

        {error && <div className="mt-4 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">{error}</div>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            doSubmit(false);
          }}
          className="mt-6 space-y-5 rounded-2xl bg-surface p-6 shadow-soft"
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-paper"
          >
            {logoPreview ? (
              <Image src={logoPreview} alt="Logo preview" width={128} height={128} className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-ink-soft">
                {isUploadingLogo ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-primary" />
                ) : (
                  <>
                    <Upload size={22} />
                    <span className="text-xs">{t("addLogo")}</span>
                  </>
                )}
              </div>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />

          <Field label={t("businessName")}>
            <input required maxLength={30} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </Field>

          <Field label={t("description")}>
            <textarea rows={3} maxLength={300} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-none`} />
          </Field>

          <Field label={t("category")}>
            <select required value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              <option value="" disabled>{t("categorySelect")}</option>
              {categories.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label={t("streetAddress")}>
            <input required maxLength={70} value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} className={inputClass} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label={t("city")}>
              <input required maxLength={20} value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
            </Field>
            <Field label={t("postalCode")}>
              <input
                required
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ""))}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label={t("country")}>
            <input required maxLength={20} value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
          </Field>

          <Field label={t("setLocation")}>
            <div className="relative z-0 h-64 overflow-hidden rounded-2xl">
              <LocationPickerClient value={location} onChange={(lat, lng) => setLocation({ lat, lng })} defaultCenter={userPosition} />
            </div>
            {!location && <p className="mt-1.5 text-xs text-ink-soft">{t("locationRequired")}</p>}
          </Field>

          <Field label={t("phoneNumber")}>
            <input type="tel" maxLength={20} value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </Field>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={whatsappSame} onChange={(e) => setWhatsappSame(e.target.checked)} className="h-4 w-4 rounded accent-primary" />
            {t("sameAsPhone")}
          </label>
          {!whatsappSame && (
            <Field label={t("whatsappNumber")}>
              <input type="tel" maxLength={20} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputClass} />
            </Field>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-ink">{t("openingHours")}</label>
            <p className="mb-2 text-xs text-ink-soft">{t("openingHoursHelp")}</p>
            <OpeningHoursEditor value={openingHours} onChange={setOpeningHours} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white shadow-lift disabled:opacity-60"
          >
            {isSubmitting ? t("submitting") : t("submitForApproval")}
          </button>
        </form>
      </div>

      {duplicate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-lift">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-warning/10 text-warning">
              <Store size={20} />
            </div>
            <h3 className="mt-3 font-display text-lg font-semibold text-ink">{t("duplicateTitle")}</h3>
            <p className="mt-1.5 text-sm text-ink-soft">
              {t("duplicateBody", { name: duplicate.name, address: duplicate.address, distance: duplicate.distanceMeters })}
            </p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setDuplicate(null)} className="flex-1 rounded-full border border-line py-2.5 text-sm font-medium text-ink">
                {t("cancel")}
              </button>
              <button
                onClick={() => {
                  setDuplicate(null);
                  doSubmit(true);
                }}
                className="flex-1 rounded-full bg-primary py-2.5 text-sm font-semibold text-white"
              >
                {t("submitAnyway")}
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

export default function AddBusinessPage() {
  return (
    <ProtectedRoute>
      <AddBusinessContent />
    </ProtectedRoute>
  );
}
