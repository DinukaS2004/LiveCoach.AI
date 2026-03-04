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
          <View className="bg-white rounded-t-3xl p-6 border border-neutral-500">
            <Image source={coach.image} className="w-24 h-24 rounded-full mx-auto mb-3 bg-primary-light" />

            <Text className="font-manrope text-2xl font-bold text-center text-primary-dark mb-1">
              {coach.name}
            </Text>

            <Text className="font-manrope text-center text-neutral-700 mb-5">
              {coach.location}
            </Text>

            {/* Phone */}
            <View className="space-y-3">
              <TouchableOpacity className="flex-row items-center p-4 bg-primary-light rounded-2xl border border-neutral-500 mb-3">
                <View className="w-12 h-12 bg-white rounded-full justify-center items-center mr-4 border border-neutral-500">
                  <Ionicons name="call-outline" size={22} color="#150000" />
                </View>
                <View>
                  <Text className="font-manrope font-bold text-primary-dark">Phone</Text>
                  <Text className="font-manrope text-neutral-700">
                    {coach.phone ?? 'No phone added'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Email */}
              <TouchableOpacity className="flex-row items-center p-4 bg-primary-light rounded-2xl border border-neutral-500">
                <View className="w-12 h-12 bg-white rounded-full justify-center items-center mr-4 border border-neutral-500">
                  <MaterialIcons name="email" size={22} color="#150000" />
                </View>
                <View>
                  <Text className="font-manrope font-bold text-primary-dark">Email</Text>
                  <Text className="font-manrope text-neutral-700">
                    {coach.email ?? 'No email added'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity className="mt-6 bg-accent-yellow py-4 rounded-2xl active:opacity-80" onPress={onClose}>
              <Text className="font-manrope text-center font-extrabold text-primary-dark text-lg uppercase tracking-tighter">
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