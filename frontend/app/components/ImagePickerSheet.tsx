import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  Dimensions,
  Alert,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import ButtonGray from "./buttonGray";

const { height } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (imageUri: string) => void;
  onRemoveImage?: () => void;
  canRemoveImage?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

export default function ImagePickerSheet({
  visible,
  onClose,
  onImageSelected,
  onRemoveImage,
  canRemoveImage = false,
  onVisibilityChange,
}: Props) {
  const translateY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    onVisibilityChange?.(visible);
    Animated.timing(translateY, {
      toValue: visible ? 0 : height,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const handleCamera = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Camera permission is required to take photos.",
        );
        onClose();
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
        onClose();
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
      onClose();
    }
  };

  const handleGallery = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Gallery permission is required to select photos.",
        );
        onClose();
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
        onClose();
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Error selecting photo:", error);
      Alert.alert("Error", "Failed to select photo. Please try again.");
      onClose();
    }
  };

  const handleRemove = () => {
    if (!onRemoveImage) return;

    Alert.alert(
      "Remove Profile Picture",
      "Are you sure you want to remove your current profile picture?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            onRemoveImage();
            onClose();
          },
        },
      ],
    );
  };

  if (!visible) return null;

  return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >

      <View className="flex-1 justify-end">
        <Pressable
          onPress={onClose}
          className="absolute inset-0 bg-black/60"
        />

      <Animated.View
        style={{
          transform: [{ translateY }],
        }}
        className="absolute bottom-0 w-full bg-white rounded-t-[28px] shadow-2xl"
      >
        <View className="pt-4 pb-2 ">
          <View className="w-12 h-1.5 bg-gray-300 self-center rounded-full" />
        </View>

        <View className="px-6 pt-4 pb-6">
          <Text className="text-center text-xl font-bold text-gray-900">
            Change Profile Picture
          </Text>
          <Text className="text-center text-sm text-gray-500 mt-1">
            Choose how you want to update your photo
          </Text>
        </View>

        <View className="px-4 pb-6">
          <Pressable
            onPress={handleCamera}
            className="flex-row items-center bg-gray-50 rounded-2xl p-4 mb-3 active:bg-gray-100 active:scale-[0.98]"
          >
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
              <MaterialIcons name="photo-camera" size={24} color="#3B82F6" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-base font-semibold text-gray-900">
                Take Photo
              </Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                Use your camera to capture
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
          </Pressable>

          <Pressable
            onPress={handleGallery}
            className="flex-row items-center bg-gray-50 rounded-2xl p-4 mb-3 active:bg-gray-100 active:scale-[0.98]"
          >
            <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center">
              <MaterialIcons name="photo-library" size={24} color="#8B5CF6" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-base font-semibold text-gray-900">
                Choose from Gallery
              </Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                Select from your photos
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
          </Pressable>

          {canRemoveImage && onRemoveImage && (
            <Pressable
              onPress={handleRemove}
              className="flex-row items-center bg-gray-50 rounded-2xl p-4 mb-3 active:bg-red-100 active:scale-[0.98]"
            >
              <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center">
                <MaterialIcons name="delete-outline" size={24} color="#EF4444" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-base font-semibold text-red-600">
                  Remove Photo
                </Text>
                <Text className="text-sm text-red-400 mt-0.5">
                  Revert to the default profile image
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#FCA5A5" />
            </Pressable>
          )}

          <ButtonGray title="Cancel" onPress={onClose} />
        </View>

        <View className="h-24" />
      </Animated.View>
      </View>
      </Modal>
  );
}
