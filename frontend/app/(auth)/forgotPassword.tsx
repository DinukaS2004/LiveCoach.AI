import React, { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import ButtonBlack from "@/app/components/buttonBlack";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const emailRegex = useMemo(() => /\S+@\S+\.\S+/, []);

    const handleReset = async () => {
        const cleanEmail = email.trim().toLowerCase();

        if (!emailRegex.test(cleanEmail)) {
            Alert.alert("Invalid email", "Please enter a valid email address.");
            return;
        }

        if (loading) return;

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, cleanEmail);

            Alert.alert(
                "Check your email",
                "We sent you a password reset link. Open your email and follow the instructions.",
                [{ text: "OK", onPress: () => router.back() }]
            );
        } catch (e: any) {
            // Firebase common errors
            const code = e?.code;

            if (code === "auth/user-not-found") {
                Alert.alert("No account found", "No user exists with that email.");
            } else if (code === "auth/invalid-email") {
                Alert.alert("Invalid email", "Please enter a valid email address.");
            } else if (code === "auth/too-many-requests") {
                Alert.alert("Too many attempts", "Please wait a bit and try again.");
            } else {
                Alert.alert("Reset failed", e?.message || "Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                <View className="px-6 pt-16">
                    <Text className="font-bebas text-4xl text-primary-dark">Forgot Password</Text>
                    <Text className="text-neutral-700 mt-2">
                        Enter your account email and we’ll send a reset link.
                    </Text>

                    <View className="bg-gray-100 rounded-lg px-4 py-4 mt-8">
                        <TextInput
                            placeholder="Email"
                            placeholderTextColor="#D6D5D5"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            className="text-base text-primary-dark font-medium"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View className="mt-6">
                        <ButtonBlack title={loading ? "SENDING..." : "SEND RESET LINK"} onPress={handleReset} />
                    </View>

                    <TouchableOpacity className="mt-6 items-center" onPress={() => router.back()}>
                        <Text className="text-neutral-700 underline">Back to Sign In</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}