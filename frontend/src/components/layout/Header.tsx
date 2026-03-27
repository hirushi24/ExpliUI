import { LayoutGrid, History } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function Header() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navClass = (active: boolean) =>
    [
      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition",
      active
        ? "bg-blue-50 text-blue-700 border border-blue-200"
        : "text-slate-600 hover:text-slate-800 hover:bg-slate-50 border border-transparent",
    ].join(" ");

  return (
    <header className="bg-slate-900 h-16 flex items-center px-8 justify-between sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
        <LayoutGrid className="w-6 h-6" />
        ExpliUI
      </Link>
    </header>
  );
}
