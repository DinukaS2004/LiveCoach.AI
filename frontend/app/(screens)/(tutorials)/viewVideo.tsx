import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';

type TabButtonProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

const styles = StyleSheet.create({
  triangleLeft: {
    width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid',
    borderTopWidth: 18, borderBottomWidth: 18, borderRightWidth: 12,
    borderTopColor: 'transparent', borderBottomColor: 'transparent',
  },
  triangleRight: {
    width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid',
    borderTopWidth: 18, borderBottomWidth: 18, borderLeftWidth: 12,
    borderTopColor: 'transparent', borderBottomColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 140, //extra space for the last item to be fully visible 
  },
  contenttriangleLeft: {
    width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid',
    borderTopWidth: 26, borderBottomWidth: 26, borderRightWidth: 16,
    borderTopColor: 'transparent', borderBottomColor: 'transparent',
  },
  contenttriangleRight: {
    width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid',
    borderTopWidth: 26, borderBottomWidth: 26, borderLeftWidth: 16,
    borderTopColor: 'transparent', borderBottomColor: 'transparent',
  },
  
});

const TabButton = ({ label, isActive, onPress }: TabButtonProps) => (
  <Pressable onPress={onPress} className="flex-row items-center">
    <View style={styles.triangleLeft} className={isActive ? 'border-r-accent-yellow' : 'border-r-neutral-50'} />
    <View className={`h-[36px] px-4 justify-center items-center ${isActive ? 'bg-accent-yellow' : 'bg-neutral-50'}`}>
      <Text className={`font-manrope uppercase tracking-tighter ${isActive ? 'font-extrabold text-black' : 'font-semibold  text-neutral-800'}`}>
        {label}
      </Text>
    </View>
    <View style={styles.triangleRight} className={isActive ? 'border-l-accent-yellow' : 'border-l-neutral-50'} />
  </Pressable>
);

const ViewVideo = ({ activeSport, onBack, onSelect, setSport }: any) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState('');


  const cricketTutorial = ['FUNDAMENTALS', 'FRONT FOOT DEFENCE', 'BACK FOOT DEFENCE', 'COVER DRIVE', 'STRAIGHT DRIVE', 'ON DRIVE', 'SQUARE DRIVE', 'SQUARE CUT', 'LATE CUT', 'BACK FOOT PUNCH', 'PULL SHOT', 'HOOK SHOT', 'FLICK', 'UPPER CUT', 'LEG GLANCE',  'SWEEP', 'SLOG SWEEP', 'REVERSE SWEEP', 'SCOOP'];
  const badmintonTutorial = ['SMASH', 'CLEAR', 'DROP', 'NET SHOT'];

  const baseTechniques = activeSport === 'cricket' ? cricketTutorial : badmintonTutorial;
  const filteredTechniques = baseTechniques.filter(item => item.toLowerCase().includes(searchText.toLowerCase()));
  
  return (
    <View className="flex-1 bg-primary">
      <View className="py-4 pb-4 px-4">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={onBack} className="p-1 -ml-2">
              <Ionicons name="chevron-back" size={40} color="black" />
            </TouchableOpacity>
            <Text className="font-bebas text-4xl text-black pt-1">TUTORIALS</Text>
          </View>
          <TouchableOpacity 
            onPress={() => {
              if (isSearching) setSearchText(''); // Clear the text when search is closed
              setIsSearching(!isSearching);
            }} 
            className="px-2 mb-4"
          >
            <Ionicons name={isSearching ? "close" : "search"} size={25} color="#000" />
          </TouchableOpacity>
        </View>

        {isSearching && (
          <View className="mb-4 flex-row items-center bg-primary border bg-white border-neutral-200 rounded-full px-4 h-10">
            <TextInput
              autoFocus
              placeholder="Search shots..."
              placeholderTextColor={"#848181"}
              value={searchText}
              onChangeText={setSearchText}
              className="flex-1 font-manrope"
            />
          </View>
        )}

        <View className="flex-row gap-2 mb-6">
          <TabButton label="Cricket" isActive={activeSport === 'cricket'} onPress={() => { setSport('cricket'); setSearchText(''); }} />
          <TabButton label="Badminton" isActive={activeSport === 'badminton'} onPress={() => { setSport('badminton'); setSearchText(''); }} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Check the list is empty */}
        {filteredTechniques.length === 0 ? (
          <View className="mt-52 items-center justify-center">
            <Ionicons name="search-outline" size={48} color="#ADABAB" />
            <Text className="font-manrope text-neutral-600 text-2xl text-center mt-4">
              Technique not found...
            </Text>
          </View>
        ) : (
          /* If items exist*/
          filteredTechniques.map((technique, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center mx-4 mb-2 active:opacity-70"
              onPress={() => onSelect(technique)}
            >
              {/* Left Triangle */}
              <View style={styles.contenttriangleLeft} className="border-r-neutral-50" />
        
              {/* Middle Body */}
              <View className="flex-1 h-[52px] bg-neutral-50 flex-row items-center justify-between px-1">
                <Text className="font-manrope font-base text-primary-dark uppercase tracking-tight px-3">
                  {technique}
                </Text>
                <Entypo name="chevron-right" size={20} color="#5B5757" style={{ paddingRight: 10 }} />
              </View>

              {/* Right Triangle */}
              <View style={styles.contenttriangleRight} className="border-l-neutral-50" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default ViewVideo;