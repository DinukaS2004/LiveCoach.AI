import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import SportTabs from './SportTabs';
import CoachCard from './CoachCard';
import CoachContactModal from './CoachContactModel';
import CreateGigCard from './CreateGigCard';
import CreateGigModal from './CreateGigModal';
import MyGigButton from './MyGigButton'; 
import { getAllGigs } from '../../../services/gigService';
import { onAuthStateChanged } from 'firebase/auth'; 
import { auth } from '@/lib/firebase'; 

const Index = () => {
  const [userRole, setUserRole] = useState<'athlete' | 'coach' | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<'Cricket' | 'Badminton'>('Cricket');
  const [selectedCoach, setSelectedCoach] = useState<any | null>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for the UI toggle and storing the data
  const [hasExistingGig, setHasExistingGig] = useState(false);
  const [myExistingGig, setMyExistingGig] = useState<any>(null);

  // 1. Load User Profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/user/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const result = await response.json();
          if (result.success) {
            setUserRole(result.data.role);
            setCurrentUserId(String(result.data.userId || result.data._id));
          }
        } catch (error) {
          console.error("Profile error:", error);
        }
      }
    });
    fetchData(); 
    return unsubscribe; 
  }, []);

  // 2. Fetch all gigs and store them
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getAllGigs();
      if (result.success) {
        const formatted = (result.data || []).map((gig: any) => {
          let extractedOwnerId = "";
          if (gig.coachId) {
            extractedOwnerId = typeof gig.coachId === 'object' 
              ? String(gig.coachId._id || gig.coachId.id || "") 
              : String(gig.coachId);
          }
          return { ...gig, id: String(gig._id), ownerId: extractedOwnerId };
        });
        setCoaches(formatted);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Check if the current user owns one of the gigs
  useEffect(() => {
    if (currentUserId && coaches.length > 0) {
      const foundGig = coaches.find(gig => 
        String(gig.ownerId).trim() === String(currentUserId).trim()
      );
      
      if (foundGig) {
        setHasExistingGig(true);
        setMyExistingGig(foundGig); // Save the specific gig details
      } else {
        setHasExistingGig(false);
        setMyExistingGig(null);
      }
    }
  }, [currentUserId, coaches]);

  const visibleCoaches = coaches.filter(c => c.sport === selectedSport);

  return (
  <SafeAreaView className="flex-1 bg-primary-light">
    {/* Fixed Header Section */}
    <View className="px-4 py-4 pt-6">
      <Text className="font-bebas text-4xl font-bold text-primary-dark">
        COACH GIGS
      </Text>

      <View className="mt-4">
        <SportTabs value={selectedSport} onSportChange={setSelectedSport} />
      </View>

      {userRole === 'coach' && (
        <View>
          {hasExistingGig ? (
            <MyGigButton onPress={() => setIsCreateModalVisible(true)} />
          ) : (
            <CreateGigCard onPress={() => setIsCreateModalVisible(true)} />
          )}
        </View>
      )}
    </View>

    {/* Scrollable List Section */}
    {loading ? (
      <View className="mt-20 justify-center items-center">
        <ActivityIndicator size="large" color="#facc15" />
      </View>
    ) : (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 30 }}
      >
        {visibleCoaches.map((coach) => (
          <View key={coach.id} className="w-full">
            <CoachCard
              {...coach}
              onContactPress={() => setSelectedCoach(coach)}
              image={
                coach.sport === 'Cricket'
                  ? require('../../../assets/BrowseCoachImages/cricketCoach1.png')
                  : require('../../../assets/BrowseCoachImages/badmintonCoach1.jpg')
              }
            />
          </View>
        ))}
      </ScrollView>
    )}

    <CoachContactModal
      visible={!!selectedCoach}
      coach={selectedCoach}
      onClose={() => setSelectedCoach(null)}
    />

    <CreateGigModal
      visible={isCreateModalVisible}
      existingGig={myExistingGig}
      onClose={() => {
        setIsCreateModalVisible(false);
        fetchData();
      }}
    />
  </SafeAreaView>
);
};

export default Index;