import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';

type Props = {
  onPress: () => void;
};

const MyGigButton = ({ onPress }: Props) => {
  return (
    <View className="bg-white border-2 border-green-500 rounded-2xl p-5 mt-6 items-center shadow-sm">
      <View className="flex-row items-center mb-4">
        <View className="bg-green-500 rounded-full w-5 h-5 items-center justify-center mr-2">
          <Entypo name="check" size={12} color="white" />
        </View>
        <Text className="font-manrope text-green-600 font-bold text-base">You already created a gig</Text>
      </View>
      <TouchableOpacity 
        activeOpacity={0.7}
        className="bg-green-500 w-full py-4 rounded-xl items-center"
        onPress={onPress} // Opens the modal
      >
        <Text className="font-manrope text-white font-bold text-lg">Go to My Gig</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MyGigButton;