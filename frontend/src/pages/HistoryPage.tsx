// Archived draft for a future history page; preserved as commented reference code for now.
// import { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Search,
//   Calendar,
//   ChevronRight,
//   Filter,
//   Clock,
//   FileText,
//   Plus,
// } from "lucide-react";
// import { Button } from "../components/common/Button";

// type SessionStatus = "completed" | "running" | "failed" | "saved";
// type TestType = "upload" | "url";

// type HistoryItem = {
//   session_id: string;
//   test_type: TestType;
//   comparison_mode: string;
//   total_pairs: number;
//   issues_detected: number;
//   created_at: string;
//   status: SessionStatus;
// };

// const MOCK_HISTORY: HistoryItem[] = [
//   {
//     session_id: "sess_001",
//     test_type: "upload",
//     comparison_mode: "desktop-desktop",
//     total_pairs: 4,
//     issues_detected: 2,
//     created_at: "2026-01-30T11:15:00Z",
//     status: "completed",
//   },
//   {
//     session_id: "sess_002",
//     test_type: "url",
//     comparison_mode: "mobile-mobile",
//     total_pairs: 6,
//     issues_detected: 0,
//     created_at: "2026-01-29T09:40:00Z",
//     status: "saved",
//   },
//   {
//     session_id: "sess_003",
//     test_type: "url",
//     comparison_mode: "desktop-desktop",
//     total_pairs: 8,
//     issues_detected: 5,
//     created_at: "2026-01-28T06:05:00Z",
//     status: "failed",
//   },
// ];

// function formatDate(iso: string) {
//   try {
//     return new Date(iso).toLocaleString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   } catch {
//     return iso;
//   }
// }

// function statusBadge(status: SessionStatus) {
//   switch (status) {
//     case "completed":
//       return "bg-green-50 text-green-700 border-green-200";
//     case "running":
//       return "bg-blue-50 text-blue-700 border-blue-200";
//     case "saved":
//       return "bg-slate-50 text-slate-700 border-slate-200";
//     case "failed":
//       return "bg-red-50 text-red-700 border-red-200";
//     default:
//       return "bg-slate-50 text-slate-700 border-slate-200";
//   }
// }

// function statusDot(status: SessionStatus) {
//   switch (status) {
//     case "completed":
//       return "bg-green-500";
//     case "running":
//       return "bg-blue-500";
//     case "saved":
//       return "bg-slate-400";
//     case "failed":
//       return "bg-red-500";
//     default:
//       return "bg-slate-400";
//   }
// }

// export default function HistoryPage() {
//   const navigate = useNavigate();
//   const [items] = useState<HistoryItem[]>(MOCK_HISTORY);

//   const [query, setQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState<SessionStatus | "all">("all");
//   const [typeFilter, setTypeFilter] = useState<TestType | "all">("all");

//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     return items.filter((it) => {
//       const matchesQuery =
//         !q ||
//         it.session_id.toLowerCase().includes(q) ||
//         it.comparison_mode.toLowerCase().includes(q) ||
//         it.test_type.toLowerCase().includes(q);

//       const matchesStatus = statusFilter === "all" ? true : it.status === statusFilter;
//       const matchesType = typeFilter === "all" ? true : it.test_type === typeFilter;

//       return matchesQuery && matchesStatus && matchesType;
//     });
//   }, [items, query, statusFilter, typeFilter]);

//   const stats = useMemo(() => {
//     const total = items.length;
//     const completed = items.filter((i) => i.status === "completed").length;
//     const saved = items.filter((i) => i.status === "saved").length;
//     const failed = items.filter((i) => i.status === "failed").length;
//     return { total, completed, saved, failed };
//   }, [items]);

//   return (
//     <div className="bg-slate-50 min-h-[calc(100vh-64px)]">
//       <div className="max-w-5xl mx-auto p-8">
//         {/* Header */}
//         <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
//           <div>
//             <h1 className="text-2xl font-bold text-slate-800">Reports History</h1>
//             <p className="text-slate-500 mt-1">
//               View saved and completed test sessions.
//             </p>
//           </div>

//           <div className="flex items-center gap-3">
//             <Button variant="secondary" onClick={() => navigate("/")}>
//               Back
//             </Button>

//             <button
//               onClick={() => navigate("/")}
//               className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
//             >
//               <Plus className="w-4 h-4" />
//               New Test
//             </button>
//           </div>
//         </div>

//         {/* Stats Row */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//           <div className="bg-white border rounded-xl shadow-sm p-4">
//             <div className="text-xs text-slate-500">Total Sessions</div>
//             <div className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</div>
//           </div>

//           <div className="bg-white border rounded-xl shadow-sm p-4">
//             <div className="text-xs text-slate-500">Completed</div>
//             <div className="text-2xl font-bold text-slate-800 mt-1">{stats.completed}</div>
//           </div>

//           <div className="bg-white border rounded-xl shadow-sm p-4">
//             <div className="text-xs text-slate-500">Saved</div>
//             <div className="text-2xl font-bold text-slate-800 mt-1">{stats.saved}</div>
//           </div>

//           <div className="bg-white border rounded-xl shadow-sm p-4">
//             <div className="text-xs text-slate-500">Failed</div>
//             <div className="text-2xl font-bold text-slate-800 mt-1">{stats.failed}</div>
//           </div>
//         </div>

//         {/* Controls */}
//         <div className="bg-white border rounded-xl shadow-sm p-4 mb-6">
//           <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
//             {/* Search */}
//             <div className="flex-1 relative">
//               <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
//               <input
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="Search by session id, mode, or type..."
//                 className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               />
//             </div>

//             {/* Filters */}
//             <div className="flex items-center gap-3 flex-wrap">
//               <div className="flex items-center gap-2">
//                 <Filter className="w-4 h-4 text-slate-400" />
//                 <select
//                   value={statusFilter}
//                   onChange={(e) => setStatusFilter(e.target.value as any)}
//                   className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   <option value="all">All status</option>
//                   <option value="completed">Completed</option>
//                   <option value="saved">Saved</option>
//                   <option value="running">Running</option>
//                   <option value="failed">Failed</option>
//                 </select>
//               </div>

//               <select
//                 value={typeFilter}
//                 onChange={(e) => setTypeFilter(e.target.value as any)}
//                 className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 <option value="all">All types</option>
//                 <option value="upload">Upload</option>
//                 <option value="url">URL</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* List */}
//         <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
//           <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
//             <div className="font-semibold text-slate-800">Sessions</div>
//             <div className="text-sm text-slate-500">
//               Showing {filtered.length} of {items.length}
//             </div>
//           </div>

//           {filtered.length === 0 ? (
//             <div className="p-10 text-center">
//               <div className="text-lg font-semibold text-slate-800">No sessions found</div>
//               <div className="text-sm text-slate-500 mt-2">
//                 Try clearing filters or run a new test.
//               </div>
//               <div className="mt-4">
//                 <button
//                   onClick={() => navigate("/")}
//                   className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
//                 >
//                   <Plus className="w-4 h-4" />
//                   Create New Test
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="divide-y">
//               {filtered.map((it) => (
//                 <button
//                   key={it.session_id}
//                   onClick={() => navigate(`/results/${it.session_id}`)}
//                   className="w-full text-left px-6 py-4 hover:bg-slate-50 transition flex items-start justify-between gap-4 group"
//                 >
//                   <div className="flex items-start gap-4 min-w-0">
//                     {/* Status dot */}
//                     <span
//                       className={[
//                         "mt-2 w-2.5 h-2.5 rounded-full",
//                         statusDot(it.status),
//                       ].join(" ")}
//                     />

//                     <div className="min-w-0">
//                       <div className="flex items-center gap-2 flex-wrap">
//                         <span className="font-semibold text-slate-800">{it.session_id}</span>

//                         <span className={["text-xs font-semibold px-3 py-1 rounded-full border", statusBadge(it.status)].join(" ")}>
//                           {it.status.toUpperCase()}
//                         </span>

//                         <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-white text-slate-700 border-slate-200">
//                           {it.test_type.toUpperCase()}
//                         </span>

//                         <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
//                           {it.comparison_mode}
//                         </span>
//                       </div>

//                       <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
//                         <span className="inline-flex items-center gap-2">
//                           <Calendar className="w-4 h-4 text-slate-400" />
//                           {formatDate(it.created_at)}
//                         </span>

//                         <span className="inline-flex items-center gap-2">
//                           <FileText className="w-4 h-4 text-slate-400" />
//                           Pairs:{" "}
//                           <span className="font-medium text-slate-800">{it.total_pairs}</span>
//                         </span>

//                         <span className="inline-flex items-center gap-2">
//                           <Clock className="w-4 h-4 text-slate-400" />
//                           Issues:{" "}
//                           <span className="font-medium text-slate-800">{it.issues_detected}</span>
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="shrink-0 inline-flex items-center gap-2 text-blue-600 font-medium group-hover:text-blue-700">
//                     View
//                     <ChevronRight className="w-4 h-4" />
//                   </div>
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
