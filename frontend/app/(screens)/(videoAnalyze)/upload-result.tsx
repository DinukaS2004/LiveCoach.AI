import React from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  visible: boolean;
  onAnalyze: () => void;
  onClose: () => void;
};

const UploadResultModal = ({ visible, onAnalyze, onClose }: Props) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Dark background */}
      <Pressable
        className="flex-1 bg-black/50 justify-end"
        onPress={onClose}
      >
        {/* Prevent close when clicking card */}
        <Pressable onPress={() => {}}>
          <View className="bg-white rounded-t-3xl p-6 items-center">
            
            {/* Check Icon */}
            <View className="w-16 h-16 bg-accent-yellow rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark" size={32} color="black" />
            </View>

            <Text className="font-manrope text-2xl font-bold text-primary-dark mb-6">
              UPLOAD COMPLETED
            </Text>

            {/* Analyze Button */}
            <TouchableOpacity
              className="w-full bg-accent-yellow py-4 rounded-2xl"
              onPress={onAnalyze}
            >
              <Text className="font-manrope text-center font-bold text-primary-dark text-lg">
                ANALYZE
              </Text>
            </TouchableOpacity>

          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default UploadResultModal;
