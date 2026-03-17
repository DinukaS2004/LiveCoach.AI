import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

type ButtonProps = {
    title: string;
    onPress?: () => void;
};

export default function ButtonGray({title, onPress}: ButtonProps) {

    const router = useRouter();

    return (
        <Pressable
            className="mt-7 w-full flex-row items-center active:opacity-80" onPress={onPress}
        >
            {/* Left Tip */}
            <View className="w-0 h-0 border-t-[26px] border-t-transparent border-b-[26px] border-b-transparent border-r-[20px] border-r-neutral-600" />

            {/* Center Body (flex-1 ensures it fills the w-full) */}
            <View className="flex-1 h-[52px] bg-neutral-600 justify-center items-center">
                <Text className="text-white text-2xl font-bebas uppercase">
                    {title}
                </Text>
            </View>

            {/* Right Tip */}
            <View className="w-0 h-0 border-t-[26px] border-t-transparent border-b-[26px] border-b-transparent border-l-[20px] border-l-neutral-600" />
        </Pressable>
    );
}