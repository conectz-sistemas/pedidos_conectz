"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
    >
      Sair
    </button>
  );
}
