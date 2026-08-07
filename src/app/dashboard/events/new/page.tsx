"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CalendarDays, Upload, Store } from "lucide-react";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { getCategories } from "@/lib/category-api";
import { getMyBusinesses } from "@/lib/business-api";
import { createEvent, uploadEventImage } from "@/lib/event-api";
import { ApiError } from "@/lib/api";
import type { Business, Category } from "@/lib/types";

function AddEventContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const t = useTranslations("addEvent");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [businessId, setBusinessId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only approved businesses can host an event — an event tied to a
  // still-pending (or rejected) listing would have nowhere real to show
  // up, since the business itself isn't public yet.
  const approvedBusinesses = businesses.filter((b) => b.status === "approved");

  useEffect(() => {
    if (!user) return;
    Promise.all([getMyBusinesses(user.id), getCategories()])
      .then(([biz, cats]) => {
        setBusinesses(biz);
        setCategories(cats);
      })
      .catch(() => {
        setBusinesses([]);
        setCategories([]);
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setImagePreview(URL.createObjectURL(file));
      setIsUploadingImage(true);
      try {
        const url = await uploadEventImage(file);
        setImageUrl(url);
      } catch {
        showToast(t("imageUploadFailed"), "error");
      } finally {
        setIsUploadingImage(false);
      }
    },
    [showToast, t],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!businessId) {
        showToast(t("businessRequiredError"), "error");
        return;
      }
      if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
        showToast(t("endBeforeStartError"), "error");
        return;
      }
      setIsSubmitting(true);
      try {
        await createEvent({
          businessId,
          name,
          description: description || undefined,
          category: category || undefined,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          imageUrl: imageUrl || undefined,
        });
        showToast(t("createdSuccess"), "success");
        router.push("/dashboard");
      } catch (err) {
        showToast(err instanceof ApiError ? err.message : t("submitFailed"), "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [businessId, name, description, category, startTime, endTime, imageUrl, router, showToast, t],
  );

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

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <div className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="font-display text-3xl font-bold text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink-soft">{t("subtitle")}</p>

        {approvedBusinesses.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line py-16 text-center text-ink-soft">
            <Store size={28} />
            <p className="max-w-xs text-sm">{t("noApprovedBusiness")}</p>
            <Link href="/dashboard/businesses/new" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white">
              {t("addYourFirstBusiness")}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl bg-surface p-6 shadow-soft">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-paper"
            >
              {imagePreview ? (
                <Image src={imagePreview} alt="Event image preview" width={128} height={128} className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-ink-soft">
                  {isUploadingImage ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-primary" />
                  ) : (
                    <>
                      <Upload size={22} />
                      <span className="text-xs">{t("addImage")}</span>
                    </>
                  )}
                </div>
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

            <Field label={t("selectBusiness")}>
              <select required value={businessId} onChange={(e) => setBusinessId(e.target.value)} className={inputClass}>
                <option value="" disabled>{t("selectBusinessPlaceholder")}</option>
                {approvedBusinesses.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </Field>

            <Field label={t("eventName")}>
              <input required maxLength={30} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </Field>

            <Field label={t("description")}>
              <textarea rows={3} maxLength={300} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-none`} />
            </Field>

            <Field label={t("category")}>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                <option value="">{t("categorySelect")}</option>
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={t("startTime")}>
                <input
                  required
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label={t("endTime")}>
                <input
                  required
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-white shadow-lift disabled:opacity-60"
            >
              <CalendarDays size={16} /> {isSubmitting ? t("submitting") : t("submit")}
            </button>
          </form>
        )}
      </div>
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

export default function AddEventPage() {
  return (
    <ProtectedRoute>
      <AddEventContent />
    </ProtectedRoute>
  );
}
