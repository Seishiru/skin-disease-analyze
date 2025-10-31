import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { CheckCircle, MapPin, Target, Users, Brain } from 'lucide-react';

export interface AnalysisResult {
  condition: string;
  accuracy: number;
  confidence: 'High' | 'Medium' | 'Low';
  affectedArea: string;
  description: string;
  recommendations: string[];
  votes?: number;
  totalModels?: number;
  workingModels?: number;
}

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const getConditionColor = (condition: string) => {
    const colors: Record<string, string> = {
      'Acne': 'bg-red-100 text-red-800 border-red-200',
      'Eczema': 'bg-orange-100 text-orange-800 border-orange-200',
      'Melasma': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Shingles': 'bg-purple-100 text-purple-800 border-purple-200',
      'Rosacea': 'bg-pink-100 text-pink-800 border-pink-200',
      'No Condition Detected': 'bg-gray-100 text-gray-800 border-gray-200',
      'Analysis Failed': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[condition] || colors['No Condition Detected'];
  };

  const getConfidenceColor = (confidence: string) => {
    const colors: Record<string, string> = {
      'High': 'bg-green-100 text-green-800 border-green-200',
      'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Low': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[confidence];
  };

  const getVoteColor = (votes: number, total: number) => {
    const percentage = votes / total;
    if (percentage >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
    if (percentage >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold text-green-900">Analysis Complete</h3>
            <p className="text-green-700">Your skin condition has been analyzed by our AI ensemble.</p>
          </div>
        </div>
      </Card>

      {/* Main Results */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Classification Results */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Classification Results
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Detected Condition</label>
              <div className="mt-1">
                <Badge className={`text-base px-3 py-1 ${getConditionColor(result.condition)}`}>
                  {result.condition}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Detection Accuracy</label>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{result.accuracy}%</span>
                  <Badge className={getConfidenceColor(result.confidence)}>
                    {result.confidence} Confidence
                  </Badge>
                </div>
                <Progress value={result.accuracy} className="h-2" />
              </div>
            </div>

            {/* Ensemble Voting Information */}
            {result.votes !== undefined && result.workingModels !== undefined && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Model Agreement</label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {result.votes} of {result.workingModels} models agree
                      </span>
                    </div>
                    <Badge className={getVoteColor(result.votes, result.workingModels)}>
                      {result.votes === result.workingModels ? 'Unanimous' : 
                       result.votes >= Math.ceil(result.workingModels * 0.67) ? 'Strong Consensus' : 
                       'Majority Vote'}
                    </Badge>
                  </div>
                  <div className="flex space-x-1">
                    {Array.from({ length: result.workingModels }).map((_, index) => (
                      <div
                        key={index}
                        className={`flex-1 h-2 rounded ${
                          index < result.votes! ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground">Affected Location</label>
              <div className="mt-1 flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-base">{result.affectedArea}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Description & Info */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Condition Information</h4>
          <p className="text-muted-foreground leading-relaxed">
            {result.description}
          </p>
          
          {/* AI Model Information */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 text-blue-800">
              <Brain className="h-4 w-4" />
              <span className="text-sm font-medium">Powered by AI Ensemble</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Analysis performed by multiple AI models (YOLOv8, YOLO-NAS, EfficientDet) 
              combined through ensemble learning for higher accuracy.
            </p>
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4">Recommendations</h4>
        <ul className="space-y-3">
          {result.recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-muted-foreground">{recommendation}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Disclaimer */}
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <p className="text-sm text-yellow-800">
          <strong>Important:</strong> This AI analysis is for informational purposes only and should not replace professional medical advice. 
          Please consult with a qualified dermatologist for proper diagnosis and treatment.
        </p>
      </Card>
    </div>
  );
}