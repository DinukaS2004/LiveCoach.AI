import React, { useEffect, useState } from "react";
import {Alert,View,Text,ScrollView,Image,Pressable,Modal,TouchableOpacity,TextInput,KeyboardAvoidingView,Platform,
} from "react-native";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import { SlidersHorizontal, RotateCw, Trash2 } from "lucide-react-native";
import ImagePickerSheet from "../../components/ImagePickerSheet";

export interface Player {
  id: string;
  name: string;
}

export interface CoachData {
  name: string;
  role: "Coach";
  isVerified?: boolean;
  players?: Player[];
  currentAthletes?: Player[];
}

const getCoachPlayers = (data: CoachData): Player[] => {
  const merged = [...(data.currentAthletes ?? []), ...(data.players ?? [])];
  const uniqueByName = new Map<string, Player>();

  merged.forEach((player, index) => {
    const normalizedName = (player?.name || "").trim().toUpperCase();
    if (!normalizedName || uniqueByName.has(normalizedName)) {
      return;
    }

    uniqueByName.set(normalizedName, {
      id: player?.id || `player-${index}`,
      name: normalizedName,
    });
  });

  return Array.from(uniqueByName.values());
};

interface ProfileCoachProps {
  data: CoachData;
  onPressPlayer: () => void;
  onUpdateName: (name: string) => Promise<void>; //Update name
  onUpdatePlayers: (players: Player[]) => Promise<void>; //Update players list
  isSavingName?: boolean;
}
//Hexbutton
const HexButton = ({ title, onPress, color, icon: Icon }: any) => {
  const pointSize = 24;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="my-2 w-full items-center"
    >
      <View className="flex-row items-center justify-center">
        <View
          style={{
            width: 0,
            height: 0,
            borderTopWidth: pointSize,
            borderTopColor: "transparent",
            borderBottomWidth: pointSize,
            borderBottomColor: "transparent",
            borderRightWidth: pointSize,
            borderRightColor: color,
          }}
        />
        <View
          style={{ backgroundColor: color, height: pointSize * 2 }}
          className="flex-row items-center justify-center px-4 min-w-[200px]"
        >
          <Text className="font-bebas text-2xl font-black text-black uppercase">
            {title}
          </Text>
          {Icon && (
            <View className="ml-3">
              <Icon size={20} color="black" strokeWidth={2.5} />
            </View>
          )}
        </View>
        <View
          style={{
            width: 0,
            height: 0,
            borderTopWidth: pointSize,
            borderTopColor: "transparent",
            borderBottomWidth: pointSize,
            borderBottomColor: "transparent",
            borderLeftWidth: pointSize,
            borderLeftColor: color,
          }}
        />
      </View>
    </TouchableOpacity>
  );
};


const ProfileCoach = ({
  data,
  onPressPlayer,
  onUpdateName,
  onUpdatePlayers,
  isSavingName = false,
}: ProfileCoachProps) => {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [isAddPlayerVisible, setIsAddPlayerVisible] = useState(false);
  const [playerNameInput, setPlayerNameInput] = useState("");
  const [isSavingPlayers, setIsSavingPlayers] = useState(false);
  const [players, setPlayers] = useState<Player[]>(getCoachPlayers(data));
  const [nameInput, setNameInput] = useState(data.name);

  //Keep the name updated 
  useEffect(() => {
    setNameInput(data.name);
  }, [data.name]);

  // Keep the player list sync with the backend through parent
  useEffect(() => {
    setPlayers(getCoachPlayers(data));
  }, [data.players, data.currentAthletes]);

  const handleImageSelected = (imageUri: string) => {
    setSelectedImage(imageUri);
  };

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || isSavingName) return;
    await onUpdateName(trimmed);
    setIsEditVisible(false);
  };

  //Add and check players
  const handleAddPlayer = async () => {
    const trimmed = playerNameInput.trim().toUpperCase();
    if (!trimmed || isSavingPlayers) return;

    if (players.some((player) => player.name === trimmed)) {
      Alert.alert("Duplicate player", "That player already exists.");
      return;
    }

    const newPlayer: Player = {
      id: `local-${Date.now()}`,
      name: trimmed,
    };
    const previousPlayers = players;
    const nextPlayers = [...players, newPlayer];

    //Update the UI immediately and then go through backend
    setPlayers(nextPlayers);
    setIsSavingPlayers(true);

    try {
      await onUpdatePlayers(nextPlayers);
      setPlayerNameInput("");
      setIsAddPlayerVisible(false);
    } catch (error: any) {
      setPlayers(previousPlayers);
      Alert.alert(
        "Failed to add player",
        error?.response?.data?.message || "Please try again.",
      );
    } finally {
      setIsSavingPlayers(false);
    }
  };

  return (
    <>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-primary"
      >
        <View className="h-[400px] w-full relative">
          <Image
            source={
              selectedImage 
                ? { uri: selectedImage }
                : require("../../../assets/BrowseCoachImages/cricketCoach3.jpg")
            }
            className="w-full h-full"
            resizeMode="cover"
          />
          
          <Pressable
            onPress={() => setSheetVisible(true)}
            className="absolute bottom-7 right-3 bg-white p-2 rounded-full shadow-md active:scale-95"
            style={{
              elevation: 10,
              zIndex: 10,
            }}
            // pointerEvents="box-only"
          >
            <MaterialIcons 
              name="photo-camera" 
              size={20} 
              color="black"
              pointerEvents="none"
            />
          </Pressable>

          <TouchableOpacity
            onPress={() => {
              setNameInput(data.name);
              setIsOptionsVisible(true);
            }}
            className="absolute top-12 right-5 bg-black/20 p-2.5 rounded-full"
          >
            <SlidersHorizontal size={24} color="white" strokeWidth={2} />
          </TouchableOpacity>

          <View className="absolute bottom-0 left-0 right-0  p-6">
            <Text className="text-white text-xs font-bold uppercase tracking-widest opacity-80">
              {data.role}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-white text-5xl font-bebas uppercase tracking-tighter">
                {data.name}
              </Text>
              {data.isVerified && (
                <MaterialIcons
                  name="verified"
                  size={24}
                  color="white"
                  style={{ marginLeft: 8 }}
                />
              )}
            </View>
          </View>
        </View>

        <View className="px-4 py-4 bg-neutral-100 border-b border-neutral-100 flex-row items-center justify-between">
          <Text className="font-bebas px-3 text-3xl text-black">PLAYERS</Text>
          <TouchableOpacity
            onPress={() => setIsAddPlayerVisible(true)}
            className="bg-black px-4 py-2 rounded-full active:opacity-80"
          >
            <Text className="text-white text-sm font-manrope font-bold uppercase">+ Add Player</Text>
          </TouchableOpacity>
        </View>
        <View className="px-4">
          {players.map((player) => (
            <Pressable
              key={player.id}
              onPress={onPressPlayer}
              className="px-4 py-5 border-b border-neutral-100 flex-row justify-between items-center active:opacity-50"
            >
              <View className="flex-1">
                <Text className="text-xl font-manrope text-black uppercase">
                  {player.name}
                </Text>
              </View>
              <Entypo name="chevron-right" size={20} color="#ADABAB" />
            </Pressable>
          ))}
          {players.length === 0 && (
            <View className="px-4 py-40 items-center">
              <Text className="text-neutral-500 font-manrope uppercase font-extrabold">No players yet......</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {sheetVisible && (
        <ImagePickerSheet
          visible={sheetVisible}
          onClose={() => setSheetVisible(false)}
          onImageSelected={handleImageSelected}
        />
      )}

      <Modal visible={isOptionsVisible} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 justify-center items-center bg-black/60 px-8"
          activeOpacity={1}
          onPress={() => setIsOptionsVisible(false)}
        >
          <View className="bg-white w-full rounded-[40px] p-10 items-center shadow-2xl">
            <HexButton
              title="EDIT NAME"
              color="#F8FE11"
              icon={RotateCw}
              onPress={() => {
                setIsOptionsVisible(false);
                setIsEditVisible(true);
              }}
            />
            <HexButton
              title="DELETE PROFILE"
              color="#FF3B3B"
              icon={Trash2}
              onPress={() => setIsOptionsVisible(false)}
            />
          </View>
        </TouchableOpacity>
      </Modal>

            {/* Edit Name Modal */}
      <Modal visible={isEditVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <TouchableOpacity
            className="flex-1 justify-center items-center bg-black/50 px-6"
            activeOpacity={1}
            onPress={() => setIsEditVisible(false)}
          >
            <View className="w-full rounded-[35px] p-8 shadow-2xl items-center bg-white">
              <Text className="font-bebas text-2xl font-black mb-6 italic uppercase">
                EDIT COACH NAME
              </Text>
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                className="border border-[#F8FE11] rounded-2xl w-full p-4 text-center uppercase text-lg font-bold"
                autoFocus
              />
              <View className="w-full mt-6">
                <HexButton
                  title={isSavingName ? "SAVING..." : "SAVE"}
                  color="#F8FE11"
                  onPress={handleSaveName}
                />
                <HexButton
                  title="CANCEL"
                  color="#9E9E9E"
                  onPress={() => setIsEditVisible(false)}
                />
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={isAddPlayerVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <TouchableOpacity
            className="flex-1 justify-center items-center bg-black/50 px-6"
            activeOpacity={1}
            onPress={() => setIsAddPlayerVisible(false)}
          >
            <View className="w-full rounded-[35px] p-8 shadow-2xl items-center bg-white">
              <Text className="font-bebas text-2xl font-black mb-6 italic uppercase">
                ADD PLAYER
              </Text>
              <TextInput
                value={playerNameInput}
                onChangeText={setPlayerNameInput}
                placeholder="PLAYER NAME"
                placeholderTextColor="#ADABAB"
                className="border border-[#F8FE11] rounded-2xl w-full p-8 text-center  text-lg font-bold"
                autoFocus
              />
              <View className="w-full mt-6">
                <HexButton
                  title={isSavingPlayers ? "SAVING..." : "ADD"}
                  color="#F8FE11"
                  onPress={handleAddPlayer}
                />
                <HexButton
                  title="CANCEL"
                  color="#FF3B3B"
                  onPress={() => setIsAddPlayerVisible(false)}
                />
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

export default ProfileCoach;