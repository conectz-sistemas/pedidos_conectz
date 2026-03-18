import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="mt-14 pb-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-8 text-sm text-white/60">
          <div>© {new Date().getFullYear()} iUai</div>
          <div className="flex flex-wrap gap-3">
            <Link className="underline" href="/admin">
              Painel
            </Link>
            <Link className="underline" href="/start">
              Criar conta
            </Link>
            <Link className="underline" href="/t/demo">
              Demo
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

