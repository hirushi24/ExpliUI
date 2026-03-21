// import { LayoutGrid, History, Settings } from "lucide-react";
// import { Link } from "react-router-dom";

// export function Header() {
//   return (
//     <header className="bg-white border-b h-16 flex items-center px-8 justify-between sticky top-0 z-50">
//       <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
//         <LayoutGrid className="w-6 h-6" />
//         ExpliUI
//       </Link>
      
//       <div className="flex gap-4">
//         <button className="flex items-center gap-2 text-slate-600 hover:text-primary transition">
//           <History className="w-4 h-4" />
//           History
//         </button>
//         <button className="flex items-center gap-2 text-slate-600 hover:text-primary transition">
//           <Settings className="w-4 h-4" />
//           Settings
//         </button>
//       </div>
//     </header>
//   ); 
// }

// import { LayoutGrid, History, Settings } from "lucide-react";
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

      {/* <div className="flex gap-2">
        <Link to="/history" className={navClass(isActive("/history"))}>
          <History className="w-4 h-4" />
          History
        </Link> */}
{/* 
        <Link to="/settings" className={navClass(isActive("/settings"))}>
          <Settings className="w-4 h-4" />
          Settings
        </Link> */}
      {/* </div> */}
    </header>
  );
}
