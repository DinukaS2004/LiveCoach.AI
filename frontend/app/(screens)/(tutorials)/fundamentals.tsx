import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FUNDAMENTALS_DATA: Record<string, any> = {
  'cricket': {
    title: 'CRICKET BASICS',
    intro: 'Mastering the core stance and grip is the foundation of every great innings......',
    sections: [
      { label: 'THE GRIP', content: 'Hold the bat with both hands close together. The "V" formed by your thumb and index finger should point down the back of the bat.' },
      { label: 'STANCE', content: 'Feet shoulder-width apart, knees slightly bent. Stay side-on to the bowler with your head still and eyes level.' },
      { label: 'FOOTWORK', content: 'Weight should be on the balls of your feet, allowing for quick movement both forward and back.' }
    ]
  },
  'badminton': {
    title: 'BADMINTON BASICS',
    intro: 'Agility and correct racket handling are the keys to dominating the court.',
    sections: [
      { label: 'THE GRIP', content: 'Use the "V-grip" for forehands and the "Thumb-grip" for backhand shots. Keep the handle loose for wrist flicking.' },
      { label: 'READY POSITION', content: 'Keep your knees bent and racket up. Always return to the center of the court after every shot.' },
      { label: 'SERVICE', content: 'The shuttle must be hit below the waist. Focus on placement rather than just power.' }
    ]
  }
};

const FundamentalsDetail = ({ sport, onBack }: any) => {
  const data = FUNDAMENTALS_DATA[sport] || FUNDAMENTALS_DATA['cricket'];

  return (
    <View className="flex-1 bg-primary pt-16">
      {/*Header */}
      <View className="py-4 px-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={onBack} className="mt-2">
          <Ionicons name="chevron-back" size={40} color="#150000"  />
        </TouchableOpacity>
        <Text className="font-bebas text-4xl text-primary-dark pt-3">{data.title}</Text>
      </View>

      <ScrollView 
        className="flex-1 px-6" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
      >
        <Text className="font-manrope text-primary-dark font-semibold mb-8 text-xl text-center">
          {data.intro}
        </Text>

        {/* Labels */}
        {data.sections.map((section: any, index: number) => (
          <View key={index} className="mb-6 p-6 bg-neutral-100 rounded-3xl border border-neutral-600 shadow-sm">
            <Text className="font-bebas text-2xl text-primary-dark mb-2 tracking-wide">
                {section.label}
            </Text>
            <Text className="font-manrope text-base text-neutral-800 leading-6">
              {section.content}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default FundamentalsDetail;