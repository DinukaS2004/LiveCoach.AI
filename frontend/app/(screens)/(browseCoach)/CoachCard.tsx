import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons'; 

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
    <View className="bg-white rounded-3xl mb-5 flex-row p-3 shadow-xl shadow-black/2">
      {/* Left: Rounded Square Image */}
      <Image
        source={image}
        className="w-24 h-24 rounded-2xl bg-neutral-100 mt-2"
        resizeMode="cover"
      />

      {/* Right: Info and Button Container */}
      <View className="flex-1 ml-5 justify-between mt-2">
        <View>
          <Text className="font-manrope text-xl font-bold text-black leading-tight">{name}</Text>
          {/* Darker Gray for visibility */}
          <Text className="font-manrope text-sm text-neutral-700 mt-1">{location}</Text>
          <View className="flex-row items-baseline mt-2">
            <Text className="font-manrope text-lg font-extrabold text-black">{price} LKR</Text>
            <Text className="font-manrope text-xs font-semibold text-neutral-800 ml-1"> / {billingCycle}</Text>
          </View>
        </View>

        {/* Larger Rounded Contact Button at the bottom right */}
        <TouchableOpacity 
          onPress={onContactPress}
          activeOpacity={0.8}
          className="bg-[#F8FE11] self-end mr-3  flex-row items-center justify-center gap-2 px-6 py-3 rounded-xl shadow-lg shadow-[#EDF856]/40"
        >

            <Feather name="phone" size={16} color="black" />
            <Text 
              className="text-black text-base" 
              style={{ fontWeight: '700', letterSpacing: 0.2 }}
            >
              Contact
            </Text>
          
        </TouchableOpacity>
      </View>
    </View>
  );
};


export default CoachCard;