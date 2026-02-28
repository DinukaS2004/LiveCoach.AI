from ultralytics import YOLO
import numpy as np
from typing import List, Dict
from src.core.config import settings

class SkeletonExtractor:
    def __init__(self):
        self.model = YOLO(settings.YOLO_MODEL)
        
    def extract_from_video(self, video_path: str) -> List[Dict]:
        results = self.model(source=video_path, stream=True, conf=0.3, verbose=False)
        skeleton_sequence = []
        
        for result in results:
            if len(result.keypoints.xy) > 0:
                keypoints = result.keypoints.xy[0].cpu().numpy()
                confidence = result.keypoints.conf[0].cpu().numpy()
                skeleton_sequence.append({
                    'keypoints': keypoints.tolist(),
                    'confidence': confidence.tolist()
                })
        
        return skeleton_sequence
    
    def normalize_skeleton(self, skeleton_sequence: List[Dict]) -> List[Dict]:
        normalized = []
        for frame in skeleton_sequence:
            kp = np.array(frame['keypoints'])
            if len(kp) >= 13:
                hip_center = (kp[11] + kp[12]) / 2
                kp = kp - hip_center
                shoulder_center = (kp[5] + kp[6]) / 2
                torso_length = np.linalg.norm(shoulder_center - hip_center)
                if torso_length > 0:
                    kp = kp / torso_length
            normalized.append({
                'keypoints': kp.tolist(),
                'confidence': frame['confidence']
            })
        return normalized