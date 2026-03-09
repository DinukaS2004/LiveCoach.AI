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
          <View className="bg-white rounded-t-3xl p-6 border-t border-neutral-200 shadow-2xl">
            {/* <Image source={coach.image} className="w-24 h-24 rounded-full mx-auto mb-3 bg-primary-light" /> */}
            
            {/* Profile Image with Yellow Border */}
            <View className="mx-auto mb-4 relative">
              <View className="p-1 rounded-full border-4 border-[#EDF856]">
                <Image 
                  source={coach.image} 
                  className="w-28 h-28 rounded-full bg-neutral-100" 
                />
              </View>
            </View>
            <Text className="font-manrope text-2xl font-bold text-center text-primary-dark mb-1">
              {coach.name}
            </Text>

            <Text className="font-manrope text-center text-neutral-700 mb-5">
              {coach.location}
            </Text>

            {/* Phone */}
            <View className="space-y-3">
              <TouchableOpacity activeOpacity={0.7} className="flex-row items-center p-4 bg-green-50 rounded-2xl border border-green-100 mb-3 ">
                <View className="w-12 h-12 bg-white rounded-full justify-center items-center mr-4 border border-green-100">
                  <Ionicons name="call" size={22} color="#22a351" />
                </View>
                <View className="flex-1">
                  <Text className="font-manrope font-bold text-primary-dark">Phone</Text>
                  <Text className="font-manrope text-neutral-700">
                    {coach.phone ?? 'No phone added'}
                  </Text>
                </View>
                <MaterialIcons name="arrow-forward-ios" size={24} color="#22a351" />
                
              </TouchableOpacity>

              {/* Email */}
              <TouchableOpacity activeOpacity={0.7} className="flex-row items-center p-4 bg-rose-50 rounded-2xl border border-rose-100">
                <View className="w-12 h-12 bg-white rounded-full justify-center items-center mr-4 border border-rose-100">
                  <MaterialIcons name="email" size={22} color="#be123c" />
                </View>
                <View className="flex-1">
                  <Text className="font-manrope font-bold text-primary-dark">Email</Text>
                  <Text className="font-manrope text-neutral-700">
                    {coach.email ?? 'No email added'}
                  </Text>
                </View>
                
                <MaterialIcons name="arrow-forward-ios" size={24} color="#be123c" />
                
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