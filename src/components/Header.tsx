import { Stethoscope, Menu, X } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Header({ currentPage, onPageChange }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handlePageChange = (page: string) => {
    onPageChange(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => handlePageChange('home')}
          >
            <Stethoscope className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">SkinAnalyze AI</h1>
              <p className="text-sm text-muted-foreground">Advanced Dermatology Detection</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => handlePageChange('home')}
              className={`transition-colors ${
                currentPage === 'home' 
                  ? 'text-primary font-medium' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => handlePageChange('analysis')}
              className={`transition-colors ${
                currentPage === 'analysis' 
                  ? 'text-primary font-medium' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Analysis
            </button>
            <button 
              onClick={() => handlePageChange('about')}
              className={`transition-colors ${
                currentPage === 'about' 
                  ? 'text-primary font-medium' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              About
            </button>
            <button 
              onClick={() => handlePageChange('contact')}
              className={`transition-colors ${
                currentPage === 'contact' 
                  ? 'text-primary font-medium' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => handlePageChange('home')}
                className={`text-left transition-colors ${
                  currentPage === 'home' 
                    ? 'text-primary font-medium' 
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                Home
              </button>
              <button 
                onClick={() => handlePageChange('analysis')}
                className={`text-left transition-colors ${
                  currentPage === 'analysis' 
                    ? 'text-primary font-medium' 
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                Analysis
              </button>
              <button 
                onClick={() => handlePageChange('about')}
                className={`text-left transition-colors ${
                  currentPage === 'about' 
                    ? 'text-primary font-medium' 
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                About
              </button>
              <button 
                onClick={() => handlePageChange('contact')}
                className={`text-left transition-colors ${
                  currentPage === 'contact' 
                    ? 'text-primary font-medium' 
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                Contact
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}