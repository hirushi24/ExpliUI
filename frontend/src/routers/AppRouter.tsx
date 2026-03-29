import { Routes, Route } from "react-router-dom";
import { Header } from "../components/layout/Header";

import WelcomePage from "../pages/WelcomePage";
import Dashboard from "../pages/Dashboard";
import UploadTest from "../pages/UploadTest";
import UrlTest from "../pages/UrlEnterPage";
import Results from "../pages/Results";
import ConfigureTest from "../pages/ConfigureTest";
import UrlPreviewPage from "../pages/UrlPreviewPage";

// Central route map for the guided test creation and results review flows.
export default function AppRouter() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<WelcomePage />} />

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/new-test/upload" element={<UploadTest />} />

          <Route path="/new-test/url" element={<UrlTest />} />
          
          <Route path="/new-test/configure" element={<ConfigureTest />} />

          <Route path="/results/:sessionId" element={<Results />} />

          <Route path="/new-test/url/preview" element={<UrlPreviewPage />} />


        </Routes>
      </main>
    </div>
  );
}
