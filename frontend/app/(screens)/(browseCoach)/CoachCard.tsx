import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

type CoachCardProps = {
  name: string;
  location: string;
  image: any; 
  price: number; 
  billingCycle: 'Monthly' | 'Yearly'; 
  onContactPress?: () => void;   // ← add
};

const CoachCard = ({ name, location,price, billingCycle, image, onContactPress }: CoachCardProps) => {
  return (
    
    <View className="bg-primary rounded-lg mt-8">
      <Image source={image} className="w-full h-32 rounded-lg bg-gray-200" resizeMode="contain"/>
      <View className="mt-3 flex-row items-start">
        <View className="flex-1">
          <Text className="font-manrope text-base font-bold text-black">
            {name}
          </Text>
          <Text className="font-manrope text-sm text-gray-500 mt-1">
            {location}
          </Text>
          <Text className="font-manrope text-sm text-gray-700 mt-1">
            ${price} / {billingCycle === 'Monthly' ? 'month' : 'year'}
          </Text>
        </View>

        <TouchableOpacity className="flex-row items-center self-start active:opacity-80" accessibilityRole="button" onPress={onContactPress}>
          <View className="w-0 h-0 border-t-[18px] border-t-transparent border-b-[18px] border-b-transparent border-r-[12px] border-r-accent-yellow" />
          <View className="h-[36px] justify-center items-center px-5 bg-accent-yellow">
            <Text className="font-manrope font-semibold text-primary-dark">
              Contact
            </Text>
          </View>
          <View className="w-0 h-0 border-t-[18px] border-t-transparent border-b-[18px] border-b-transparent border-l-[12px] border-l-accent-yellow" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CoachCard;