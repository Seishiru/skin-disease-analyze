import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { Scan } from 'lucide-react';

interface HeroSectionProps {
  onStartAnalysis: () => void;
}

export function HeroSection({ onStartAnalysis }: HeroSectionProps) {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              AI-Powered Skin Condition Analysis
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Upload an image of your skin condition and get instant AI-powered analysis. 
              Our advanced model can detect and classify common skin conditions including 
              acne, eczema, melasma, shingles, and rosacea with high accuracy.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Fast & Accurate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Privacy Protected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>6 Condition Types</span>
              </div>
            </div>
            <div className="pt-4">
              <Button 
                size="lg" 
                onClick={onStartAnalysis}
                className="px-8 py-6 text-lg"
              >
                <Scan className="mr-2 h-5 w-5" />
                Start Skin Analysis
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto relative overflow-hidden rounded-2xl shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758691462848-ba1e929da259?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwaGVhbHRoY2FyZSUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzU5NDg4MDExfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Medical technology illustration"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}