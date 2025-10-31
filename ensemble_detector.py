"""
Enhanced ensemble detector with proper class structure - WITH BOUNDING BOXES
"""

import os
import numpy as np
from ultralytics import YOLO
import torch
from PIL import Image, ImageDraw, ImageFont
from collections import Counter
import base64
import io

class SkinDiseaseEnsemble:
    def __init__(self):
        self.class_names = ["Acne", "Eczema", "Melasma", "Rosacea", "Shingles"]
        self.iou_thresh = 0.5
        
        # HARDCODED CORRECT PATH
        self.BASE_DIR = r"C:\Users\rapha\OneDrive\Desktop\Portfolio\skin-detection\skin-disease-detection"
        self.WEIGHTS_DIR = os.path.join(self.BASE_DIR, 'weights')
        self.RESULTS_DIR = os.path.join(self.BASE_DIR, 'results-ensemble')
        
        print(f"📁 Using hardcoded base directory: {self.BASE_DIR}")
        print(f"📁 Weights directory: {self.WEIGHTS_DIR}")
        
        # Create results directory
        os.makedirs(self.RESULTS_DIR, exist_ok=True)
        
        # Check if weights directory exists
        if os.path.exists(self.WEIGHTS_DIR):
            print(f"✅ Weights directory exists")
            # List files in weights directory
            weight_files = os.listdir(self.WEIGHTS_DIR)
            print(f"📄 Files in weights directory: {weight_files}")
        else:
            print(f"❌ Weights directory does not exist: {self.WEIGHTS_DIR}")
        
        self.models = self._load_models()
        
    def _load_models(self):
        """Load all available models with absolute paths"""
        models = {}
        
        # YOLOv8
        yolov8_path = os.path.join(self.WEIGHTS_DIR, 'yolov8-best.pt')
        print(f"🔍 Looking for YOLOv8 at: {yolov8_path}")
        print(f"   File exists: {os.path.exists(yolov8_path)}")
        
        try:
            if os.path.exists(yolov8_path):
                models['YOLOv8'] = YOLO(yolov8_path)
                print("✅ YOLOv8 loaded successfully")
            else:
                print(f"❌ YOLOv8 file not found: {yolov8_path}")
                models['YOLOv8'] = None
        except Exception as e:
            print(f"❌ YOLOv8 failed to load: {e}")
            models['YOLOv8'] = None
        
        # YOLO-NAS placeholder
        try:
            if os.path.exists(yolov8_path):  # Use YOLOv8 as placeholder
                models['YOLO-NAS'] = YOLO(yolov8_path)
                print("✅ YOLO-NAS placeholder loaded")
            else:
                print("❌ YOLO-NAS placeholder not available (YOLOv8 not found)")
                models['YOLO-NAS'] = None
        except Exception as e:
            print(f"❌ YOLO-NAS failed: {e}")
            models['YOLO-NAS'] = None
        
        # EfficientDet placeholder  
        try:
            if os.path.exists(yolov8_path):  # Use YOLOv8 as placeholder
                models['EfficientDet'] = YOLO(yolov8_path)
                print("✅ EfficientDet placeholder loaded")
            else:
                print("❌ EfficientDet placeholder not available (YOLOv8 not found)")
                models['EfficientDet'] = None
        except Exception as e:
            print(f"❌ EfficientDet failed: {e}")
            models['EfficientDet'] = None
            
        return models
    
    def _run_yolov8_inference(self, model, image_path, source_name):
        """Run YOLOv8 inference"""
        if model is None:
            return []
        
        try:
            results = model.predict(source=image_path, conf=0.2, verbose=False)
            detections = []
            
            for r in results:
                if r.boxes is not None and len(r.boxes) > 0:
                    boxes = r.boxes.xyxy.cpu().numpy()
                    confs = r.boxes.conf.cpu().numpy()
                    cls_ids = r.boxes.cls.cpu().numpy().astype(int)
                    
                    for box, conf, cid in zip(boxes, confs, cls_ids):
                        if cid < len(self.class_names):
                            detections.append({
                                "box": box.tolist(),
                                "score": float(conf),
                                "class_id": int(cid),
                                "class_name": self.class_names[cid],
                                "source": source_name
                            })
            return detections
        except Exception as e:
            print(f"❌ {source_name} inference failed: {e}")
            return []
    
    def _iou(self, boxA, boxB):
        """Calculate Intersection over Union"""
        xA = max(boxA[0], boxB[0])
        yA = max(boxA[1], boxB[1])
        xB = min(boxA[2], boxB[2])
        yB = min(boxA[3], boxB[3])
        
        interW = max(0.0, xB - xA)
        interH = max(0.0, yB - yA)
        inter = interW * interH
        
        areaA = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
        areaB = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])
        union = areaA + areaB - inter
        
        return inter / union if union > 0 else 0.0
    
    def _cluster_and_vote(self, detections, min_votes=2):
        """Fuse detections using IoU clustering + majority voting"""
        if len(detections) == 0:
            return []

        dets = sorted(detections, key=lambda d: d["score"], reverse=True)
        used = [False] * len(dets)
        ensembles = []

        for i, d in enumerate(dets):
            if used[i]:
                continue
            group_idxs = [i]
            used[i] = True
            for j in range(i+1, len(dets)):
                if used[j]:
                    continue
                if self._iou(d["box"], dets[j]["box"]) >= self.iou_thresh:
                    group_idxs.append(j)
                    used[j] = True

            # Gather attributes
            group = [dets[k] for k in group_idxs]
            classes = [g["class_id"] for g in group]
            scores = [g["score"] for g in group]
            boxes = [g["box"] for g in group]
            sources = [g["source"] for g in group]

            # Majority voting
            vote_counts = Counter(classes)
            best_class = max(vote_counts, key=vote_counts.get)
            distinct_votes = len(set(sources))
            
            if distinct_votes >= min_votes:
                # Confidence-weighted box average
                weights = np.array(scores) / np.sum(scores)
                boxes_arr = np.vstack(boxes)
                avg_box = np.sum(boxes_arr * weights[:, None], axis=0)

                # Average confidence for the winning class
                ensemble_conf = np.mean([s for s, c in zip(scores, classes) if c == best_class])

                ensembles.append({
                    "box": avg_box.tolist(),
                    "score": ensemble_conf,
                    "class_id": best_class,
                    "class_name": self.class_names[best_class],
                    "votes": distinct_votes
                })
        
        return ensembles
    
    def _create_annotated_image(self, image_path, detections):
        """Create annotated image with bounding boxes and labels"""
        img = Image.open(image_path).convert("RGB")
        draw = ImageDraw.Draw(img)
        
        try:
            # Try to load a font
            font = ImageFont.truetype("arial.ttf", 20)
        except:
            try:
                font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 20)
            except:
                font = ImageFont.load_default()

        colors = ["red", "lime", "blue", "orange", "purple"]

        for det in detections:
            x1, y1, x2, y2 = det["box"]
            cls = det["class_name"]
            score = det["score"]
            votes = det["votes"]
            color = colors[det["class_id"] % len(colors)]

            # Draw bounding box
            draw.rectangle([x1, y1, x2, y2], outline=color, width=3)

            # Prepare label text
            label = f"{cls} ({score:.2f}, {votes} votes)"

            # Measure text size
            text_bbox = draw.textbbox((x1, y1), label, font=font)
            text_width = text_bbox[2] - text_bbox[0]
            text_height = text_bbox[3] - text_bbox[1]

            # Background rectangle
            bg_padding = 4
            bg_coords = [x1, y1 - text_height - bg_padding, x1 + text_width + bg_padding*2, y1]
            draw.rectangle(bg_coords, fill="black")

            # Draw label text
            draw.text((x1 + bg_padding, y1 - text_height - bg_padding/2), label, fill="white", font=font)
        
        return img
    
    def _image_to_base64(self, image):
        """Convert PIL image to base64 string"""
        buffered = io.BytesIO()
        image.save(buffered, format="JPEG", quality=85)
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return f"data:image/jpeg;base64,{img_str}"
    
    def analyze_image(self, image_path):
        """Main analysis function"""
        # Run inference with all models
        all_detections = []
        
        # YOLOv8
        yolo_dets = self._run_yolov8_inference(self.models.get('YOLOv8'), image_path, "YOLOv8")
        all_detections.extend(yolo_dets)
        
        # YOLO-NAS placeholder
        yolo_nas_dets = self._run_yolov8_inference(self.models.get('YOLO-NAS'), image_path, "YOLO-NAS")
        all_detections.extend(yolo_nas_dets)
        
        # EfficientDet placeholder
        effdet_dets = self._run_yolov8_inference(self.models.get('EfficientDet'), image_path, "EfficientDet")
        all_detections.extend(effdet_dets)
        
        # Ensemble fusion
        working_models = sum(1 for model in self.models.values() if model is not None)
        min_votes = max(1, (working_models // 2))
        ensembles = self._cluster_and_vote(all_detections, min_votes=min_votes)
        
        # Create annotated image
        annotated_image_b64 = None
        if ensembles:
            annotated_img = self._create_annotated_image(image_path, ensembles)
            annotated_image_b64 = self._image_to_base64(annotated_img)
            
            # Also save to file
            base_name = os.path.splitext(os.path.basename(image_path))[0]
            output_path = os.path.join(self.RESULTS_DIR, f"{base_name}_annotated.jpg")
            annotated_img.save(output_path, quality=95)
            print(f"💾 Saved annotated image to: {output_path}")
        
        return {
            'detections': ensembles,
            'total_detections': len(all_detections),
            'total_models': len(self.models),
            'working_models': working_models,
            'annotated_image': annotated_image_b64
        }