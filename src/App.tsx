import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";
import { ThemeSwitch } from "./components/theme-switch";

function App() {
  return (
    <div className="relative min-h-screen">
      {/* Change Theme */}
      <div className="text-end pt-3 pe-3">
        <ThemeSwitch/> 
      </div>
      {/* Your routes */}
      <Routes>
        <Route element={<IndexPage />} path="/" />
        <Route element={<DocsPage />} path="/docs" />
        <Route element={<PricingPage />} path="/pricing" />
        <Route element={<BlogPage />} path="/blog" />
        <Route element={<AboutPage />} path="/about" />
      </Routes>
    </div>
  );
}

export default App;
