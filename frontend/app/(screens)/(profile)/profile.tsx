import React, { useEffect, useState } from 'react';
import { 
  View, Text, ScrollView, Image, Pressable, StyleSheet, ActivityIndicator,
  Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform 
} from 'react-native';
import { 
  ChevronRight, Camera, SlidersHorizontal, 
  RotateCw, LogOut // <--- Changed Trash2 to LogOut here
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import ImagePickerSheet from '../../components/ImagePickerSheet';

export interface AthleteData {
  name: string;
  role: 'Athlete';
}

interface ProfileAthleteProps {
  data: AthleteData;
  profileImage?: string | null;
  onPressSessions: () => void;
  onUpdateName: (name: string) => Promise<void>;
  onUpdateProfileImage: (localUri: string | null) => Promise<void>;
  isSavingName?: boolean;
  isSavingImage?: boolean;
}

const fallbackProfileImage = require("../../../assets/Profile/fallback_Athlete.jpg");

// --- SHARED HEXAGON BUTTON ---
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

const ProfileAthlete = ({
  data,
  profileImage,
  onPressSessions,
  onUpdateName,
  onUpdateProfileImage,
  isSavingName = false,
  isSavingImage = false,
}: ProfileAthleteProps) => {
  const router = useRouter();
  const [sheetVisible, setSheetVisible] = useState(false);

  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [nameInput, setNameInput] = useState(data.name);

  // Keep input updated
  useEffect(() => {
    setNameInput(data.name);
  }, [data.name]);

  //Update the name in the backend
  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || isSavingName) return;
    await onUpdateName(trimmed);
    setIsEditVisible(false);
  };

  // Handle Logout Logic
  const handleLogout = () => {
    setIsOptionsVisible(false);
    // Add your actual logout logic here (e.g., clearing async storage, updating auth context)
    // router.replace('/login');
  };

  return (
    <>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header Section */}
        <View className="w-full relative" style={{ aspectRatio: 1 }}>
          <Image 
            source={profileImage ? { uri: profileImage } : fallbackProfileImage}
            className="w-full h-full"
            resizeMode="cover"
          />

          <TouchableOpacity 
            onPress={() => { setNameInput(data.name); setIsOptionsVisible(true); }}
            className="absolute top-12 right-5 bg-black/20 p-2.5 rounded-full"
          >
            <SlidersHorizontal size={24} color="white" strokeWidth={2} />
          </TouchableOpacity>
          
          <Pressable
            disabled={isSavingImage}
            onPress={() => setSheetVisible(true)}
            className="absolute bottom-7 right-3 bg-white p-2.5 rounded-full shadow-md active:scale-95"
            style={{ elevation: 10, zIndex: 10, opacity: isSavingImage ? 0.7 : 1 }}
          >
            {isSavingImage ? (
              <ActivityIndicator size="small" color="black" />
            ) : (
              <Camera size={22} color="black" strokeWidth={2} />
            )}
          </Pressable>

          <View className="absolute bottom-6 left-6">
            <Text className="text-white text-xs font-bold uppercase tracking-widest opacity-90" style={styles.textShadow}>{data.role}</Text>
            {/* Render the athlete's name */}
            <Text className="text-white text-5xl font-bebas uppercase tracking-tighter" style={styles.textShadow}>{data.name}</Text>
          </View>
        </View>

        <View className="mt-1 px-4">
          <Pressable onPress={onPressSessions} className="px-4 py-6 border-b border-neutral-100 flex-row justify-between items-center active:opacity-50">
            <Text className="text-xl font-manrope text-black uppercase">SESSIONS</Text>
            <ChevronRight size={22} color="#ADABAB" strokeWidth={1.5} />
          </Pressable>
          
          <Pressable 
            onPress={() => {
               router.push("/(screens)/(profile)/prograssChart" as any); 
            }}
            className="px-4 py-6 border-b border-neutral-100 flex-row justify-between items-center active:opacity-50"
          >
            <Text className="text-xl font-manrope text-black uppercase">PROGRESS CHART</Text>
            <ChevronRight size={22} color="#ADABAB" strokeWidth={1.5} />
          </Pressable>
        </View>
      </ScrollView>

      {/* Options Modal */}
      <Modal visible={isOptionsVisible} transparent animationType="fade">
        <TouchableOpacity className="flex-1 justify-center items-center bg-black/60 px-8" activeOpacity={1} onPress={() => setIsOptionsVisible(false)}>
          <View className="bg-white w-full rounded-[40px] p-10 items-center shadow-2xl">
            <HexButton title="EDIT NAME" color="#F8FE11" icon={RotateCw} onPress={() => { setIsOptionsVisible(false); setIsEditVisible(true); }} />
            {/* --- THIS IS THE FIX: Updated to LOGOUT and LogOut icon --- */}
            <HexButton title="LOGOUT" color="#FF3B3B" icon={LogOut} onPress={handleLogout} />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Name Modal */}
      <Modal visible={isEditVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <TouchableOpacity className="flex-1 justify-center items-center bg-black/50 px-6" activeOpacity={1} onPress={() => setIsEditVisible(false)}>
            <View className=" w-full rounded-[35px] p-8 shadow-2xl items-center bg-white">
              <Text className="font-bebas text-2xl font-black mb-6 italic uppercase">EDIT NAME</Text>
              <TextInput value={nameInput} onChangeText={setNameInput} className="border-2 border-neutral-200 rounded-2xl w-full p-4 text-center uppercase text-lg font-bold" autoFocus />
              <View className="w-full mt-6">
                
                <HexButton
                  title={isSavingName ? "SAVING..." : "SAVE"}
                  color="#F8FE11"
                  onPress={handleSaveName}
                />
                <HexButton title="CANCEL" color="#9E9E9E" onPress={() => setIsEditVisible(false)} />
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      <ImagePickerSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        canRemoveImage={!!profileImage}
        onImageSelected={(uri) => {
          void onUpdateProfileImage(uri);
        }}
        onRemoveImage={() => {
          void onUpdateProfileImage(null);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  textShadow: { textShadowColor: 'rgba(0, 0, 0, 0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 10 }
});

export default ProfileAthlete;