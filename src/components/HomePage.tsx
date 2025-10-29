import { HeroSection } from "./HeroSection";

interface HomePageProps {
  onNavigate?: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <HeroSection onStartAnalysis={() => onNavigate?.('analysis')} />
  );
}