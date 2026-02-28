import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import SportTabs from './SportTabs';
import CoachCard from './CoachCard';
import CoachContactModal from './CoachContactModel';
import CreateGigCard from './CreateGigCard';
import CreateGigModal from './CreateGigModal';
import { getAllGigs } from '../../../services/gigService';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; 
import { auth } from '@/lib/firebase'; 


type Coach = {
  id: string;
  name: string;
  location: string;
  sport: 'Cricket' | 'Badminton';
  price: number;
  billingCycle: 'Monthly' | 'Yearly';
  phone?: string;
  email?: string;
  image: any;
};

const Index = () => {
  
  const [userRole, setUserRole] = useState<'athlete' | 'coach' | null>(null);
  
  const [selectedSport, setSelectedSport] = useState<'Cricket' | 'Badminton'>('Cricket');
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 4. Listen for the logged-in user
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          // Call your team's existing profile endpoint to get the role
          const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/user/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const result = await response.json();
          
          if (result.success) {
            setUserRole(result.data.role); // Set role to 'coach' or 'athlete'
          }
        } catch (error) {
          console.error("Failed to fetch user role:", error);
        }
      }
    });

    fetchData(); // Fetch the gigs list
    return unsubscribe; // Cleanup
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const result = await getAllGigs();
    
    if (result.success) {
      // Map the backend MongoDB data to our frontend Coach type
      const formattedGigs = result.data.map((gig: any) => ({
        id: gig._id,
        name: gig.name,
        location: gig.location,
        sport: gig.sport,
        price: gig.price,
        billingCycle: gig.billingCycle,
        phone: gig.phone,
        email: gig.email,
        // Using local assets based on sport since we haven't handled dynamic image uploads yet
        image: gig.sport === 'Cricket' 
          ? require('../../../assets/BrowseCoachImages/cricketCoach1.png')
          : require('../../../assets/BrowseCoachImages/badmintonCoach1.jpg'),
      }));
      
      setCoaches(formattedGigs);
    }
    setLoading(false);
  };

  // Filter based on the selected tab (Cricket/Badminton)
  const visibleCoaches = coaches.filter(coach => coach.sport === selectedSport);

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4 pt-6">
          <Text className="font-bebas text-4xl font-bold text-black">
            COACH GIGS
          </Text>

          <View className="mt-4">
            <SportTabs value={selectedSport} onSportChange={setSelectedSport} />
          </View>

          {/* Show Create card only for coaches */}
          {userRole === 'coach' && (
            <CreateGigCard onPress={() => setIsCreateModalVisible(true)} />
          )}

          {loading ? (
            <View className="mt-20 justify-center items-center">
              <ActivityIndicator size="large" color="#facc15" />
              <Text className="mt-2 text-gray-500 font-manrope">Fetching Gigs...</Text>
            </View>
          ) : (
            <View className="mt-4 flex-row flex-wrap justify-between">
              {visibleCoaches.length > 0 ? (
                visibleCoaches.map(coach => (
                  <View key={coach.id} className="w-[48%] mb-4">
                    <CoachCard
                      name={coach.name}
                      location={coach.location}
                      price={coach.price}
                      billingCycle={coach.billingCycle}
                      image={coach.image}
                      onContactPress={() => setSelectedCoach(coach)}
                    />
                  </View>
                ))
              ) : (
                <View className="w-full mt-10 items-center">
                  <Text className="text-gray-400">No {selectedSport} gigs found.</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modals */}
      <CoachContactModal 
        visible={!!selectedCoach} 
        coach={selectedCoach} 
        onClose={() => setSelectedCoach(null)} 
      />

      <CreateGigModal 
        visible={isCreateModalVisible} 
        onClose={() => {
          setIsCreateModalVisible(false);
          fetchData(); // Refresh the list after closing the modal
        }} 
      />
    </SafeAreaView>
  );
};

export default Index;