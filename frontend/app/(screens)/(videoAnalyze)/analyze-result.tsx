import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnalyticsCard, { AnalyticsData } from './AnalyticsCard';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getAnalysisById } from '@/lib/analyzeApi';
import { auth } from '@/lib/firebase';

const AnalyzeResult = () => {
  const navigation = useNavigation<any>();
  const { analysisId } = useLocalSearchParams<{ analysisId: string }>();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        if (!analysisId) {
          Alert.alert('Error', 'No analysis ID provided');
          setLoading(false);
          return;
        }

        const currentUser = auth.currentUser;
        if (!currentUser) {
          Alert.alert('Error', 'User not authenticated');
          setLoading(false);
          return;
        }

        const idToken = await currentUser.getIdToken();
        const response = await getAnalysisById(analysisId, idToken);

        if (response.success && response.data) {
          const data = response.data;
          
          // Transform backend response to AnalyticsData format
          const transformed: AnalyticsData = {
            overallScore: data.score || 0,
            maxScore: 100,
            overallFeedback: `Performance level: ${data.performanceLevel}. Distance to expert: ${data.distanceToExpert?.toFixed(2) || 'N/A'}`,
            feedbackPositive: [
              `Maximum similarity achieved: ${(data.maxSimilarity * 100).toFixed(1)}%`,
              `Average similarity: ${(data.avgSimilarity * 100).toFixed(1)}%`,
              `Frames analyzed: ${data.framesAnalyzed}`,
            ],
            feedbackNegative: [
              // These can be populated from detailed analysis if available
            ],
            recommendations: [
              'Review your technique against expert videos',
              'Practice regularly to improve form',
              'Focus on areas with lower similarity scores',
            ],
          };

          setAnalyticsData(transformed);
        } else {
          Alert.alert('Error', 'Failed to fetch analysis results');
        }
      } catch (error: any) {
        console.error('Error fetching analysis:', error);
        Alert.alert('Error', 'Failed to fetch analysis results');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [analysisId]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-primary items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  if (!analyticsData) {
    return (
      <SafeAreaView className="flex-1 bg-primary items-center justify-center px-4">
        <Text className="text-center text-lg text-black">
          Failed to load analysis results
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="px-4 pt-6">
        <View className="flex-row items-start mb-4 w-full">
          <TouchableOpacity 
            onPress={() => {
              navigation.navigate('(videoAnalyze)/index');
            }}
            className="p-1 -ml-2 flex-shrink-0"
          >
            <Ionicons name="chevron-back" size={36} color="black" />
          </TouchableOpacity>
          
          <Text 
            className="font-bebas font-bold text-black flex-1 text-4xl"
            style={{ lineHeight: 40 }} 
          >
            ANALYTICS AND FEEDBACK
          </Text>
        </View>
      </View>

      <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 24 }}>
        <AnalyticsCard data={analyticsData} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AnalyzeResult;
