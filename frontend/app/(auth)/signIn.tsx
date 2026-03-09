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
import ButtonBlack from "@/app/components/buttonBlack";
import ButtonGray from "@/app/components/buttonGray";
import PasswordInput from "@/app/components/PasswordInput";
import { useRouter } from "expo-router";
import OtpPopup from "../components/OtpPopUp";
import SuccessAlert from "../components/SuccessAlert";
import { useAuth } from "@/app/context/AuthContext";

const SignIn = () => {
  const router = useRouter();
  const { login, loading } = useAuth();

  const [showOtp, setShowOtp] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [nextRoute, setNextRoute] = useState<string | null>(null);

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

    try {
      const profile = await login(formData.email, formData.password);

      if (!profile) {
        Alert.alert("Sign in failed", "Could not load user profile.");
        return;
      }

      let route = "/(screens)/(profile)";
      let message = "Login successful";

      if (profile.isFirstTimeUser) {
        route = "/(auth)";
        message = "Welcome! Let's get started.";
      } else if (profile.role === "coach") {
        route = "/(screens)/(profile)";
        message = "Welcome back, Coach!";
      } else {
        route = "/(screens)/(profile)";
        message = "Welcome back!";
      }

      setSuccessMessage(message);
      setNextRoute(route);
      setShowSuccessPopup(true);
    } catch (e: any) {
      console.log("LOGIN FAILED", {
        message: e?.message,
        status: e?.response?.status,
        data: e?.response?.data,
      });

      const msg = e?.response?.data?.message || e?.message || "Unknown error";
      Alert.alert("Sign in failed", msg);
    }
  };

  return (
      <View className="flex-1 bg-white">
        <SuccessAlert
            visible={showSuccessPopup}
            message={successMessage}
            onHide={() => {
              setShowSuccessPopup(false);

              if (nextRoute) {
                router.replace(nextRoute as any);
              }
            }}
        />

        <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
        >
          <View className="bg-accent-yellow w-full h-80 relative overflow-hidden pt-14 pb-8 px-6">
            <View className="absolute right-0 top-52 opacity-10 overflow-hidden pointer-events-none">
              <Text className="text-[105px] font-bebas font-bold text-primary-dark leading-none tracking-tighter">
                SIGN IN
              </Text>
            </View>

            <View className="mb-20">
              <Image
                  source={require("../../assets/createAccount/livecoachai-black.png")}
                  className="w-[221px] h-[199px] left-[-31px] top-[-73px] absolute"
                  resizeMode="contain"
              />
            </View>

            <View className="w-full h-full flex-col justify-start items-start gap-2 mt-10 ml-2">
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
              <View className="bg-gray-100 rounded-lg px-4 py-4">
                <TextInput
                    placeholder="Email"
                    placeholderTextColor="#D6D5D5"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                    autoComplete="email"
                    className="text-base text-primary-dark font-medium"
                    value={formData.email}
                    onChangeText={(val) =>
                        setFormData({ ...formData, email: val })
                    }
                />
              </View>

              <PasswordInput
                  value={formData.password}
                  onChangeText={(val) =>
                      setFormData({ ...formData, password: val })
                  }
                  placeholder="Password"
              />

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