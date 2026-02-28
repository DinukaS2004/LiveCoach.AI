import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';


type TabButtonProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

const TabButton = ({ label, isActive, onPress }: TabButtonProps) => (
  <TouchableOpacity onPress={onPress} className="flex-row items-center active:opacity-80">
    {isActive && (
      <View className="w-0 h-0 border-t-[18px] border-t-transparent border-b-[18px] border-b-transparent border-r-[12px] border-r-accent-yellow" />
    )}
    <View className={`h-[36px] justify-center items-center px-5 ${isActive ? 'bg-accent-yellow' : 'bg-transparent'}`}>
      <Text className="font-manrope font-semibold text-primary-dark">{label}</Text>
    </View>
    {isActive && (
      <View className="w-0 h-0 border-t-[18px] border-t-transparent border-b-[18px] border-b-transparent border-l-[12px] border-l-accent-yellow" />
    )}
  </TouchableOpacity>
);

type Props = {
  value: 'Cricket' | 'Badminton';
  onSportChange: (sport: 'Cricket' | 'Badminton') => void;
};

const SportTabs = ({ value, onSportChange }: Props) => {
  return (
    <View className="pt-2.5">
      <View className="flex-row gap-3">
        <TabButton
          label="Cricket"
          isActive={value === 'Cricket'}
          onPress={() => onSportChange('Cricket')}
        />

        <TabButton
          label="Badminton"
          isActive={value === 'Badminton'}
          onPress={() => onSportChange('Badminton')}
        />
      </View>
    </View>
  );
};

export default SportTabs;