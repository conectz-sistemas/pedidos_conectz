"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm min-h-[40px] hover:bg-white/10"
    >
      Sair
    </button>
  );
}
