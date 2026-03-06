import React, { forwardRef, useState } from "react";
import { View, TextInput, Pressable, TextInputProps } from "react-native";
import { Feather } from "@expo/vector-icons";

interface Props extends TextInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

const PasswordInput = forwardRef<TextInput, Props>(
    ({ value, onChangeText, placeholder, ...rest }, ref) => {
        const [visible, setVisible] = useState(false);

        return (
            <View className="bg-gray-100 rounded-lg px-4 py-3 flex-row items-center">
                <TextInput
                    ref={ref}
                    placeholder={placeholder ?? "Password"}
                    placeholderTextColor="#D6D5D5"
                    secureTextEntry={!visible}
                    value={value}
                    onChangeText={onChangeText}
                    className="flex-1 text-base text-primary-dark font-medium"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="newPassword"
                    autoComplete="password-new"
                    {...rest}
                />

                <Pressable onPress={() => setVisible(!visible)} hitSlop={10}>
                    <Feather
                        name={visible ? "eye-off" : "eye"}
                        size={20}
                        color="#ADABAB"
                    />
                </Pressable>
            </View>
        );
    },
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;