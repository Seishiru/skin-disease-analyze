"""
Flask API for React frontend integration - FIXED PATHS
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
from werkzeug.utils import secure_filename
import sys

# Add the parent directory to Python path to import your ensemble module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import your ensemble functions
try:
    from ensemble_detector import SkinDiseaseEnsemble
    print("✅ Successfully imported SkinDiseaseEnsemble")
except ImportError as e:
    print(f"❌ Import error: {e}")
    # Create a fallback class for testing
    class SkinDiseaseEnsemble:
        def __init__(self):
            self.class_names = ["Acne", "Eczema", "Melasma", "Rosacea", "Shingles"]
        
        def analyze_image(self, image_path):
            # Fallback mock response for testing
            return {
                'detections': [{
                    'class_name': 'Eczema',
                    'score': 0.85,
                    'votes': 3,
                    'box': [100, 100, 200, 200]
                }],
                'total_detections': 1,
                'total_models': 3,
                'working_models': 3,
                'annotated_image_path': None
            }

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration - use absolute paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
RESULTS_FOLDER = os.path.join(BASE_DIR, 'results-ensemble')
WEIGHTS_DIR = os.path.join(BASE_DIR, 'weights')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

print(f"📁 Base directory: {BASE_DIR}")
print(f"📁 Weights directory: {WEIGHTS_DIR}")

# Initialize the ensemble model with correct paths
print("🚀 Loading ensemble models...")
try:
    ensemble_model = SkinDiseaseEnsemble()
    print("✅ Ensemble model ready!")
except Exception as e:
    print(f"❌ Failed to initialize ensemble model: {e}")
    ensemble_model = None

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_confidence_level(score):
    """Convert score to confidence level"""
    if score >= 0.8:
        return 'High'
    elif score >= 0.6:
        return 'Medium'
    else:
        return 'Low'

def get_affected_area(box):
    """Determine affected area based on bounding box position"""
    x1, y1, x2, y2 = box
    center_y = (y1 + y2) / 2
    
    if center_y < 0.33:
        return 'Upper facial area'
    elif center_y < 0.66:
        return 'Mid facial area'
    else:
        return 'Lower facial area'

def get_condition_description(condition):
    """Get description for each condition"""
    descriptions = {
        'Acne': 'Acne is a common skin condition that occurs when hair follicles become plugged with oil and dead skin cells.',
        'Eczema': 'Eczema (atopic dermatitis) is a condition that makes your skin red and itchy.',
        'Melasma': 'Melasma causes brown or gray-brown patches, usually on the face, often related to hormonal changes.',
        'Rosacea': 'Rosacea causes redness and visible blood vessels in your face, often with small, red, pus-filled bumps.',
        'Shingles': 'Shingles is a viral infection that causes a painful rash, caused by the varicella-zoster virus.'
    }
    return descriptions.get(condition, 'Skin condition detected with AI analysis.')

def get_condition_recommendations(condition):
    """Get recommendations for each condition"""
    recommendations = {
        'Acne': [
            'Use gentle, non-comedogenic cleansers twice daily',
            'Apply topical treatments containing salicylic acid or benzoyl peroxide',
            'Avoid touching or picking at affected areas',
            'Consult a dermatologist for prescription treatments if needed'
        ],
        'Eczema': [
            'Keep skin moisturized with fragrance-free lotions',
            'Avoid known triggers such as certain soaps or fabrics',
            'Use mild, unscented laundry detergents',
            'Consider prescription topical medications'
        ],
        'Melasma': [
            'Use broad-spectrum sunscreen daily (SPF 30 or higher)',
            'Wear wide-brimmed hats when outdoors',
            'Consider topical lightening agents prescribed by a dermatologist',
            'Avoid hormonal triggers when possible'
        ],
        'Rosacea': [
            'Identify and avoid personal triggers (spicy foods, alcohol, stress)',
            'Use gentle, fragrance-free skincare products',
            'Apply broad-spectrum sunscreen daily',
            'Consider prescription treatments from a dermatologist'
        ],
        'Shingles': [
            'Seek immediate medical attention for antiviral treatment',
            'Keep the rash clean and covered',
            'Apply cool, wet compresses to reduce pain',
            'Avoid contact with pregnant women and immunocompromised individuals'
        ]
    }
    return recommendations.get(condition, [
        'Consult with a dermatologist for professional evaluation',
        'Monitor the condition for any changes',
        'Seek immediate medical attention if symptoms worsen'
    ])

@app.route('/api/analyze', methods=['POST'])
def analyze_skin():
    if ensemble_model is None:
        return jsonify({'error': 'AI models are not loaded. Please check the server logs.'}), 500
        
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload PNG, JPG, or JPEG'}), 400

        # Save uploaded file
        filename = secure_filename(file.filename)
        unique_id = uuid.uuid4().hex
        unique_filename = f"{unique_id}_{filename}"
        filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(filepath)
        
        # Run ensemble analysis
        print(f"🔍 Analyzing: {filename}")
        result = ensemble_model.analyze_image(filepath)
        
        # DEBUG: Print what we're getting from the ensemble
        print(f"📊 Raw result from ensemble:")
        print(f"   - Detections: {len(result.get('detections', []))}")
        print(f"   - Annotated image available: {bool(result.get('annotated_image'))}")
        if result.get('detections'):
            for i, det in enumerate(result['detections']):
                print(f"   - Detection {i+1}: {det['class_name']} (score: {det['score']:.3f}, votes: {det['votes']})")
                print(f"     Box coordinates: {det['box']}")
        
        # Prepare response for React frontend
        response = {
            'status': 'success',
            'analysis_id': unique_id,
            'detections': [],
            'ensemble_stats': {
                'total_models': result.get('total_models', 0),
                'working_models': result.get('working_models', 0),
                'total_detections': result.get('total_detections', 0)
            }
        }
        
        # ADD THIS LINE: Include the annotated image in the response
        if result.get('annotated_image'):
            response['annotated_image'] = result['annotated_image']
            print("✅ Annotated image included in response")
        
        # Add detections
        for detection in result.get('detections', []):
            response['detections'].append({
                'condition': detection['class_name'],
                'accuracy': round(detection['score'] * 100, 1),
                'confidence': get_confidence_level(detection['score']),
                'votes': detection['votes'],
                'bounding_box': detection['box'],
                'affected_area': get_affected_area(detection['box']),
                'description': get_condition_description(detection['class_name']),
                'recommendations': get_condition_recommendations(detection['class_name'])
            })
        
        print(f"✅ Analysis complete: {len(response['detections'])} detections found")
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Analysis error: {str(e)}")
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    models_loaded = ensemble_model is not None
    return jsonify({'status': 'healthy', 'models_loaded': models_loaded})

if __name__ == '__main__':
    print(f"📁 Upload folder: {UPLOAD_FOLDER}")
    print(f"📁 Results folder: {RESULTS_FOLDER}")
    app.run(debug=True, port=5001, host='0.0.0.0')