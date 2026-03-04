import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type TabButtonProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

const styles = StyleSheet.create({
  triangleLeft: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 18,
    borderBottomWidth: 18,
    borderRightWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  triangleRight: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 18,
    borderBottomWidth: 18,
    borderLeftWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
});

const TabButton = ({ label, isActive, onPress }: TabButtonProps) => (
  <Pressable onPress={onPress} className="flex-row items-center active:opacity-80">
    <View style={styles.triangleLeft} className={isActive ? 'border-r-accent-yellow' : 'border-r-neutral-50'}/>
      <View className={`h-[36px] px-4 justify-center items-center ${isActive ? 'bg-accent-yellow' : 'bg-neutral-50'}`}>
        <Text className={`font-manrope uppercase tracking-tighter ${isActive ? 'font-extrabold text-black' : 'font-semibold text-neutral-800'}`}>
          {label}
        </Text>
      </View>
      <View style={styles.triangleRight} className={isActive ? 'border-l-accent-yellow' : 'border-l-neutral-50'}/>
  </Pressable>
);

type Props = {
  value: 'Cricket' | 'Badminton';
  onSportChange: (sport: 'Cricket' | 'Badminton') => void;
};

const SportTabs = ({ value, onSportChange }: Props) => {
  return (
    <View className="pt-2.5">
      <View className="flex-row gap-2">
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