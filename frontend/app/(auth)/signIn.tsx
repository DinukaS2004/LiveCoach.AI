import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import ButtonBlack from "@/app/components/buttonBlack";
import ButtonGray from "@/app/components/buttonGray";
import PasswordInput from "@/app/components/PasswordInput";
import { useRouter } from "expo-router";
import OtpPopup from "../components/OtpPopUp";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { api, authHeaders } from "@/lib/api";

const SignIn = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const emailRegex = useMemo(() => /\S+@\S+\.\S+/, []);

  const isFormValid = () => {
    return (
      emailRegex.test(formData.email.trim()) && formData.password.length >= 1
    );
  };

  const handleSignIn = async () => {
    if (loading) return;

    if (!isFormValid()) {
      Alert.alert("Invalid Form", "Please enter a valid email and password.");
      return;
    }

    setLoading(true);
    try {
      // 1) Firebase sign-in
      const cred = await signInWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password,
      );

      // 2) ID token
      const token = await cred.user.getIdToken(true);

      // 3) Backend login (Mongo)
      const res = await api.post(
        "/api/auth/login",
        {},
        { headers: await authHeaders(token) },
      );

     

      //Backend returns responseData directly in successResponse.
      const payload = res.data?.data ?? res.data;

      const role = payload?.role; // 'athlete' | 'coach'
      const isFirstTimeUser = payload?.isFirstTimeUser;

      // 4) Route user
      if (isFirstTimeUser) {
        // Up to you: you can send them to onboarding again, or straight to profile setup.
        router.replace("/(auth)"); // onboarding index in your structure
        return;
      }

      if (role === "coach") {
        // Example: coach home
        router.replace("/(screens)/(profile)");
      } else {
        // athlete home
        router.replace("/(screens)/(profile)");
      }
    } catch (e: any) {
      console.log("LOGIN FAILED", {
        message: e?.message,
        status: e?.response?.status,
        data: e?.response?.data,
      });

      // "User not found. Please complete registration first."
      const msg = e?.response?.data?.message || e?.message || "Unknown error";
      Alert.alert("Sign in failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* --- HEADER SECTION --- */}
        <View className="bg-accent-yellow w-full h-80 relative overflow-hidden pt-14 pb-8 px-6">
          <View className="absolute right-0 top-52 opacity-10 overflow-hidden pointer-events-none">
            <Text className="text-[105px] font-bebas font-bold text-primary-dark leading-none tracking-tighter">
              SIGN IN
            </Text>
          </View>

          <View className=" mb-20">
            <Image
              source={require("../../assets/createAccount/livecoachai-black.png")}
              className="w-[221px] h-[199px] left-[-31px] top-[-73px] absolute"
              resizeMode="contain"
            />
          </View>

          <View className="w-full h-full flex-col  justify-start items-start gap-2 mt-10 ml-2">
            <Text className="font-bebas text-primary-dark uppercase tracking-tight mb-2">
              SIGN IN
            </Text>
            <Text className="text-zinc-800 text-sm font-semibold leading-5">
              Welcome back!
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-t-[30px] pt-10 px-6 flex-1 shadow-sm z-20">
          <View className="gap-y-4">
            {/* Email */}
            <View className="bg-gray-100 rounded-lg px-4 py-4">
              <TextInput
                placeholder="Email"
                placeholderTextColor="#D6D5D5"
                keyboardType="email-address"
                autoCapitalize="none"
                className="text-base text-primary-dark font-medium"
                value={formData.email}
                onChangeText={(val) => setFormData({ ...formData, email: val })}
              />
            </View>

            <PasswordInput
              value={formData.password}
              onChangeText={(val) =>
                setFormData({ ...formData, password: val })
              }
              placeholder="Password"
            />

            {/* Forgot Password */}
            <TouchableOpacity
              className="items-end mb-8 ml-4"
              onPress={() => router.push("/(auth)/forgotPassword")}
            >
              <OtpPopup
                visible={showOtp}
                onClose={() => setShowOtp(false)}
                onSubmit={(code) => {
                  console.log("Entered OTP:", code);
                  setShowOtp(false);
                }}
              />
              <Text className="text-neutral-700 text-xs underline">
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <View className="mt-10">
            <ButtonBlack
              title={loading ? "PLEASE WAIT..." : "SIGN IN"}
              onPress={handleSignIn}
            />
          </View>

          <View className="items-center mt-6">
            <Text className="text-neutral-700 text-3xl font-bebas">OR</Text>
          </View>

          <View>
            <ButtonGray
              title="SIGN UP"
              onPress={() => router.push("/(auth)/landing")}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SignIn;
console.log("Firebase projectId:", auth.app.options.projectId);
console.log("Firebase authDomain:", auth.app.options.authDomain);