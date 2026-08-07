"use client";

import { useState, useEffect } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function OpeningHoursEditor({
  value,
  onChange,
}: {
  value: Record<string, string>;
  onChange: (hours: Record<string, string>) => void;
}) {
  const [state, setState] = useState<Record<string, { open: boolean; from: string; to: string }>>(() => {
    const initial: Record<string, { open: boolean; from: string; to: string }> = {};
    for (const day of DAYS) {
      const stored = value[day];
      if (stored?.includes("-")) {
        const [from, to] = stored.split("-");
        initial[day] = { open: true, from, to };
      } else {
        initial[day] = { open: false, from: "09:00", to: "18:00" };
      }
    }
    return initial;
  });

  useEffect(() => {
    const result: Record<string, string> = {};
    for (const day of DAYS) {
      if (state[day].open) result[day] = `${state[day].from}-${state[day].to}`;
    }
    onChange(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="space-y-2">
      {DAYS.map((day) => (
        <div
          key={day}
          className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${state[day].open ? "border-primary/30 bg-primary/5" : "border-line bg-paper"}`}
        >
          <span className="w-10 text-sm font-medium text-ink">{day}</span>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={state[day].open}
              onChange={(e) => setState((s) => ({ ...s, [day]: { ...s[day], open: e.target.checked } }))}
              className="peer sr-only"
            />
            <div className="h-5 w-9 rounded-full bg-line transition-colors peer-checked:bg-primary" />
            <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
          </label>
          {state[day].open ? (
            <div className="ml-auto flex items-center gap-2 text-sm">
              <input
                type="time"
                value={state[day].from}
                onChange={(e) => setState((s) => ({ ...s, [day]: { ...s[day], from: e.target.value } }))}
                className="rounded-lg border border-line bg-surface px-2 py-1 text-xs"
              />
              <span className="text-ink-soft">–</span>
              <input
                type="time"
                value={state[day].to}
                onChange={(e) => setState((s) => ({ ...s, [day]: { ...s[day], to: e.target.value } }))}
                className="rounded-lg border border-line bg-surface px-2 py-1 text-xs"
              />
            </div>
          ) : (
            <span className="ml-auto text-xs text-ink-soft">Closed</span>
          )}
        </div>
      ))}
    </div>
  );
}
