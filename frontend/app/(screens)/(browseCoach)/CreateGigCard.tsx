import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

// We define a Type for the props to tell TypeScript we expect an onPress function
type CreateGigCardProps = {
  onPress: () => void;
};

const CreateGigCard = ({ onPress }: CreateGigCardProps) => {
  // We use state to track if the user is currently pressing the card
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPressIn={() => setIsPressed(true)}   // Changes color when touched
      onPressOut={() => setIsPressed(false)} // Changes color back when released
      
      // The logic for opening the modal is passed here
      onPress={onPress} 

      // We use a ternary operator to toggle the border color class
      className={`bg-white border-2 border-dashed rounded-2xl p-4 flex flex-row items-center justify-center mt-6 h-30 w-full ${
        isPressed ? 'border-yellow-400' : 'border-neutral-500'
      }`}
    >
      <View className="w-12 h-12 bg-gray-50 rounded-full items-center justify-center border border-gray-100">
        <View className="items-center justify-center">
          <FontAwesome5 name="plus" size={24} color="#facc15" /> 
        </View>
      </View>
      
      <View className="ml-4">
        <Text className={`font-manrope font-bold text-lg ${
          isPressed ? 'text-yellow-600' : 'text-neutral-900'
        }`}>
          Create Your Own Gig
        </Text>
        <Text className="font-manrope text-neutral-700 text-sm">
          Post your coaching services here
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default CreateGigCard;