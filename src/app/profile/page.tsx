"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { User as UserIcon, Lock, Camera } from "lucide-react";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { updateProfile, changePassword, uploadAvatar } from "@/lib/auth-api";
import { useToast } from "@/lib/toast-context";
import { ApiError } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/format";

function ProfileContent() {
  const t = useTranslations("profile");
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handlePictureChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsUploadingPicture(true);
      try {
        await uploadAvatar(file);
        await refreshUser();
        showToast(t("pictureUpdated"), "success");
      } catch (err) {
        showToast(err instanceof Error ? err.message : t("pictureUploadFailed"), "error");
      } finally {
        setIsUploadingPicture(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [refreshUser, showToast, t],
  );

  const handleProfileSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSavingProfile(true);
      setProfileMessage(null);
      try {
        await updateProfile({ name, phone: phone || undefined });
        await refreshUser();
        setProfileMessage(t("profileUpdated"));
      } catch (err) {
        const message = err instanceof ApiError ? err.message : t("updateFailed");
        setProfileMessage(message);
        showToast(message, "error");
      } finally {
        setIsSavingProfile(false);
      }
    },
    [name, phone, refreshUser, t, showToast],
  );

  const handlePasswordSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setPasswordError(null);
      setPasswordMessage(null);
      if (newPassword !== confirmPassword) {
        setPasswordError(t("passwordsDontMatch"));
        showToast(t("passwordsDontMatch"), "error");
        return;
      }
      setIsSavingPassword(true);
      try {
        await changePassword(currentPassword, newPassword);
        setPasswordMessage(t("passwordChanged"));
        showToast(t("passwordChanged"), "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (err) {
        const message = err instanceof ApiError ? err.message : t("passwordChangeFailed");
        setPasswordError(message);
        showToast(message, "error");
      } finally {
        setIsSavingPassword(false);
      }
    },
    [currentPassword, newPassword, confirmPassword, t, showToast],
  );

  const avatarUrl = resolveMediaUrl(user?.profileImageUrl);

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPicture}
            className="group relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary"
            aria-label={t("changePicture")}
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt={user?.name || ""} fill className="object-cover" />
            ) : (
              <UserIcon size={28} />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-ink/40 opacity-0 transition-opacity group-hover:opacity-100">
              {isUploadingPicture ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Camera size={18} className="text-white" />
              )}
            </div>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePictureChange} />
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">{user?.name}</h1>
            <p className="text-sm text-ink-soft">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="mt-8 rounded-2xl bg-surface p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold text-ink">{t("editProfile")}</h2>
          {profileMessage && <p className="mt-2 text-sm text-primary">{profileMessage}</p>}
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">{t("fullName")}</label>
              <input
                required
                maxLength={150}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">{t("phoneNumber")}</label>
              <input
                type="tel"
                maxLength={30}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSavingProfile}
            className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSavingProfile ? t("saving") : t("saveChanges")}
          </button>
        </form>

        <form onSubmit={handlePasswordSubmit} className="mt-6 rounded-2xl bg-surface p-6 shadow-soft">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <Lock size={17} /> {t("changePassword")}
          </h2>
          {passwordMessage && <p className="mt-2 text-sm text-success">{passwordMessage}</p>}
          {passwordError && <p className="mt-2 text-sm text-error">{passwordError}</p>}
          <div className="mt-4 space-y-4">
            <input
              type="password"
              required
              maxLength={72}
              placeholder={t("currentPassword")}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            <input
              type="password"
              required
              minLength={6}
              maxLength={72}
              placeholder={t("newPassword")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            <input
              type="password"
              required
              maxLength={72}
              placeholder={t("confirmNewPassword")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={isSavingPassword}
            className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSavingPassword ? t("saving") : t("changePassword")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
