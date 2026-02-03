// import { Routes, Route } from "react-router-dom";
// import { Header } from "../components/layout/Header";
// import Dashboard from "../pages/Dashboard";
// import UploadTest from "../pages/UploadTest";
// import UrlTest from "../pages/UrlEnterPage";
// import Results from '../pages/Results';

// // Placeholders for now
// // const ConfigureTest = () => <div className="p-8">Configure Page (Coming Soon)</div>;
// // const Results = () => <div className="p-8">Results Page (Coming Soon)</div>;

// export default function AppRouter() {
//   return (
//     <div className="min-h-screen bg-background font-sans">
//       <Header />
//       <main>
//         <Routes>
//           <Route path="/" element={<Dashboard />} />
//           <Route path="/new-test/upload" element={<UploadTest />} />
//           {/* <Route path="/new-test/configure" element={<ConfigureTest />} /> */}
//           <Route path="/new-test/url" element={<UrlTest />} />
//           <Route path="/results/:sessionId" element={<Results />} />
//           <Route path="/results/:sessionId" element={<Results />} />
//         </Routes>
//       </main>
//     </div> 
//   );
// }


import { Routes, Route } from "react-router-dom";
import { Header } from "../components/layout/Header";

import Dashboard from "../pages/Dashboard";
import UploadTest from "../pages/UploadTest";
import UrlTest from "../pages/UrlEnterPage";
import Results from "../pages/Results";
import ConfigureTest from "../pages/ConfigureTest";
import HistoryPage from "../pages/HistoryPage";
import SettingsPage from "../pages/SettingsPage";
import UrlPreviewPage from "../pages/UrlPreviewPage";

export default function AppRouter() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />
      <main>
        <Routes>

          <Route path="/" element={<Dashboard />} />

          <Route path="/new-test/upload" element={<UploadTest />} />

          <Route path="/new-test/url" element={<UrlTest />} />

          {/* NEW CONFIGURE PAGE */}
          <Route path="/new-test/configure" element={<ConfigureTest />} />

          {/* <Route path="/results/:sessionId" element={<Results />} /> */}

          <Route path="/history" element={<HistoryPage />} />
          
          <Route path="/settings" element={<SettingsPage />} />

          <Route path="/results/:sessionId" element={<Results />} />

          <Route path="/new-test/url/preview" element={<UrlPreviewPage />} />


        </Routes>
      </main>
    </div>
  );
}
