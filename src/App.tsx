import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Transition } from "framer-motion"; // type-only import
import { Header } from "./components/Header";
import { HomePage } from "./components/HomePage";
import { AboutPage } from "./components/AboutPage";
import { ContactPage } from "./components/ContactPage";
import { AnalysisPage } from "./components/AnalysisPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  // Correctly typed transition
  const pageTransition: Transition = {
    type: "tween",             // valid type
    ease: [0.68, -0.55, 0.27, 1.55], // custom cubic-bezier easing
    duration: 0.4
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'about':
        return (
          <motion.div
            key="about"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <AboutPage />
          </motion.div>
        );
      case 'contact':
        return (
          <motion.div
            key="contact"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <ContactPage />
          </motion.div>
        );
      case 'analysis':
        return (
          <motion.div
            key="analysis"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <AnalysisPage />
          </motion.div>
        );
      default:
        return (
          <motion.div
            key="home"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <HomePage onNavigate={setCurrentPage} />
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      <main>
        <AnimatePresence mode="wait">
          {renderPage()}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h3 className="text-lg font-semibold">SkinAnalyze AI</h3>
            <p className="text-muted-foreground">
              Advanced AI-powered dermatology detection for better skin health awareness.
              Always consult with healthcare professionals for medical advice.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
              <button 
                onClick={() => setCurrentPage('contact')}
                className="hover:text-primary transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => setCurrentPage('contact')}
                className="hover:text-primary transition-colors"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => setCurrentPage('contact')}
                className="hover:text-primary transition-colors"
              >
                Contact Support
              </button>
            </div>
            <p className="text-xs text-muted-foreground pt-4">
              © 2025 SkinAnalyze AI. This tool is for educational purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
