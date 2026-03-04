import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Octicons from '@expo/vector-icons/Octicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';

export type AnalyticsData = {
  overallScore: number;
  maxScore: number;
  // distanceValue: number;       // e.g. 1.369
  // distanceProgress: number;    // 0–100
  // similarityScore: number;     // e.g. 0.062
  overallFeedback?: string;
  feedbackPositive: string[];      // ✅ list of good points
  feedbackNegative: string[];      // ✅ list of issues
  recommendations: string[];       // ✅ list of suggestions
};

type Props = {
  data: AnalyticsData;
};

const AnalyticsCard = ({ data }: Props) => {
  const { overallScore, maxScore, feedbackPositive, feedbackNegative, recommendations } = data;

  // Derived metrics (all driven by overallScore)
  const similarityScore = overallScore / maxScore;          // 0 → 1
  const distanceValue = 1 - similarityScore;                // 1 → 0
  const distanceProgress = overallScore;                    // 0–100, same as score


  // ----- Performance level styling -----
  const getScoreStyle = (score: number) => {
    if (score < 30) {
      return {
        label: 'Needs improvement',
        color: '#EF4444',   // red-500
      };
    } else if (score < 55) {
      return {
        label: 'Below average',
        color: '#F97316',   // orange-500
      };
    } else if (score < 75) {
      return {
        label: 'On track',
        color: '#EAB308',   // amber-500
      };
    } else {
      return {
        label: 'Excellent',
        color: '#22C55E',   // green-500
      };
    }
  };

  const { label: performanceLabel, color: performanceColor } = getScoreStyle(overallScore);


  const radius = 65;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const scorePercentage = (overallScore / maxScore) * 100;
  const strokeDashoffset = circumference - (scorePercentage / 100) * circumference;

  /* BOUNCE ANIMATION  */

  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);


  return (
    
    <View className="flex-1">
      {/* Overall Score */}
      {/* <View className="mt-10 bg-white rounded-2xl p-8 border border-gray-100 shadow-lg shadow-black/5"> */}
      <View className="mt-5 bg-white rounded-2xl p-8 border border-neutral-500"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 4,
          }}
      >
        
        <View className="flex-row items-center">
          {/* Circle */}
          <View className="mr-5">
            <Svg width={radius * 2 + 10} height={radius * 2 + 10}>
              <Circle
                cx={radius + 5}
                cy={radius + 5}
                r={normalizedRadius}
                stroke="#E0E0E0"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx={radius + 5}
                cy={radius + 5}
                r={normalizedRadius}
                stroke={performanceColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${radius + 5} ${radius + 5})`}
              />
            </Svg>

            <View className="absolute left-0 right-0 top-0 bottom-0 items-center justify-center">
              <Text className="font-manrope text-2xl font-bold text-primary-dark">
                {overallScore}/{maxScore}
              </Text>
              <Text className="font-manrope text-[12px] text-neutral-700 italic">Overall Score</Text>
            </View>
          </View>

          {/* Text */}
          <View className="flex-1">
            <Text className="font-manrope text-2xl font-semibold mb-1"
            style={{ color: performanceColor }}>
            {performanceLabel}
            </Text>
            {/* <Text className="text-lg text-gray-500">Today&apos;s session</Text> */}
            <View className="self-start mt-1 px-3 py-1 rounded-full bg-accent-yellow">
              <Text className="font-manrope text-[10px] font-bold text-primary-dark">
                TODAY&apos;S SESSION
              </Text>
            </View>
          </View>
        </View>
      </View>

      
      {/* Distance to Expert */}
      <View className="mt-6 bg-white rounded-2xl p-4 border border-neutral-500"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 4,
          }}
      >
        {/* <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-semibold text-gray-900">
            Distance to Expert
          </Text>
          <Text className="text-lg font-medium text-gray-700">
            {distanceValue.toFixed(2)} away
          </Text>

        </View> */}

        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center mb-2">
            <View className="w-1.5 h-6 rounded-full bg-accent-yellow mr-3" />
            <Text className="font-manrope text-2xl font-semibold text-primary-dark">
              Distance to Expert
            </Text>
          </View>
          

          <Text className="font-manrope text-lg font-medium text-neutral-800 mb-2">
            {distanceValue.toFixed(2)} away
          </Text>
        </View>

        {/* Progress Section */}
        <View className="relative pt-6 pb-4">
          <View className="h-4 bg-primary-light rounded-full overflow-visible">
            <View className="h-4"
                style={{
                  width: `${distanceProgress}%`,
                  backgroundColor: performanceColor,
                  borderTopLeftRadius: 999,        // react native doesnt have rounded-l-full.
                  borderBottomLeftRadius: 999,      //So we manually make the left corners fully rounded by using a large radius like 999
                }}
            />

            {/* Animated Avatar */}
            {/* <View className="absolute -top-4 w-10 h-10 rounded-full items-center justify-center border-4 "
                style={{
                  left: `${distanceProgress}%`,
                  transform: [{ translateX: -20 }],
                  backgroundColor: 'white',
                  borderColor: performanceColor,
                }}
            > */}

            <View
              className="absolute"
              style={{
                left: `${distanceProgress}%`,
                transform: [{ translateX: -3 }], // half of icon size
                top: -8, // adjust to sit nicely on the bar
              }}
            >
              <Animated.View
                style={{
                  transform: [
                    { translateY: bounceAnim },
                      {
                        rotate: bounceAnim.interpolate({
                        inputRange: [-3, 0],
                        outputRange: ['-3deg', '0deg'],
                        }),
                      },
                  ],
                }}
              >
            <Octicons name="feed-trophy" size={29} color={performanceColor} />
              
              </Animated.View>
            </View>
          </View>

            {/* Labels */}
          <View className="flex-row justify-between mt-6">
            <View>
              <Text className="font-manrope text-[10px]  text-green-500 uppercase">
              YOU
              </Text>
              <Text className="font-manrope text-xs font-bold text-neutral-700">
                0%
             </Text>
            </View>

            <View className="items-end">
              <Text className="font-manrope text-[10px]  text-red-500 uppercase">
               EXPERT
              </Text>
              <Text className="font-manrope text-xs font-bold text-neutral-700">
              100%
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Similarity Score */}
      <View className="mt-6 bg-white rounded-2xl p-4 border border-neutral-500"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <View className="flex-row items-center mb-4">
            <View className="w-1.5 h-6 rounded-full bg-accent-yellow mr-3" />
            <Text className="font-manrope text-2xl font-semibold text-primary-dark">
              Similarity Score
            </Text>
        </View>

        <View className="items-center mb-4">
          <Text className="font-manrope text-4xl font-semibold" style={{ color: performanceColor }}>
            {similarityScore.toFixed(3)}
          </Text>
        </View>

        <View className="items-center mb-6">
          <Text className="font-manrope text-xs text-neutral-700">
            Similarity (0 to 1)
          </Text>
        </View>

        {/* Dotted line + Dynamic Blue dot */}
        <View className="relative">
             {/* Dotted line */}
            <View className="flex-row justify-between mb-2">
                <View className="flex-1 border-t-2 border-dotted border-neutral-700" />
            </View>
    
        {/*  DYNAMIC BLUE DOT - moves based on similarityScore */}
        <View 
            className="absolute top-[-5px] w-3 h-3 rounded-full shadow-md" 
            style={{ 
                left: `${similarityScore * 100}%`,  // 0.062 → 6.2% from left
                backgroundColor: performanceColor,
                transform: [{ translateX: -6 }] // center the dot
            }}
        />


          <View className="flex-row justify-between">
            <Text className="font-manrope text-xs text-neutral-700">Low</Text>
            <Text className="font-manrope text-xs text-neutral-700">Medium</Text>
            <Text className="font-manrope text-xs text-neutral-700">High</Text>
          </View>
        </View>
      </View>

      
      
      {/* Feedback */}
      {/* Feedback – Coach Notes timeline style */}
        <View
          className="mt-6 bg-white rounded-2xl p-5 border border-neutral-500"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
  {/* Title */}
        <View className="flex-row items-center mb-6">
            <View className="w-1.5 h-6 rounded-full bg-accent-yellow mr-3" />
            <Text className="font-manrope text-2xl font-semibold text-primary-dark">
              Feedback
            </Text>
        </View>
  

  {/* Summary Box */}
          <View className="bg-yellow-50 rounded-xl p-5 mb-8">
            <Text className="font-manrope text-neutral-800 leading-relaxed">
              <Text style={{ color: performanceColor, fontWeight: '800'}}>
                Overall:{' '}
              </Text>
              <Text className="font-manrope text-neutral-800">
                {data.overallFeedback?.replace("Overall:", "").trim()}
              </Text>
            </Text>
          </View>

  {/* Timeline container */}
  <View className="relative">
    {/* Vertical line */}
    <View className="absolute left-5 top-0 bottom-0 w-[1px] bg-neutral-500" />

    {/* Combined notes */}
    <View>
      {/* 1) Positive notes */}
      {feedbackPositive.map((item, index) => (
        <View
          key={`pos-${index}`}
          className="relative flex-row items-start mb-6"
        >
          {/* Yellow circle with green check */}
          <View className="z-10 mr-4 ml-1">
            <View className="w-8 h-8 rounded-full bg-accent-yellow items-center justify-center">
              <MaterialIcons name="check" size={18} color="#16A34A" />
            </View>
          </View>

          {/* Text */}
          <View className="flex-1 pt-1">
            <Text className="font-manrope text-sm text-neutral-800 leading-relaxed">
              {item}
            </Text>
          </View>
        </View>
      ))}

      {/* 2) Negative notes */}
      {feedbackNegative.map((item, index) => (
        <View
          key={`neg-${index}`}
          className="relative flex-row items-start mb-6"
        >
          {/* Yellow circle with red alert */}
          <View className="z-10 mr-4 ml-1">
            <View className="w-8 h-8 rounded-full bg-accent-yellow items-center justify-center">
              <MaterialIcons name="error-outline" size={18} color="#DC2626" />
            </View>
          </View>

          {/* Text */}
          <View className="flex-1 pt-1">
            <Text className="font-manrope text-sm text-neutral-800 leading-relaxed">
              {item}
            </Text>
          </View>
        </View>
      ))}
    </View>
  </View>
</View>

      {/* Recommendations */}
      <View className="mt-6 bg-white rounded-2xl p-4 border border-neutral-500"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1 pr-3">
            <View className="w-1.5 h-6 rounded-full bg-accent-yellow mr-3" />
            <Text className="font-manrope text-2xl font-semibold text-primary-dark">
              Recommendations
            </Text>
          </View>

          <View className="px-3 py-1 rounded-full bg-accent-yellow ml-6">
            <Text className="font-manrope text-xs font-bold text-primary-dark">
              {recommendations.length} Tips
            </Text>
          </View>
        </View>

        <View className="space-y-3">
          {recommendations.map((item, index) => (
            <View
              key={`rec-${index}`}
              className="flex-row items-center px-4 py-3 rounded-full bg-yellow-50 mb-2"
            >
              <View className="w-9 h-9 rounded-full bg-amber-100 items-center justify-center mr-3">
                <MaterialIcons name="tips-and-updates" size={20} color="#FACC15" />
              </View>
              <Text className="font-manrope text-sm text-neutral-800 flex-1 ">
                {item}
              </Text>
              {/* NEW: Arrow circle */}
              <View className="w-8 h-8 rounded-full bg-white items-center justify-center ml-2">
                <Ionicons name="chevron-forward" size={18} color="black" />
              </View>
            </View>
          ))}
        </View>
      </View>

    </View>
  );
};

export default AnalyticsCard;
