import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Pressable, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";

interface SuccessAlertProps {
    visible: boolean;
    message: string;
    buttonText?: string;
    autoHide?: boolean;
    duration?: number;
    onPressButton?: () => void;
    onHide?: () => void;
}

const SuccessAlert: React.FC<SuccessAlertProps> = ({
                                                       visible,
                                                       message,
                                                       autoHide = true,
                                                       duration = 3000,
                                                       onHide,
                                                   }) => {
    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!visible) return;

        Animated.parallel([
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 70,
                useNativeDriver: true,
            }),
        ]).start();

        if (autoHide) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 180,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onHide?.();
        });
    };

    return (
        <Modal visible={visible} transparent animationType="none">
            <View className="flex-1 items-center justify-center bg-black/25 px-6">
                <Animated.View
                    style={{
                        opacity: opacityAnim,
                        transform: [{ scale: scaleAnim }],
                    }}
                    className="w-full max-w-[360px] rounded-[28px] bg-[#FAFAFA] px-6 py-10 items-center"
                >
                    <View className="w-16 h-16 rounded-full bg-[#F8FE11] items-center justify-center mb-6">
                        <Feather name="check" size={34} color="#15000" />
                    </View>

                    <Text className="text-[#15000] text-[17px] font-bebas uppercase text-center tracking-wide mb-5">
                        {message}
                    </Text>
                </Animated.View>
            </View>
        </Modal>
    );
};

export default SuccessAlert;