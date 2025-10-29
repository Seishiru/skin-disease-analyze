import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { ImageUpload } from './ImageUpload';
import { AnalysisResults, AnalysisResult } from './AnalysisResults';
import { Loader2, Brain, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

const mockAnalysisData: Record<string, AnalysisResult> = {
  acne: {
    condition: 'Acne',
    accuracy: 89,
    confidence: 'High',
    affectedArea: 'Facial T-zone',
    description: 'Acne is a common skin condition that occurs when hair follicles become plugged with oil and dead skin cells. It often causes whiteheads, blackheads, or pimples.',
    recommendations: [
      'Use gentle, non-comedogenic cleansers twice daily',
      'Apply topical treatments containing salicylic acid or benzoyl peroxide',
      'Avoid touching or picking at affected areas',
      'Consider consulting a dermatologist for prescription treatments if over-the-counter options are ineffective'
    ]
  },
  eczema: {
    condition: 'Eczema',
    accuracy: 92,
    confidence: 'High',
    affectedArea: 'Upper extremities',
    description: 'Eczema (atopic dermatitis) is a condition that makes your skin red and itchy. It\'s common in children but can occur at any age.',
    recommendations: [
      'Keep skin moisturized with fragrance-free lotions',
      'Avoid known triggers such as certain soaps or fabrics',
      'Use mild, unscented laundry detergents',
      'Consider prescription topical medications from a dermatologist'
    ]
  },
  melasma: {
    condition: 'Melasma',
    accuracy: 85,
    confidence: 'Medium',
    affectedArea: 'Facial area',
    description: 'Melasma is a common skin problem that causes brown or gray-brown patches, usually on the face. It\'s often related to hormonal changes.',
    recommendations: [
      'Use broad-spectrum sunscreen daily (SPF 30 or higher)',
      'Wear wide-brimmed hats when outdoors',
      'Consider topical lightening agents prescribed by a dermatologist',
      'Avoid hormonal triggers when possible'
    ]
  },
  shingles: {
    condition: 'Shingles',
    accuracy: 94,
    confidence: 'High',
    affectedArea: 'Torso region',
    description: 'Shingles is a viral infection that causes a painful rash. It\'s caused by the varicella-zoster virus, the same virus that causes chickenpox.',
    recommendations: [
      'Seek immediate medical attention for antiviral treatment',
      'Keep the rash clean and covered',
      'Apply cool, wet compresses to reduce pain',
      'Avoid contact with pregnant women and immunocompromised individuals until rash crusts over'
    ]
  },
  rosacea: {
    condition: 'Rosacea',
    accuracy: 87,
    confidence: 'Medium',
    affectedArea: 'Central facial area',
    description: 'Rosacea is a common skin condition that causes redness and visible blood vessels in your face. It may also produce small, red, pus-filled bumps.',
    recommendations: [
      'Identify and avoid personal triggers (spicy foods, alcohol, stress)',
      'Use gentle, fragrance-free skincare products',
      'Apply broad-spectrum sunscreen daily',
      'Consider prescription treatments from a dermatologist'
    ]
  },
  others: {
    condition: 'Others',
    accuracy: 73,
    confidence: 'Low',
    affectedArea: 'Various regions',
    description: 'The image shows characteristics that don\'t clearly match our primary classification categories. This could indicate a less common condition or image quality issues.',
    recommendations: [
      'Consult with a dermatologist for professional evaluation',
      'Consider taking clearer, well-lit photos for re-analysis',
      'Monitor the condition for any changes',
      'Seek immediate medical attention if symptoms worsen'
    ]
  }
};

interface AnalysisSectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnalysisSection({ open, onOpenChange }: AnalysisSectionProps) {
  const [selectedImage, setSelectedImage] = useState<{ file: File; previewUrl: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleImageSelect = (file: File | null, previewUrl: string) => {
    if (file) {
      setSelectedImage({ file, previewUrl });
      setAnalysisResult(null);
    } else {
      setSelectedImage(null);
      setAnalysisResult(null);
    }
  };

  const startAnalysis = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisResult(null);

    // Simulate analysis progress
    const progressSteps = [
      { step: 'Preprocessing image...', progress: 20 },
      { step: 'Extracting features...', progress: 45 },
      { step: 'Running AI model...', progress: 70 },
      { step: 'Analyzing results...', progress: 90 },
      { step: 'Generating report...', progress: 100 }
    ];

    for (const { progress } of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setAnalysisProgress(progress);
    }

    // Simulate random condition selection
    const conditions = ['acne', 'eczema', 'melasma', 'shingles', 'rosacea', 'others'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    // Add some randomness to the mock data
    const baseResult = mockAnalysisData[randomCondition];
    const result: AnalysisResult = {
      ...baseResult,
      accuracy: Math.max(70, baseResult.accuracy + Math.floor(Math.random() * 10) - 5)
    };

    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl sm:text-2xl md:text-3xl">
            Skin Analysis
          </DialogTitle>
          <DialogDescription className="text-sm">
            Upload a clear image of the skin condition and let our AI provide detailed analysis
          </DialogDescription>
        </DialogHeader>

        <div className="grid lg:grid-cols-2 gap-6 mt-4">
          {/* Left Column - Image Viewer */}
          <div className="space-y-4">
            <div className="lg:sticky lg:top-0">
              {selectedImage ? (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden bg-muted border-2 border-primary/20">
                    <img
                      src={selectedImage.previewUrl}
                      alt="Selected skin condition"
                      className="w-full h-auto min-h-[300px] max-h-[60vh] object-contain"
                    />
                  </div>
                  <Card className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">
                          <strong>File:</strong> {selectedImage.file.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Size: {(selectedImage.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (selectedImage) {
                            URL.revokeObjectURL(selectedImage.previewUrl);
                          }
                          setSelectedImage(null);
                          setAnalysisResult(null);
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </Card>
                </div>
              ) : (
                <Card className="border-2 border-dashed p-6 sm:p-8 text-center">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center">
                      <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg">No Image Selected</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                        Upload an image to view it here in full size
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Right Column - Upload & Results */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <h3 className="text-base sm:text-lg mb-3 sm:mb-4">Upload Image</h3>
              <ImageUpload onImageSelect={handleImageSelect} selectedImage={selectedImage} />
            </div>

            {/* Analysis Button */}
            {selectedImage && !analysisResult && (
              <div className="text-center">
                <Button
                  onClick={startAnalysis}
                  disabled={isAnalyzing}
                  size="lg"
                  className="w-full px-8 py-6 text-lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-5 w-5" />
                      Start AI Analysis
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Analysis Progress */}
            {isAnalyzing && (
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-3">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <h3 className="text-lg">Analyzing Your Image</h3>
                  </div>
                  <Progress value={analysisProgress} className="h-3" />
                  <p className="text-center text-muted-foreground text-sm">
                    {analysisProgress}% Complete - This may take a few moments
                  </p>
                </div>
              </Card>
            )}

            {/* Analysis Results */}
            {analysisResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg">Analysis Results</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedImage) {
                        URL.revokeObjectURL(selectedImage.previewUrl);
                      }
                      setSelectedImage(null);
                      setAnalysisResult(null);
                    }}
                  >
                    New Analysis
                  </Button>
                </div>
                <AnalysisResults result={analysisResult} />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}