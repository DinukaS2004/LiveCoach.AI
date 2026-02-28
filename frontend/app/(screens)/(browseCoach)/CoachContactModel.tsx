import React from 'react';
import { View, Text, Modal, Image, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

type Coach = {
  name: string;
  location: string;
  phone?: string;
  email?: string;
  image: any;
};

type Props = {
  visible: boolean;
  coach: Coach | null;
  onClose: () => void;
};

const CoachContactModal = ({ visible, coach, onClose }: Props) => {
  if (!coach) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
      <Pressable onPress={() => {}}>
        <View className="bg-white rounded-t-3xl p-6">
          <Image
            source={coach.image}
            className="w-24 h-24 rounded-full mx-auto mb-2"
          />

          <Text className="text-2xl font-bold text-center text-black mb-1">
            {coach.name}
          </Text>

          <Text className="text-center text-gray-500 mb-4">
            {coach.location}
          </Text>

          <View className="space-y-4">
            <TouchableOpacity className="flex-row items-center p-4 bg-gray-50 rounded-2xl mb-2">
              <View className="w-12 h-12 bg-blue-100 rounded-full justify-center items-center mr-4">
                <Ionicons name="call-outline" size={22} color="#1f2937" />
              </View>
              <View>
                <Text className="font-semibold text-black">Phone</Text>
                <Text className="text-gray-600">
                  {coach.phone ?? 'No phone added'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-4 bg-gray-50 rounded-2xl">
              <View className="w-12 h-12 bg-purple-100 rounded-full justify-center items-center mr-4">
                <MaterialIcons name="email" size={22} color="#1f2937" />
              </View>
              <View>
                <Text className="font-semibold text-black">Email</Text>
                <Text className="text-gray-600">
                  {coach.email ?? 'No email added'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity className="mt-6 bg-accent-yellow py-4 rounded-2xl" onPress={onClose}>
            <Text className="text-center font-bold text-black text-lg">
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Pressable>
    </Modal>
  );
};

export default CoachContactModal;