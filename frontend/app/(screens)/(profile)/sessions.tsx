import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StatusBar,
  Modal, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from "react-native";
import { ChevronLeft, ChevronRight, ClipboardList, Plus, RotateCw, Trash2 } from "lucide-react-native";
import AddNoteScreen from "./add-note";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { auth } from "../../../lib/firebase";
import { authHeaders } from "@/lib/api";

interface SessionsScreenProps {
  onBackPress?: () => void;
}

type SessionNoteItem = {
  _id: string;
  title: string;
  content: string;
  sessionDate?: string;
};

const BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

async function authConfig() {
  const idToken = await auth.currentUser?.getIdToken();

  if (!idToken) {
    throw new Error("Unable to authorize request.");
  }

  return { headers: await authHeaders(idToken) };
}

// --- REFINED HEXAGON BUTTON COMPONENT ---
const HexButton = ({ title, onPress, color, textColor = "black", icon: Icon }: any) => {
  const pointSize = 24; // Controls the sharpness of the point
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="my-2 w-full items-center">
      <View className="flex-row items-center justify-center">
        <View
          style={{
            width: 0, height: 0,
            borderTopWidth: pointSize, borderTopColor: 'transparent',
            borderBottomWidth: pointSize, borderBottomColor: 'transparent',
            borderRightWidth: pointSize, borderRightColor: color,
          }}
        />

        {/* Middle Body */}
        <View
          style={{ backgroundColor: color, height: pointSize * 2 }}
          className="flex-row items-center justify-center px-4 min-w-[200px]"
        >
            <Text className={`font-bebas text-2xl tracking-tighter text-black uppercase`}>
            {title}
          </Text>
          {Icon && <View className="ml-3"><Icon size={22} color="black" strokeWidth={3} /></View>}
        </View>

        {/* Right Triangle Point */}
        <View
          style={{
            width: 0, height: 0,
            borderTopWidth: pointSize, borderTopColor: 'transparent',
            borderBottomWidth: pointSize, borderBottomColor: 'transparent',
            borderLeftWidth: pointSize, borderLeftColor: color,
          }}
        />
      </View>
    </TouchableOpacity>
  );
};

const SessionsScreen: React.FC<SessionsScreenProps> = ({ onBackPress }) => {
  const [isNoteVisible, setIsNoteVisible] = useState(false);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [isRenameVisible, setIsRenameVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const [selectedSession, setSelectedSession] = useState<SessionNoteItem | null>(null);
  const [sessionInput, setSessionInput] = useState("");

  const [sessions, setSessions] = useState<SessionNoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const handleBack = () => {
    if (onBackPress) return onBackPress();

    // Always go to profile tab (NOT history)
    router.replace("/(screens)/(profile)");
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const config = await authConfig();
      const res = await axios.get(`${BASE}/api/session-notes/myNotes`, config);
      setSessions(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleLongPress = (session: SessionNoteItem) => {
    setSelectedSession(session);
    setIsOptionsVisible(true);
  };

  const handleDelete = async () => {
    if (!selectedSession) return;

    try {
      const config = await authConfig();
      await axios.delete(`${BASE}/api/session-notes/${selectedSession._id}`, config);
      setIsOptionsVisible(false);
      setSelectedSession(null);
      fetchSessions();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to delete");
    }
  };

  const handleCreateOrRename = async () => {
    const title = sessionInput.trim().toUpperCase();
    if (!title) return;

    try {
      const config = await authConfig();

      if (isRenameVisible && selectedSession) {
        await axios.put(
          `${BASE}/api/session-notes/${selectedSession._id}`,
          { title },
          config
        );
      } else {
        const res = await axios.post(
          `${BASE}/api/session-notes`,
          { title, content: " ",sessionDate: new Date().toISOString(), },
          config
        );

        const created = res.data?.data;
        if (created?._id) {
          setSelectedSession(created);
          setIsNoteVisible(true);
        }
      }

      setSessionInput("");
      setIsAddModalVisible(false);
      setIsRenameVisible(false);
      fetchSessions();
    } catch (e: any) {
  console.log("CREATE/RENAME ERR status:", e?.response?.status);
  console.log("CREATE/RENAME ERR data:", e?.response?.data);
  Alert.alert("Error", e?.response?.data?.message || e.message || "Failed");
}
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <StatusBar barStyle="dark-content" />

      {/* BACKGROUND BRANDING WATERMARK */}
      <View className="absolute top-1/2 left-0 right-0 items-center opacity-5 pointer-events-none">
        <Text className="font-bebas text-6xl font-black rotate-[-15deg] text-gray-400">
          LiveCoach.AI
        </Text>
      </View>

      <View className="flex-row items-center px-4 py-5 border-b border-neutral-50 bg-primary">
        <TouchableOpacity onPress={handleBack} className="p-1">
          <ChevronLeft size={32} color="black" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text className="font-bebas pt-2 text-4xl tracking-tighter text-black uppercase">
          Sessions
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-3 text-black font-semibold">Loading sessions...</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center justify-between px-6 py-7 bg-primary"
              onPress={() => {
                setSelectedSession(item);
                setIsNoteVisible(true);
              }}
              onLongPress={() => handleLongPress(item)}
              delayLongPress={500}
            >
              <View className="flex-row items-center">
                <ClipboardList size={40} color="black" strokeWidth={1.2} className="mr-5" />
                <Text className="font-abeezee text-lg font-bold tracking-widest text-black">
                  {item.title || "UNTITLED"}
                </Text>
              </View>
              <ChevronRight size={24} color="black" strokeWidth={1.5} />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View className="h-[1px] bg-gray-100 mx-4" />}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center mt-16 px-8">
              <Text className="text-black font-bold text-lg">No sessions yet</Text>
              <Text className="text-gray-600 text-center mt-2">
                Tap the + button to create your first session.
              </Text>
            </View>
          )}
        />
      )}

      {/* Floating Plus Button */}
      <View className="absolute bottom-10 left-0 right-0 items-center">
        <TouchableOpacity
          className="bg-[#F0F0F0] w-16 h-16 rounded-full items-center justify-center shadow-lg"
          onPress={() => {
            setSessionInput("");
            setIsRenameVisible(false);
            setSelectedSession(null);
            setIsAddModalVisible(true);
          }}
        >
          <Plus size={36} color="black" strokeWidth={3} />
        </TouchableOpacity>
      </View>

      {/* OPTIONS MODAL */}
      <Modal visible={isOptionsVisible} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 justify-center items-center bg-black/60 px-8"
          activeOpacity={1}
          onPress={() => setIsOptionsVisible(false)}
        >
          <View className="bg-white w-full rounded-[40px] p-10 items-center shadow-2xl">
            <HexButton
              title="RENAME"
              color="#EAFF00"
              icon={RotateCw}
              onPress={() => {
                setIsOptionsVisible(false);
                setIsRenameVisible(true);
                setSessionInput(selectedSession?.title || "");
                setIsAddModalVisible(true);
              }}
            />
            <HexButton
              title="DELETE SESSION"
              color="#FF3B3B"
              icon={Trash2}
              onPress={handleDelete}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ADD/RENAME MODAL */}
      <Modal visible={isAddModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
          <TouchableOpacity
            className="flex-1 justify-center items-center bg-black/50 px-6"
            activeOpacity={1}
            onPress={() => setIsAddModalVisible(false)}
          >
            <View className="bg-white w-full rounded-[35px] p-8 shadow-2xl items-center">
              <Text className="font-abeezee text-2xl mb-6 italic uppercase">
                NAME YOUR SESSION
              </Text>

              <View className="border-2 border-[#EAFF00] rounded-2xl w-full px-4 py-4 mb-8">
                <TextInput
                  placeholder="ADD NEW SESSION"
                  value={sessionInput}
                  onChangeText={setSessionInput}
                  className="text-lg text-center uppercase"
                  autoFocus
                />
              </View>

              <View className="w-full">
                <HexButton
                  title={isRenameVisible ? "SAVE" : "CREATE"}
                  color="#EAFF00"
                  onPress={handleCreateOrRename}
                />
                <HexButton
                  title="CANCEL"
                  color="#9E9E9E"
                  onPress={() => setIsAddModalVisible(false)}
                />
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* NOTE SCREEN */}
      <Modal visible={isNoteVisible} animationType="slide" presentationStyle="fullScreen">
        <AddNoteScreen
          onClose={() => {
            setIsNoteVisible(false);
            fetchSessions(); // refresh after editing
          }}
          sessionTitle={selectedSession?.title || ""}
          noteId={selectedSession?._id || ""}
        />
      </Modal>
    </SafeAreaView>
  );
};

export default SessionsScreen;