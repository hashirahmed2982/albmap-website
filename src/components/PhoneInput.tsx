"use client";

import { useState } from "react";
import { COUNTRY_DIAL_CODES, DEFAULT_DIAL_CODE } from "@/lib/country-dial-codes";

interface PhoneInputProps {
  /** The FULL composed value ("+355691234567") — same shape every call
   * site already stores/sends to the API, so swapping a plain phone
   * <input> for this component needs no other change downstream. */
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

/**
 * Best-effort split of a stored phone value into (dial code, local
 * number): tries the longest dial-code prefix that matches (so "+1"
 * doesn't shadow "+1684"), defaulting to Albania — this app's home
 * market — and leaving the value untouched as the local number when it
 * doesn't start with "+" at all (old free-text entries predating this
 * field) or no dial code matches.
 */
function splitStoredPhone(raw: string): [string, string] {
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) {
    const sorted = [...COUNTRY_DIAL_CODES].sort((a, b) => b.dial.length - a.dial.length);
    for (const c of sorted) {
      if (trimmed.startsWith(c.dial)) {
        return [c.dial, trimmed.slice(c.dial.length).trim()];
      }
    }
  }
  return [DEFAULT_DIAL_CODE, trimmed];
}

/**
 * Phone-number input with a country dial-code dropdown in front of it —
 * used everywhere the website collects a phone number (profile, business
 * phone, business WhatsApp number) so every number is saved as
 * "+<dial code><local number>" instead of the country-less free text it
 * used to be. Mirrors the mobile app's PhoneInputField (same split/
 * compose logic, same default country).
 *
 * The initial split only ever runs once, on mount (lazy useState
 * initializer) — every call site either already has its real starting
 * `value` by the time this mounts (profile: gated on the user being
 * loaded; business edit: gated on its own isLoading flag) or starts
 * genuinely empty (new business), so there's nothing to resync later.
 */
export function PhoneInput({ value, onChange, required, className }: PhoneInputProps) {
  const [dialCode, setDialCode] = useState(() => splitStoredPhone(value)[0]);
  const [localNumber, setLocalNumber] = useState(() => splitStoredPhone(value)[1]);

  function emit(nextDialCode: string, nextLocalNumber: string) {
    const trimmed = nextLocalNumber.trim();
    onChange(trimmed === "" ? "" : `${nextDialCode}${trimmed}`);
  }

  const inputClass =
    className ?? "w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-primary";

  return (
    <div className="flex gap-2">
      <select
        value={dialCode}
        onChange={(e) => {
          setDialCode(e.target.value);
          emit(e.target.value, localNumber);
        }}
        aria-label="Country code"
        className="w-28 shrink-0 rounded-xl border border-line bg-paper px-2 py-2.5 text-sm text-ink outline-none focus:border-primary"
      >
        {COUNTRY_DIAL_CODES.map((c) => (
          <option key={c.code} value={c.dial}>
            {c.dial} {c.code}
          </option>
        ))}
      </select>
      <input
        type="tel"
        required={required}
        maxLength={15}
        value={localNumber}
        onChange={(e) => {
          setLocalNumber(e.target.value);
          emit(dialCode, e.target.value);
        }}
        className={`flex-1 ${inputClass}`}
      />
    </div>
  );
}
