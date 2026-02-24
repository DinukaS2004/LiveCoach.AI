import React, { useState } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, StatusBar, 
  Modal, TextInput, KeyboardAvoidingView, Platform 
} from 'react-native';
import { ChevronLeft, ChevronRight, ClipboardList, Plus, RotateCw, Trash2 } from 'lucide-react-native';
import AddNoteScreen from './add-note';
import { router } from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";

interface SessionsScreenProps {
    onBackPress?: () => void;
}

// --- REFINED HEXAGON BUTTON COMPONENT ---
const HexButton = ({ title, onPress, color, textColor = "black", icon: Icon }: any) => {
  const pointSize = 24; // Controls the sharpness of the point
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="my-2 w-full items-center">
      <View className="flex-row items-center justify-center">
        {/* Left Triangle Point */}
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
          <Text className={`font-bebas text-2xl font-black tracking-tighter text-black uppercase`}>
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
  
  const [selectedSession, setSelectedSession] = useState<{id: string, title: string} | null>(null);
  const [sessionInput, setSessionInput] = useState("");

  const [sessions, setSessions] = useState([
    { id: '1', title: 'SESSION 1' },
    { id: '2', title: 'SESSION 2' },
    { id: '3', title: 'SESSION 3' },
    { id: '4', title: 'SESSION 4' },
    { id: '5', title: 'SESSION 5' },
  ]);

    const handleBack = () => {
        if (onBackPress) return onBackPress();

        // Always go to profile tab (NOT history)
        router.replace("/(screens)/(profile)");
    };

  const handleLongPress = (session: {id: string, title: string}) => {
    setSelectedSession(session);
    setIsOptionsVisible(true);
  };

  const handleDelete = () => {
    if (selectedSession) {
      setSessions(sessions.filter(s => s.id !== selectedSession.id));
      setIsOptionsVisible(false);
    }
  };

  const handleCreateOrRename = () => {
    if (sessionInput.trim()) {
      if (isRenameVisible && selectedSession) {
        setSessions(sessions.map(s => s.id === selectedSession.id ? { ...s, title: sessionInput.toUpperCase() } : s));
      } else {
        const newEntry = { id: Math.random().toString(), title: sessionInput.toUpperCase() };
        setSessions([...sessions, newEntry]);
      }
      setSessionInput("");
      setIsAddModalVisible(false);
      setIsRenameVisible(false);
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

              {/* Header */}
              <View className="flex-row items-center px-4 py-5 border-b border-neutral-50 bg-primary">
                  <TouchableOpacity onPress={handleBack} className="p-1">
                      <ChevronLeft size={32} color="black" strokeWidth={2.5} />
                  </TouchableOpacity>
                  <Text className="font-bebas pt-2 text-4xl font-black tracking-tighter text-black uppercase">Sessions</Text>
              </View>

              <FlatList
                  data={sessions}
                  keyExtractor={(item) => item.id}
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
                              <Text className="font-abeezee text-lg font-bold tracking-widest text-black">{item.title}</Text>
                          </View>
                          <ChevronRight size={24} color="black" strokeWidth={1.5} />
                      </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => <View className="h-[1px] bg-gray-100 mx-4" />}
              />

              {/* Floating Plus Button */}
              <View className="absolute bottom-10 left-0 right-0 items-center">
                  <TouchableOpacity
                      className="bg-[#F0F0F0] w-16 h-16 rounded-full items-center justify-center shadow-lg"
                      onPress={() => {
                          setSessionInput("");
                          setIsRenameVisible(false);
                          setIsAddModalVisible(true);
                      }}
                  >
                      <Plus size={36} color="black" strokeWidth={3} />
                  </TouchableOpacity>
              </View>

              {/* --- OPTIONS MODAL --- */}
              <Modal visible={isOptionsVisible} transparent animationType="fade">
                  <TouchableOpacity
                      className="flex-1 justify-center items-center bg-black/60 px-8"
                      activeOpacity={1}
                      onPress={() => setIsOptionsVisible(false)}
                  >
                      <View className="bg-white w-full rounded-[40px] p-10 items-center shadow-2xl">
                          <HexButton
                              title="RENAME"
                              color="#EAFF00" // Neon Yellow
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
                              color="#FF3B3B" // BOLD RED ACTION
                              icon={Trash2}
                              onPress={handleDelete}
                          />
                      </View>
                  </TouchableOpacity>
              </Modal>

              {/* --- ADD/RENAME MODAL --- */}
              <Modal visible={isAddModalVisible} transparent animationType="slide">
                  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                      <TouchableOpacity
                          className="flex-1 justify-center items-center bg-black/50 px-6"
                          activeOpacity={1}
                          onPress={() => setIsAddModalVisible(false)}
                      >
                          <View className="bg-white w-full rounded-[35px] p-8 shadow-2xl items-center">
                              <Text className="font-abeezee text-2xl font-black mb-6 italic uppercase">NAME YOUR SESSION</Text>

                              <View className="border-2 border-[#EAFF00] rounded-2xl w-full px-4 py-4 mb-8">
                                  <TextInput
                                      placeholder="ADD NEW SESSION"
                                      value={sessionInput}
                                      onChangeText={setSessionInput}
                                      className="text-lg font-bold text-center uppercase"
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
                                      color="#9E9E9E" // Solid Gray
                                      onPress={() => setIsAddModalVisible(false)}
                                  />
                              </View>
                          </View>
                      </TouchableOpacity>
                  </KeyboardAvoidingView>
              </Modal>

              <Modal visible={isNoteVisible} animationType="slide" presentationStyle="fullScreen">
                  <AddNoteScreen
                      onClose={() => setIsNoteVisible(false)}
                      sessionTitle={selectedSession?.title || ""}
                  />
              </Modal>

      </SafeAreaView>

  );
};

export default SessionsScreen;