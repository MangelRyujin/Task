import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";

function App() {
  return (
    <div className="relative min-h-screen">
      {/* Fondo global fijo */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-primary/20 to-background will-change-transform" />
      
      {/* Tus rutas */}
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
