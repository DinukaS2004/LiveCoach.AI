import axios from 'axios';
import { api, authHeaders } from './api';

export interface AnalyzeResponse {
  success: boolean;
  message: string;
  data: {
    analysisId: string;
    overall_score: number;
    performance_level: string;
    distance_to_expert: number;
    avg_similarity: number;
    max_similarity: number;
    frames_analyzed: number;
    shot_display_name: string;
  };
}

export interface AnalysisHistory {
  success: boolean;
  message: string;
  data: Array<{
    _id: string;
    sport: string;
    shot: string;
    score: number;
    timestamp: string;
    performanceLevel: string;
  }>;
}

export interface ProgressResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    averageScore: number;
    latestScore: number;
    improvement: number;
    history: Array<{
      _id: string;
      score: number;
      timestamp: string;
    }>;
  };
}

/**
 * Get available sports from the backend
 */
export const getAvailableSports = async () => {
  try {
    const response = await api.get('/api/ai/sports');
    return response.data;
  } catch (error) {
    console.error('Error fetching sports:', error);
    throw error;
  }
};

/**
 * Upload video and analyze technique
 * @param videoUri - File URI from device
 * @param sport - Sport type (e.g., 'badminton', 'cricket')
 * @param shot - Shot type (e.g., 'smash', 'cover_drive')
 * @param idToken - Firebase ID token for authentication
 */
export const uploadAndAnalyze = async (
  videoUri: string,
  sport: string,
  shot: string,
  idToken: string
): Promise<AnalyzeResponse> => {
  try {
    const formData = new FormData();
    
    // Add video file to form data
    const videoFile = {
      uri: videoUri,
      type: 'video/mp4',
      name: `video_${Date.now()}.mp4`,
    } as any;
    
    formData.append('video', videoFile);

    const headers = await authHeaders(idToken);
    
    const response = await api.post(
      `/api/ai/analyze/${sport}/${shot}`,
      formData,
      {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes for video upload and processing
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error uploading and analyzing video:', error);
    throw error;
  }
};

/**
 * Get analysis history for the current user
 * @param idToken - Firebase ID token for authentication
 * @param sport - Optional: filter by sport
 * @param shot - Optional: filter by shot
 * @param limit - Optional: max number of results (default: 20)
 */
export const getAnalysisHistory = async (
  idToken: string,
  sport?: string,
  shot?: string,
  limit?: number
): Promise<AnalysisHistory> => {
  try {
    const params: any = {};
    if (sport) params.sport = sport;
    if (shot) params.shot = shot;
    if (limit) params.limit = limit;

    const headers = await authHeaders(idToken);

    const response = await api.get('/api/ai/history', {
      headers,
      params,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    throw error;
  }
};

/**
 * Get a specific analysis by ID
 * @param analysisId - The analysis ID
 * @param idToken - Firebase ID token for authentication
 */
export const getAnalysisById = async (
  analysisId: string,
  idToken: string
) => {
  try {
    const headers = await authHeaders(idToken);

    const response = await api.get(`/api/ai/analysis/${analysisId}`, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching analysis:', error);
    throw error;
  }
};

/**
 * Get progress data for a specific sport/shot
 * @param sport - Sport type
 * @param shot - Shot type
 * @param idToken - Firebase ID token for authentication
 */
export const getProgress = async (
  sport: string,
  shot: string,
  idToken: string
): Promise<ProgressResponse> => {
  try {
    const headers = await authHeaders(idToken);

    const response = await api.get(`/api/ai/progress/${sport}/${shot}`, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching progress:', error);
    throw error;
  }
};

/**
 * Check AI service health
 */
export const checkAIServiceHealth = async () => {
  try {
    const response = await api.get('/api/ai/health');
    return response.data;
  } catch (error) {
    console.error('Error checking AI service health:', error);
    throw error;
  }
};
