import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

type CoachCardProps = {
  name: string;
  location: string;
  image: any;
  price: number;
  billingCycle: 'Monthly' | 'Yearly' | 'Daily' | 'Weekly';
  onContactPress?: () => void;
};

const CoachCard = ({ name, location, price, billingCycle, image, onContactPress }: CoachCardProps) => {
  return (
    <View className="bg-white rounded-2xl mt-6 border border-neutral-500 overflow-hidden">
      <Image
        source={image}
        className="w-full h-32 bg-primary-light"
        resizeMode="cover"
      />

      <View className="p-3 flex-row items-start">
        <View className="flex-1 pr-2">
          <Text className="font-manrope text-base font-bold text-primary-dark">
            {name}
          </Text>

          <Text className="font-manrope text-sm text-neutral-700 mt-1">
            {location}
          </Text>

          <Text className="font-manrope text-sm text-neutral-800 mt-1">
            {price} LKR / {billingCycle}
          </Text>
        </View>

        <TouchableOpacity
          className="flex-row items-center self-start active:opacity-80"
          accessibilityRole="button"
          onPress={onContactPress}
        >
          <View className="w-0 h-0 border-t-[18px] border-t-transparent border-b-[18px] border-b-transparent border-r-[12px] border-r-accent-yellow" />
          <View className="h-[36px] justify-center items-center px-5 bg-accent-yellow">
            <Text className="font-manrope font-extrabold text-primary-dark uppercase tracking-tighter">
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