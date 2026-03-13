import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Modal } from 'react-native';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { auth } from '../../../lib/firebase';
import { router } from "expo-router";
import { authHeaders } from "@/lib/api";

// Base API URL
const BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

// format as the backend: YYYY-MM-DD.
const toDateKey = (year: number, monthIndex: number, day: number) => {
  const utcDate = new Date(Date.UTC(year, monthIndex, day));
  return utcDate.toISOString().slice(0, 10);
};

const formatAnalysisTime = (timestamp?: string) => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

interface PrograssChartProps {
  onBackPress?: () => void;
}

interface AnalysisItem {
  id?: string;
  sport?: string;
  shot?: string;
  shotDisplayName?: string;
  score?: number;
  performanceLevel?: string;
  timestamp?: string;
}

const PrograssChart: React.FC<PrograssChartProps> = ({ onBackPress }) => {
  
  // Get today's actual date
  const today = new Date();
  const actualYear = today.getFullYear();
  const actualMonth = today.getMonth(); // 0-indexed
  const actualDay = today.getDate();

  const [selectedYear, setSelectedYear] = useState(actualYear);
  // Active dates where AI analysis was created.
  const [activeDates, setActiveDates] = useState<string[]>([]);
  const [analysesByDate, setAnalysesByDate] = useState<Record<string, AnalysisItem[]>>({});
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [isAnalysisModalVisible, setIsAnalysisModalVisible] = useState(false);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const activeDateSet = useMemo(() => new Set(activeDates), [activeDates]);
  const selectedDayAnalyses = useMemo(
    () => (selectedDateKey ? analysesByDate[selectedDateKey] || [] : []),
    [analysesByDate, selectedDateKey],
  );

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

     const handleBack = () => {
        if (onBackPress) return onBackPress();
        if (isNavigatingBack) return;

        setIsNavigatingBack(true);
        router.replace("/(screens)/(profile)");
      };

  useEffect(() => {
    let isMounted = true;

    // Load analysis dates and day-wise analysis summaries for chart + list.
    const fetchProgressData = async () => {
      try {
        const idToken = await auth.currentUser?.getIdToken();

        if (!idToken) {
          throw new Error('Unable to authorize request.');
        }

        const response = await fetch(`${BASE}api/progress/my-sessions`, {
          method: 'GET',
          headers: await authHeaders(idToken),
        });

        const payload = await response.json();
        const analysisDates = Array.isArray(payload?.data?.analysisDates)
          ? payload.data.analysisDates
          : Array.isArray(payload?.data?.sessionDates)
            ? payload.data.sessionDates
            : [];

        const rawAnalysesByDate = payload?.data?.analysesByDate;
        const normalizedAnalysesByDate: Record<string, AnalysisItem[]> = {};

        if (rawAnalysesByDate && typeof rawAnalysesByDate === 'object') {
          Object.entries(rawAnalysesByDate as Record<string, unknown>).forEach(([dateKey, items]) => {
            if (Array.isArray(items)) {
              normalizedAnalysesByDate[dateKey] = items as AnalysisItem[];
            }
          });
        }

        if (isMounted) {
          setActiveDates(analysisDates);
          setAnalysesByDate(normalizedAnalysesByDate);
          setSelectedDateKey((prev) => (prev && analysisDates.includes(prev) ? prev : null));
        }
      } catch (error) {
        console.error('Failed to load progress chart data:', error);
        if (isMounted) {
          setActiveDates([]);
          setAnalysesByDate({});
          setSelectedDateKey(null);
        }
      }
    };

    fetchProgressData();

    return () => {
      isMounted = false;
    };
  }, []);

  const renderCalendarDays = (monthIndex: number) => {
    const daysInMonth = new Date(selectedYear, monthIndex + 1, 0).getDate();
    const startDay = new Date(selectedYear, monthIndex, 1).getDay();

    const emptyDays = Array.from({ length: startDay }, (_, i) => `empty-${i}`);
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <View className="w-full">
        {/* Weekday Headers */}
        <View className="flex-row w-full mb-1">
          {weekDays.map((wd, i) => (
            <View key={`wd-${i}`} style={{ width: '14.28%' }} className="items-center">
              <Text style={{ fontSize: 6, color: '#9CA3AF', fontWeight: 'bold' }}>{wd}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View className="flex-row flex-wrap w-full">
          {emptyDays.map((emptyKey) => (
            <View key={emptyKey} style={{ width: '14.28%', aspectRatio: 1 }} />
          ))}

          {daysArray.map((day) => {
            const dateKey = toDateKey(selectedYear, monthIndex, day);
            const isToday = selectedYear === actualYear && monthIndex === actualMonth && day === actualDay;
            const isWorkDay = activeDateSet.has(dateKey);
            const isSelectedDay = selectedDateKey === dateKey;

            return (
              <TouchableOpacity
                key={day} 
                style={{ width: '14.28%', aspectRatio: 1 }}
                className="p-[1px] items-center justify-center"
                onPress={() => {
                  if (isWorkDay) {
                    setSelectedDateKey(dateKey);
                    setIsAnalysisModalVisible(true);
                  }
                }}
                disabled={!isWorkDay}
              >
                <View 
                  className={`w-full h-full items-center justify-center rounded-full
                    ${isWorkDay ? 'bg-accent-yellow' : ''} 
                    ${isToday && !isWorkDay ? 'border border-[#FF4081]' : ''}
                    ${isSelectedDay ? 'border border-[#150000]' : ''}
                  `}
                >
                  <Text 
                    style={{ 
                      fontSize: 8, 
                      fontWeight: 'bold',
                      color: isWorkDay ? '#000000' : isToday ? '#FF4081' : '#9CA3AF' 
                    }}
                  >
                    {day}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity onPress={handleBack}>
          <ArrowLeft size={28} color="black" strokeWidth={3} />
        </TouchableOpacity>
        <Text className="ml-4 font-bebas text-3xl text-black uppercase tracking-tighter">
          PROGRESS CHART
        </Text>
      </View>

      {/* Scrollable Area */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        className="px-4"
        maximumZoomScale={3} 
        minimumZoomScale={1}
        bouncesZoom={true}
      >
        {/* YEAR NAVIGATION */}
        <View className="flex-row items-center justify-center mt-2 mb-2">
          <TouchableOpacity onPress={() => setSelectedYear(y => y - 1)} className="p-2 active:opacity-50">
            <ChevronLeft size={32} color="#FF4081" strokeWidth={3} />
          </TouchableOpacity>
          
          <Text className="mx-6 font-bebas text-7xl text-[#FF4081]">
            {selectedYear}
          </Text>
          
          <TouchableOpacity onPress={() => setSelectedYear(y => y + 1)} className="p-2 active:opacity-50">
            <ChevronRight size={32} color="#FF4081" strokeWidth={3} />
          </TouchableOpacity>
        </View>

        <Text className="text-center text-base text-neutral-500 mb-6 font-manrope">
          Tap a highlighted date to view that day's analyses.
        </Text>

        {/* 12-Month Grid */}
        <View className="flex-row flex-wrap justify-between">
          {months.map((monthName, index) => {
            const isCurrentMonth = selectedYear === actualYear && index === actualMonth;
            return (
              <View 
                key={monthName} 
                className="w-[31%] bg-white rounded-2xl p-1.5 mb-4 shadow-sm border border-neutral-100"
                style={{ elevation: 3 }}
              >
                <Text 
                  className={`text-center font-bold text-[10px] mb-1.5 
                    ${isCurrentMonth ? 'text-[#FF4081]' : 'text-black'}
                  `}
                >
                  {monthName}
                </Text>
                {renderCalendarDays(index)}
              </View>
            );
          })}
        </View>

        <View className="h-20" />
      </ScrollView>

      <Modal
        visible={isAnalysisModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAnalysisModalVisible(false)}
      >
        <View
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
        >
          <View
            className="rounded-3xl bg-neutral-200 px-5 pb-5 pt-4"
            style={{ width: '88%', height: '68%' }}
          >
            <View className="mb-3 flex-row items-center justify-between ">
              <View className='mb-6'>
                <Text className="font-bebas text-4xl text-primary-dark tracking-tight ">ANALYSES</Text>
                <Text className="font-manrope text-sm text-primary-dark">
                  {selectedDateKey || 'Selected day'}
                  <Text className="text-[#FF4081] font-bold ">
                    {selectedDateKey ? ` (${selectedDayAnalyses.length})` : ''}
                  </Text>
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setIsAnalysisModalVisible(false)}
                className="rounded-full border border-neutral-300 px-3 py-1"
              >
                <Text className="font-manrope text-xs text-primary-dark">CLOSE</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-1">
              {selectedDayAnalyses.length === 0 ? (
                <Text className="mt-2 font-manrope text-sm text-neutral-500">
                  No analyses found for this date.
                </Text>
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 8 }}
                >
                {selectedDayAnalyses.map((analysis, index) => {
                  const displayShot = analysis.shotDisplayName || analysis.shot || 'Shot';
                  const displaySport = analysis.sport || 'sport';
                  const displayTime = formatAnalysisTime(analysis.timestamp);

                  return (
                    <View
                      key={analysis.id || `${selectedDateKey}-${index}`}
                      className="mb-2 bg-primary-light rounded-xl border border-neutral-200 p-3"
                    >
                      <Text className="text-sm font-semibold text-black">
                        {displaySport.toUpperCase()} - {displayShot}
                      </Text>
                      <Text className="mt-1 text-xs text-neutral-600">
                        Score: {typeof analysis.score === 'number' ? analysis.score : 'N/A'}
                        {analysis.performanceLevel ? ` | Level: ${analysis.performanceLevel}` : ''}
                        {displayTime ? ` | Time: ${displayTime}` : ''}
                      </Text>
                    </View>
                  );
                })}
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PrograssChart;