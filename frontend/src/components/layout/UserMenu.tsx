import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { ChevronDownIcon, LogOutIcon } from "./icons";

interface UserMenuProps {
  profile: any | null;
}

function initials(profile: any | null): string {
  if (!profile) return "?";
  const a = profile.firstName?.[0] ?? "";
  const b = profile.lastName?.[0] ?? "";
  const s = `${a}${b}`.trim();
  return s.length > 0 ? s.toUpperCase() : (profile.email?.[0] ?? "?").toUpperCase();
}

export function UserMenu({ profile }: UserMenuProps): JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClick(e: MouseEvent): void {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const { signOut } = useAuth();

  async function handleLogout() {
    await signOut();
    setOpen(false);
    void navigate("/login", { replace: true });
  }

  const fullName = profile
    ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || profile.email
    : t("userMenu.account", { defaultValue: "Account" });

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 pr-3 text-left hover:bg-slate-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-rose-400 text-[11px] font-semibold text-white">
          {initials(profile)}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-[140px] truncate text-xs font-semibold text-slate-800">
            {fullName}
          </span>
          <span className="block text-[10px] uppercase tracking-wider text-slate-400">
            {profile ? t(`roles.${profile.role}`) : ""}
          </span>
        </span>
        <ChevronDownIcon size={14} className="text-slate-400" />
      </button>

      {open ? (
        <div
          className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-black/5"
          role="menu"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <div className="text-sm font-semibold text-slate-900">{fullName}</div>
            <div className="mt-0.5 truncate text-xs text-slate-500">
              {profile?.email ?? ""}
            </div>
            {profile ? (
              <span className="mt-2 inline-flex rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-700">
                {t(`roles.${profile.role}`)}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50"
            role="menuitem"
          >
            <LogOutIcon size={16} />
            {t("userMenu.signOut", { defaultValue: "Sign Out" })}
          </button>
        </div>
      ) : null}
    </div>
  );
}
