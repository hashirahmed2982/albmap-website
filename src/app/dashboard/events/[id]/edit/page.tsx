"use client";

import { useState, useEffect, useCallback, useRef, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Upload, History } from "lucide-react";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getCategories } from "@/lib/category-api";
import { getEventById, updateEvent, uploadEventImage } from "@/lib/event-api";
import { ApiError } from "@/lib/api";
import { resolveMediaUrl, isEventFinished } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import type { EventItem, Category } from "@/lib/types";

/** ISO string -> the value <input type="datetime-local"> expects
 * ("YYYY-MM-DDTHH:mm", local time, no seconds/zone). */
function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function EditEventContent({ id }: { id: string }) {
  const router = useRouter();
  // Field labels (Event name, Category, ...) are shared with the Add
  // Event form, same reasoning as Edit Business reusing addBusiness's.
  const tf = useTranslations("addEvent");
  const t = useTranslations("editEvent");
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [original, setOriginal] = useState<EventItem | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([getEventById(id), getCategories()])
      .then(([event, cats]) => {
        setOriginal(event);
        setCategories(cats);
        setName(event.name);
        setDescription(event.description || "");
        setCategory(event.category);
        setStartTime(toDatetimeLocalValue(event.startTime));
        setEndTime(toDatetimeLocalValue(event.endTime));
        setImageUrl(event.imageUrl || null);
        setImagePreview(resolveMediaUrl(event.imageUrl));
      })
      .finally(() => setIsLoading(false));
  }, [id]);

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
        showToast(tf("imageUploadFailed"), "error");
      } finally {
        setIsUploadingImage(false);
      }
    },
    [tf, showToast],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
        showToast(tf("endBeforeStartError"), "error");
        return;
      }
      setIsSubmitting(true);
      try {
        await updateEvent(id, {
          name,
          description: description || undefined,
          category: category || undefined,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          imageUrl: imageUrl || undefined,
        });
        showToast(t("saved"), "success");
        router.push("/dashboard");
      } catch (err) {
        // Covers both ordinary validation failures and the backend's
        // "already finished" rejection (a race between loading this page
        // and submitting) — the server's message says which, so it's
        // shown as-is rather than a generic fallback.
        showToast(err instanceof ApiError ? err.message : t("saveFailed"), "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [id, name, description, category, startTime, endTime, imageUrl, router, showToast, t, tf],
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

  if (!original) {
    return (
      <div className="min-h-screen bg-paper">
        <Header />
        <div className="mx-auto max-w-2xl px-6 py-24 text-center text-ink-soft">{t("notFound")}</div>
      </div>
    );
  }

  // Only reachable via an edit link My Events itself hides once an event
  // has finished — but the event could finish between opening the
  // dashboard and getting here, and the backend rejects the PATCH either
  // way (event.service.js's updateEvent), so this re-checks the same rule
  // up front rather than only discovering it after filling out the form.
  if (isEventFinished(original.endTime)) {
    return (
      <div className="min-h-screen bg-paper">
        <Header />
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <History className="mx-auto text-ink-soft" size={32} />
          <p className="mt-4 text-sm text-ink-soft">{t("cannotEditPast")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <div className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="font-display text-3xl font-bold text-ink">{t("title")}</h1>

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
                    <span className="text-xs">{tf("addImage")}</span>
                  </>
                )}
              </div>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

          <Field label={tf("eventName")}>
            <input required maxLength={30} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </Field>

          <Field label={tf("description")}>
            <textarea rows={3} maxLength={300} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-none`} />
          </Field>

          <Field label={tf("category")}>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              <option value="">{tf("categorySelect")}</option>
              {categories.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={tf("startTime")}>
              <input required type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} />
            </Field>
            <Field label={tf("endTime")}>
              <input required type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputClass} />
            </Field>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white shadow-lift disabled:opacity-60">
            {isSubmitting ? t("saving") : t("saveChanges")}
          </button>
        </form>
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

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  return (
    <ProtectedRoute>
      <EditEventContent id={id} />
    </ProtectedRoute>
  );
}
