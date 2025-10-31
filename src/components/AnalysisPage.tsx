import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { ImageUpload } from './ImageUpload';
import { AnalysisResults } from './AnalysisResults';
import type { AnalysisResult } from './AnalysisResults';
import { Loader2, Brain, X, CheckCircle, Download, Eye, EyeOff } from 'lucide-react';

// API base URL
const API_BASE = 'http://localhost:5001/api';

export function AnalysisPage() {
  const [selectedImage, setSelectedImage] = useState<{ file: File; previewUrl: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null);
  const [showOriginalImage, setShowOriginalImage] = useState(false);

  const handleImageSelect = (file: File | null, previewUrl: string) => {
    if (file) {
      setSelectedImage({ file, previewUrl });
      setAnalysisResult(null);
      setAnnotatedImage(null);
      setShowOriginalImage(false);
    } else {
      setSelectedImage(null);
      setAnalysisResult(null);
      setAnnotatedImage(null);
      setShowOriginalImage(false);
    }
  };

  const startAnalysis = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisResult(null);
    setAnnotatedImage(null);
    setShowOriginalImage(false);

    const formData = new FormData();
    formData.append('file', selectedImage.file);

    try {
      // Simulate progress updates
      const progressSteps = [
        { step: 'Uploading image...', progress: 10 },
        { step: 'Preprocessing...', progress: 25 },
        { step: 'Running YOLOv8...', progress: 45 },
        { step: 'Running YOLO-NAS...', progress: 65 },
        { step: 'Running EfficientDet...', progress: 80 },
        { step: 'Combining results...', progress: 95 },
      ];

      for (const { step, progress } of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setAnalysisProgress(progress);
      }

      const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      setAnalysisProgress(100);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.detections && result.detections.length > 0) {
        const detection = result.detections[0];
        const analysisResult: AnalysisResult = {
          condition: detection.condition,
          accuracy: detection.accuracy,
          confidence: detection.confidence,
          affectedArea: detection.affected_area,
          description: detection.description,
          recommendations: detection.recommendations,
          votes: detection.votes,
          totalModels: result.ensemble_stats.total_models,
          workingModels: result.ensemble_stats.working_models
        };
        
        setAnalysisResult(analysisResult);
        
        if (result.annotated_image) {
          setAnnotatedImage(result.annotated_image);
        }
      } else {
        setAnalysisResult({
          condition: 'No Condition Detected',
          accuracy: 0,
          confidence: 'Low',
          affectedArea: 'N/A',
          description: 'No skin conditions were detected with sufficient confidence. This could be due to image quality or the condition not being in our detection categories.',
          recommendations: [
            'Try uploading a clearer, well-lit image',
            'Ensure the skin area is clearly visible',
            'Consult with a dermatologist for professional evaluation'
          ],
          votes: 0,
          totalModels: result.ensemble_stats?.total_models || 3,
          workingModels: result.ensemble_stats?.working_models || 3
        });
      }

    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisResult({
        condition: 'Analysis Failed',
        accuracy: 0,
        confidence: 'Low',
        affectedArea: 'N/A',
        description: error instanceof Error ? error.message : 'The analysis could not be completed. Please try again.',
        recommendations: [
          'Check your internet connection',
          'Try uploading a smaller image file',
          'Ensure the image format is supported (JPG, PNG, GIF)',
          'Make sure the backend server is running on port 5001'
        ],
        votes: 0,
        totalModels: 0,
        workingModels: 0
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadAnnotatedImage = () => {
    if (annotatedImage) {
      const link = document.createElement('a');
      link.href = annotatedImage;
      link.download = `skin-analysis-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetAnalysis = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
    setSelectedImage(null);
    setAnalysisResult(null);
    setAnnotatedImage(null);
    setShowOriginalImage(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Skin Analysis
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Upload a clear image of the skin condition and let our AI ensemble provide detailed analysis with visual detection
            </p>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column - Image Display */}
            <div className="space-y-4">
              <div className="lg:sticky lg:top-24">
                {annotatedImage ? (
                  <div className="space-y-4">
                    <Card className="p-4 bg-white shadow-lg border-green-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-semibold">AI Analysis Complete</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowOriginalImage(!showOriginalImage)}
                            className="flex items-center space-x-1"
                          >
                            {showOriginalImage ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span>{showOriginalImage ? 'Hide Original' : 'Show Original'}</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={downloadAnnotatedImage}
                            className="flex items-center space-x-1"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </Button>
                        </div>
                      </div>
                      
                      <div className="relative rounded-lg overflow-hidden border-2 border-green-300 bg-black">
                        <img
                          src={showOriginalImage && selectedImage ? selectedImage.previewUrl : annotatedImage}
                          alt={showOriginalImage ? "Original skin condition" : "Analyzed skin condition with bounding boxes"}
                          className="w-full h-auto min-h-[300px] max-h-[60vh] object-contain"
                        />
                        {showOriginalImage && (
                          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                            Original Image
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2 text-blue-800 mb-1">
                          <Brain className="h-4 w-4" />
                          <span className="text-sm font-medium">AI Detection Results</span>
                        </div>
                        <p className="text-xs text-blue-700">
                          Bounding boxes show detected skin conditions. Colors indicate different conditions, labels show confidence scores and model consensus.
                        </p>
                      </div>
                    </Card>
                  </div>
                ) : selectedImage ? (
                  <div className="space-y-4">
                    <Card className="p-4 bg-white shadow-lg border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-blue-900">Image Preview</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetAnalysis}
                          className="flex items-center space-x-1"
                        >
                          <X className="h-4 w-4" />
                          <span>Remove</span>
                        </Button>
                      </div>
                      <div className="relative rounded-lg overflow-hidden border-2 border-blue-300 bg-white">
                        <img
                          src={selectedImage.previewUrl}
                          alt="Selected skin condition"
                          className="w-full h-auto min-h-[300px] max-h-[60vh] object-contain"
                        />
                      </div>
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">File:</span>
                          <span className="font-medium truncate max-w-[200px]">{selectedImage.file.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Size:</span>
                          <span className="font-medium">{(selectedImage.file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                ) : (
                  <Card className="border-2 border-dashed border-blue-300 p-8 sm:p-12 text-center bg-white shadow-lg">
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center">
                        <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">No Image Selected</h3>
                        <p className="text-sm sm:text-base text-muted-foreground mt-2">
                          Upload an image to view it here in full size
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Right Column - Controls & Results */}
            <div className="space-y-6">
              <Card className="p-6 bg-white shadow-lg border-purple-200">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-purple-900">Upload Image</h3>
                <ImageUpload onImageSelect={handleImageSelect} selectedImage={selectedImage} />
              </Card>

              {selectedImage && !analysisResult && !isAnalyzing && (
                <Card className="p-6 bg-white shadow-lg border-green-200">
                  <div className="text-center space-y-4">
                    <Button
                      onClick={startAnalysis}
                      disabled={isAnalyzing}
                      size="lg"
                      className="w-full px-8 py-6 text-lg gradient-blink text-white shadow-lg"
                    >
                      <Brain className="mr-2 h-6 w-6" />
                      Start AI Analysis
                    </Button>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>Powered by ensemble of 3 AI models:</p>
                      <div className="flex justify-center space-x-4 text-xs">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">YOLOv8</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">YOLO-NAS</span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">EfficientDet</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {isAnalyzing && (
                <Card className="p-6 bg-white shadow-lg border-orange-200">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-3">
                      <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                      <h3 className="text-lg font-semibold text-orange-900">Analyzing Your Image</h3>
                    </div>
                    <Progress value={analysisProgress} className="h-3 bg-orange-100" />
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {analysisProgress}% Complete - Running ensemble analysis...
                      </p>
                      <div className="flex justify-center space-x-3 text-xs">
                        <span className={`px-2 py-1 rounded ${analysisProgress >= 45 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                          YOLOv8 {analysisProgress >= 45 ? '✓' : '...'}
                        </span>
                        <span className={`px-2 py-1 rounded ${analysisProgress >= 65 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                          YOLO-NAS {analysisProgress >= 65 ? '✓' : '...'}
                        </span>
                        <span className={`px-2 py-1 rounded ${analysisProgress >= 80 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                          EfficientDet {analysisProgress >= 80 ? '✓' : '...'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {analysisResult && (
                <div className="space-y-4">
                  <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200 shadow-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg sm:text-xl font-semibold text-green-900">Analysis Results</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetAnalysis}
                        className="border-green-300 text-green-800 hover:bg-green-100"
                      >
                        New Analysis
                      </Button>
                    </div>
                  </Card>
                  <AnalysisResults result={analysisResult} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}