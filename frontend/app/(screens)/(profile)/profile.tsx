import React, { useState } from 'react';
import { 
  View, Text, ScrollView, Image, Pressable, StyleSheet, 
  Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform 
} from 'react-native';
import { 
  ChevronRight, Camera, SlidersHorizontal, 
  RotateCw, Trash2 
} from 'lucide-react-native';
import ImagePickerSheet from '../../components/ImagePickerSheet';

export interface AthleteData {
  name: string;
  role: 'Athlete';
}

interface ProfileAthleteProps {
  data: AthleteData;
  onPressSessions: () => void; 
}

// --- SHARED HEXAGON BUTTON COMPONENT ---
const HexButton = ({ title, onPress, color, icon: Icon }: any) => {
  const pointSize = 24;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="my-2 w-full items-center">
      <View className="flex-row items-center justify-center">
        <View style={{ width: 0, height: 0, borderTopWidth: pointSize, borderTopColor: 'transparent', borderBottomWidth: pointSize, borderBottomColor: 'transparent', borderRightWidth: pointSize, borderRightColor: color }} />
        <View style={{ backgroundColor: color, height: pointSize * 2 }} className="flex-row items-center justify-center px-4 min-w-[200px]">
          <Text className="font-bebas text-2xl font-black text-black uppercase">{title}</Text>
          {Icon && <View className="ml-3"><Icon size={20} color="black" strokeWidth={2.5} /></View>}
        </View>
        <View style={{ width: 0, height: 0, borderTopWidth: pointSize, borderTopColor: 'transparent', borderBottomWidth: pointSize, borderBottomColor: 'transparent', borderLeftWidth: pointSize, borderLeftColor: color }} />
      </View>
    </TouchableOpacity>
  );
};

const ProfileAthlete = ({ data, onPressSessions }: ProfileAthleteProps) => {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // --- STATE FOR THE NAME SHOWN ON PAGE ---
  const [displayName, setDisplayName] = useState(data.name);
  
  // Modal States
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);

  const handleImageSelected = (imageUri: string) => {
    setSelectedImage(imageUri);
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setDisplayName(nameInput); // This updates the name on the page immediately
      setIsEditVisible(false);
    }
  };

  return (
    <>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} className="flex-1 bg-white">
        {/* Header Section */}
        <View className="h-[400px] w-full relative">
          <Image 
            source={selectedImage ? { uri: selectedImage } : require("../../../assets/BrowseCoachImages/cricketCoach3.jpg")}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* TOP RIGHT MORE BUTTON */}
          <TouchableOpacity 
            onPress={() => {
              setNameInput(displayName); // Reset input to current name before opening
              setIsOptionsVisible(true);
            }}
            className="absolute top-12 right-5 bg-black/20 p-2.5 rounded-full"
          >
            <SlidersHorizontal size={24} color="white" strokeWidth={2} />
          </TouchableOpacity>
          
          <Pressable
            onPress={() => setSheetVisible(true)}
            className="absolute bottom-7 right-3 bg-white p-2.5 rounded-full shadow-md active:scale-95"
            style={{ elevation: 10, zIndex: 10 }}
          >
            <Camera size={22} color="black" strokeWidth={2} />
          </Pressable>

          {/* ATHLETE NAME DISPLAYED HERE */}
          <View className="absolute bottom-6 left-6">
            <Text className="text-white text-xs font-bold uppercase tracking-widest opacity-90" style={styles.textShadow}>
              {data.role}
            </Text>
            <Text className="text-white text-5xl font-bebas uppercase tracking-tighter" style={styles.textShadow}>
              {displayName}
            </Text>
          </View>
        </View>

        <View className="mt-1 px-4">
          <Pressable onPress={onPressSessions} className="px-4 py-6 border-b border-neutral-100 flex-row justify-between items-center active:opacity-50">
            <Text className="text-xl font-manrope text-black uppercase">SESSIONS</Text>
            <ChevronRight size={22} color="#ADABAB" strokeWidth={1.5} />
          </Pressable>
          
          <Pressable className="px-4 py-6 border-b border-neutral-100 flex-row justify-between items-center active:opacity-50">
            <Text className="text-xl font-manrope text-black uppercase">PROGRESS CHART</Text>
            <ChevronRight size={22} color="#ADABAB" strokeWidth={1.5} />
          </Pressable>
        </View>
      </ScrollView>

      {/* --- OPTIONS MODAL --- */}
      <Modal visible={isOptionsVisible} transparent animationType="fade">
        <TouchableOpacity className="flex-1 justify-center items-center bg-black/60 px-8" activeOpacity={1} onPress={() => setIsOptionsVisible(false)}>
          <View className="bg-white w-full rounded-[40px] p-10 items-center shadow-2xl">
            <HexButton title="EDIT NAME" color="#F8FE11" icon={RotateCw} onPress={() => { setIsOptionsVisible(false); setIsEditVisible(true); }} />
            <HexButton title="DELETE PROFILE" color="#FF3B3B" icon={Trash2} onPress={() => setIsOptionsVisible(false)} />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* --- EDIT NAME MODAL --- */}
      <Modal visible={isEditVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <TouchableOpacity className="flex-1 justify-center items-center bg-black/50 px-6" activeOpacity={1} onPress={() => setIsEditVisible(false)}>
            <View className="bg-white w-full rounded-[35px] p-8 shadow-2xl items-center">
              <Text className="font-bebas text-2xl font-black mb-6 italic uppercase">EDIT ATHLETE NAME</Text>
              <View className="border-2 border-[#F8FE11] rounded-2xl w-full px-4 py-4 mb-8">
                <TextInput value={nameInput} onChangeText={setNameInput} className="text-lg font-bold text-center uppercase" autoFocus />
              </View>
              <View className="w-full">
                <HexButton title="SAVE" color="#F8FE11" onPress={handleSaveName} />
                <HexButton title="CANCEL" color="#9E9E9E" onPress={() => setIsEditVisible(false)} />
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      <ImagePickerSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} onImageSelected={handleImageSelected} />
    </>
  );
};

const styles = StyleSheet.create({
  textShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  }
});

export default ProfileAthlete;