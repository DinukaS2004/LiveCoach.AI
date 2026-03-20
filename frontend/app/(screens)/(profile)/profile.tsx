import React, { useEffect, useState } from 'react';
import { 
  View, Text, ScrollView, Image, Pressable, StyleSheet, ActivityIndicator,
  Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert 
} from 'react-native';
import { 
  ChevronRight, Camera, SlidersHorizontal, 
  RotateCw, LogOut, 
  PencilIcon
  RotateCw, LogOut, Trash2 
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import ImagePickerSheet from '../../components/ImagePickerSheet';

// ---> IMPORT YOUR AUTH CONTEXT HERE <---
// Note: Adjust this import path if your AuthContext is saved in a different folder
import { useAuth } from '../../context/AuthContext'; 

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
  onDeleteProfile?: () => Promise<void>;
  isSavingName?: boolean;
  isSavingImage?: boolean;
}

const fallbackProfileImage = require("../../../assets/Profile/fallback_Athlete.jpg");

// --- SHARED HEXAGON BUTTON ---
const HexButton = ({ title, onPress, color, icon: Icon, textColor = 'black', iconColor = 'black' }: any) => {
  const pointSize = 24;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="my-2 w-full items-center">
      <View className="flex-row items-center justify-center">
        <View style={{ width: 0, height: 0, borderTopWidth: pointSize, borderTopColor: 'transparent', borderBottomWidth: pointSize, borderBottomColor: 'transparent', borderRightWidth: pointSize, borderRightColor: color }} />
        <View style={{ backgroundColor: color, height: pointSize * 2 }} className="flex-row items-center justify-center px-4 min-w-[200px]">
          <Text style={{ color: textColor }} className="font-bebas text-2xl uppercase">{title}</Text>
          {Icon && <View className="ml-3"><Icon size={20} color={iconColor} strokeWidth={2.5} /></View>}
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
  onDeleteProfile,
  isSavingName = false,
  isSavingImage = false,
}: ProfileAthleteProps) => {
  const router = useRouter();
  
  // ---> INITIALIZE LOGOUT FROM YOUR CONTEXT <---
  const { logout } = useAuth(); 

  const [sheetVisible, setSheetVisible] = useState(false);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [nameInput, setNameInput] = useState(data.name);

  // Keep input updated
  useEffect(() => {
    setNameInput(data.name);
  }, [data.name]);

  // Update the name in the backend
  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || isSavingName) return;
    await onUpdateName(trimmed);
    setIsEditVisible(false);
  };

  // ---> UPDATED LOGOUT LOGIC <---
  const handleLogout = async () => {
    setIsOptionsVisible(false); // Close the modal first
    try {
      await logout(); // Calls the Firebase signout from your context
      // If your app doesn't automatically redirect on auth state change, force it to login screen:
      // router.replace('/login'); 
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  // Delete profile
  const handleDeleteProfile = () => {
    setIsOptionsVisible(false);
    Alert.alert(
      "Delete Profile",
      "Are you sure you want to delete your profile? This action cannot be undone.",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              if (onDeleteProfile) {
                await onDeleteProfile();
              }
            } catch (error) {
              console.error("Failed to delete profile:", error);
              Alert.alert("Error", "Failed to delete profile. Please try again.");
            }
          },
          style: "destructive",
        },
      ]
    );
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
            <Text className="text-xl font-manrope font-bold text-black uppercase">SESSIONS</Text>
            <ChevronRight size={22} color="#ADABAB" strokeWidth={1.5} />
          </Pressable>
          
          <Pressable 
            onPress={() => {
               router.push("/(screens)/(profile)/prograssChart" as any); 
            }}
            className="px-4 py-6 border-b border-neutral-100 flex-row justify-between items-center active:opacity-50"
          >
            <Text className="text-xl font-manrope font-bold text-black uppercase">PROGRESS CHART</Text>
            <ChevronRight size={22} color="#ADABAB" strokeWidth={1.5} />
          </Pressable>
        </View>
      </ScrollView>

      {/* Options Modal */}
      <Modal visible={isOptionsVisible} transparent animationType="fade">
        <TouchableOpacity className="flex-1 justify-center items-center bg-black/60 px-8" activeOpacity={1} onPress={() => setIsOptionsVisible(false)}>
          <View className="bg-white font-bebas w-full rounded-[40px] p-10 items-center shadow-2xl">
            <HexButton title="EDIT NAME" color="#F8FE11" icon={RotateCw} onPress={() => { setIsOptionsVisible(false); setIsEditVisible(true); }} />
            <HexButton title="LOGOUT" color="#000000" textColor="white" iconColor="white" icon={LogOut} onPress={handleLogout} />
            <HexButton title="DELETE PROFILE" color="#FF0000" icon={Trash2} onPress={handleDeleteProfile} />
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