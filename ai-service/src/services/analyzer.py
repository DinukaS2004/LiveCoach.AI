import torch
import torch.nn.functional as F
import numpy as np
from typing import List, Dict
from src.core.config import settings

class Analyzer:
    @staticmethod
    def analyze(model, pro_embeddings, sequence: List[Dict]) -> Dict:
        frames = sequence[:settings.SEQUENCE_LENGTH] if len(sequence) >= settings.SEQUENCE_LENGTH else sequence
        if len(frames) < settings.SEQUENCE_LENGTH:
            frames = frames + [frames[-1]] * (settings.SEQUENCE_LENGTH - len(frames))
        
        keypoints = np.array([f['keypoints'] for f in frames])
        test_tensor = torch.FloatTensor(keypoints).unsqueeze(0).to(settings.device)
        
        with torch.no_grad():
            test_emb = model(test_tensor)
            pro_center = torch.mean(pro_embeddings, dim=0)
            distance = F.pairwise_distance(test_emb, pro_center.unsqueeze(0))
            similarities = F.cosine_similarity(
                test_emb.unsqueeze(1), 
                pro_embeddings.unsqueeze(0),
                dim=2
            )
            max_similarity = torch.max(similarities).item()
            avg_similarity = torch.mean(similarities).item()
        
        similarity_score = avg_similarity * 100
        distance_score = max(0, 100 - distance.item() * 20)
        overall_score = (similarity_score * 0.7) + (distance_score * 0.3)
        
        performance_level = (
            "Elite" if overall_score >= 90 else
            "Advanced" if overall_score >= 75 else
            "Intermediate" if overall_score >= 60 else
            "Beginner" if overall_score >= 40 else
            "Novice"
        )
        
        return {
            'overall_score': float(overall_score),
            'performance_level': performance_level,
            'distance_to_expert': float(distance.item()),
            'max_similarity': float(max_similarity),
            'avg_similarity': float(avg_similarity),
        }