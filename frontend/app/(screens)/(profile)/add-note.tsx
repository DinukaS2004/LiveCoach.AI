import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView,
  KeyboardAvoidingView, Platform, ScrollView,StyleSheet, Alert, ActivityIndicator,
} from "react-native";
import {
  ChevronLeft,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react-native";
import axios from "axios";
import { auth } from "../../../lib/firebase";
import { authHeaders } from "@/lib/api";

interface AddNoteProps {
  onClose: () => void;
  sessionTitle: string;
  noteId: string;
}

const BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

async function authConfig() {
  const idToken = await auth.currentUser?.getIdToken();

  if (!idToken) {
    throw new Error("Unable to authorize request.");
  }

  return { headers: await authHeaders(idToken) };
}

async function loadNoteById(noteId: string) {
  const config = await authConfig();
  const res = await axios.get(`${BASE}api/session-notes/${noteId}`, config);
  return res.data?.data || null;
}

async function updateNote(noteId: string, title: string, content: string) {
  const config = await authConfig();
  return axios.put(
    `${BASE}api/session-notes/${noteId}`,
    { title, content },
    config,
  );
}

const AddNoteScreen: React.FC<AddNoteProps> = ({
  onClose,
  sessionTitle,
  noteId,
}) => {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        if (!noteId) {
          setNote("");
          return;
        }

        const existing = await loadNoteById(noteId);
        setNote(existing?.content || "");
      } catch (e: any) {
        Alert.alert("Error", e.message || "Failed to load");
      } finally {
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    })();
  }, [noteId]);

  const handleDone = async () => {
    try {
      setSaving(true);

      if (!note.trim()) {
        onClose();
        return;
      }

      if (!noteId) {
        Alert.alert("Error", "Missing noteId");
        return;
      }

      await updateNote(noteId, sessionTitle, note);

      Alert.alert("Saved", "Notes saved successfully.", [
        { text: "OK", onPress: onClose },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* HEADER SECTION */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 bg-white z-20">
          <TouchableOpacity onPress={onClose} className="flex-row items-center" disabled={saving}>
            <ChevronLeft size={28} color="#000000" strokeWidth={2.5} />
            <Text className="font-bebas text-[#000000] text-2xl font-semibold ml-[-2px]">Notes</Text>
          </TouchableOpacity>

          {/* Spacing kept at mr-6 as you liked */}
          <View className="flex-row items-center">
            <TouchableOpacity activeOpacity={0.6} className="mr-6" disabled={saving}>
              <ExternalLink size={24} color="#000000" strokeWidth={2} />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.6} className="mr-6" disabled={saving}>
              <SlidersHorizontal size={22} color="#000000" strokeWidth={2} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDone} activeOpacity={0.6} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <Text className="font-bebas text-[#000000] text-2xl">Done</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* CONTENT AREA WITH WATERMARK */}
        <View className="flex-1 relative">
          <View className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center pointer-events-none z-0">
            <Text
              style={styles.watermarkText}
              className="font-bebas text-4xl font-black text-black tracking-[4px]"
            >
              LiveCoach.AI
            </Text>
          </View>

          <ScrollView className="flex-1 px-6 pt-5" keyboardShouldPersistTaps="handled">
            <Text className="text-gray-400 text-xs mb-3 uppercase tracking-[1.5px] font-black italic">
              {sessionTitle}
            </Text>
            <TextInput
              ref={inputRef}
              multiline
              placeholder="Start typing..."
              placeholderTextColor="#D1D5DB"
              className="text-[18px] text-black leading-7 font-medium"
              style={{ minHeight: 300 }}
              value={note}
              onChangeText={setNote}
              textAlignVertical="top"
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  watermarkText: {
    opacity: 0.06,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default AddNoteScreen;
