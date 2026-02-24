import React, { useState, useLayoutEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {router, useNavigation} from 'expo-router'; // Add this import
import ProfileAthlete, { AthleteData } from './profile';
import ProfileCoach, { CoachData } from './profile-coach';
import SessionsScreen from './sessions';

export interface Player {
  id: string;
  name: string;
}
export interface UserProfileData {
  role: 'Athlete' | 'Coach';
  name: string;
  isVerified?: boolean;
  players?: Player[];
  sessions?: string[]; 
}

const Index = () => {
  const [view, setView] = useState<'profile' | 'sessions'>('profile');
  const navigation = useNavigation(); // Initialize navigation

  //Athelet sample data
  const athleteData: UserProfileData = {
    role: 'Athlete',
    name: 'JOHN DOE'
  };

  //Coach sample data
  const coachData: UserProfileData = {
    role: 'Coach',
    name: 'JANE DOE',
    isVerified: true,
    players: [
      { id: '1', name: 'PLAYER 1' },
      { id: '2', name: 'PLAYER 2' },
      { id: '3', name: 'PLAYER 3' },
      { id: '4', name: 'PLAYER 4' }
    ]
  };

  //User change (Athlete or Coach)
  const currentUser = athleteData; // Change to coachData to test coach view

  // This logic hides the bottom navbar dynamically
  useLayoutEffect(() => {
  navigation.setOptions({
    tabBarStyle: [
      {
        height: 65,
        paddingBottom: 10,
        paddingTop: 10,
      },
      {
        display: view === "sessions" ? "none" : "flex",
      },
    ],
  });
}, [navigation, view]);


  return (
    <SafeAreaView 
      className="flex-1 bg-primary" 
      edges={view === 'sessions' ? ['top'] : ['bottom']}
    >
      <View className="flex-1">
        {currentUser.role === "Coach" ? (
            <ProfileCoach
                data={currentUser as unknown as CoachData}
                onPressPlayer={() => router.push("/(screens)/(profile)/sessions")}
            />
        ) : (
            <ProfileAthlete
                data={currentUser as unknown as AthleteData}
                onPressSessions={() => router.push("/(screens)/(profile)/sessions")}
            />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Index;