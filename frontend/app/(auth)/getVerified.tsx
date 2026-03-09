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
import { useRouter } from "expo-router";
import UploadSection from "@/app/components/uploadSection";
import { useRequireSignupRole } from "@/app/hooks/useRequireSignupRole";

import { Picker } from "@react-native-picker/picker";

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { api, authHeaders } from "@/lib/api";
import { clearSignupRole } from "@/lib/storage";
import PasswordInput from "../components/PasswordInput";
import SuccessAlert from "../components/SuccessAlert";
import { useAuth } from "@/app/context/AuthContext";

type CoachSport = "Badminton" | "Cricket";

const getVerified = () => {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const loadingRole = useRequireSignupRole("coach");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  // coach can select ONLY one sport
  const [sport, setSport] = useState<CoachSport>("Badminton");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    nic: "", // ✅ store NIC correctly
    yearsOfExperience: "", // ✅ required by backend
  });

  const emailRegex = useMemo(() => /\S+@\S+\.\S+/, []);
  const passwordRegex = useMemo(
    () => /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/,
    [],
  );
  const nicRegex = useMemo(() => /^.{10,}$/, []); // simple: at least 10 chars

  const isFormValid = () => {
    const { firstName, lastName, email, password, nic, yearsOfExperience } =
      formData;

    const yearsNum = Number(yearsOfExperience);
    const validYears =
      Number.isInteger(yearsNum) && yearsNum >= 0 && yearsNum <= 70;

    return (
      firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      emailRegex.test(email) &&
      passwordRegex.test(password) &&
      nicRegex.test(nic.trim()) &&
      validYears &&
      isChecked
    );
  };

  const handleCreateAccount = async () => {
    if (loading) return;

    if (!isFormValid()) {
      Alert.alert(
        "Invalid Form",
        "Please ensure all fields are correct (NIC min 10 chars, years 0-70) and you agreed to the terms.",
      );
      return;
    }

    setLoading(true);
    try {
      // 1) Firebase create user
      const cred = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password,
      );

      await updateProfile(cred.user, {
        displayName: `${formData.firstName} ${formData.lastName}`,
      });

      // 2) Get Firebase ID token
      const token = await cred.user.getIdToken(true);

      // 3) Backend register (Mongo)
      await api.post(
        "/api/auth/register",
        {
          firebaseUid: cred.user.uid,
          email: formData.email.trim(),
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          role: "coach",
          authProvider: "email",
          coachData: {
            specialization: [sport], // ✅ only ONE sport
            yearsOfExperience: Number(formData.yearsOfExperience),
            nic: formData.nic.trim(), // ✅
            certifications: [], // optional, safe
            bio: "", // optional
            // You can later send uploaded files URLs here
          },
        },
        { headers: await authHeaders(token) },
      );

      // 4) Complete onboarding
      await api.post(
        "/api/auth/complete-onboarding",
        { role: "coach" },
        { headers: await authHeaders(token) },
      );

      // 5) Clear signup role + go to app
     await clearSignupRole();
    await refreshUser();

    setSuccessMessage("Account created successfully");
    setShowSuccessAlert(true);
    } catch (e: any) {
      console.log("COACH SIGNUP FAILED", {
        message: e?.message,
        status: e?.response?.status,
        data: e?.response?.data,
      });
      Alert.alert(
        "Sign up failed",
        e?.response?.data?.message || e?.message || "Unknown error",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingRole) return null;

  return (
    <View className="flex-1 bg-white">
      <SuccessAlert
        visible={showSuccessAlert}
        message={successMessage}
        autoHide={true}
        duration={3000}
        onHide={() => {
    setShowSuccessAlert(false);
    router.replace("/(screens)/(profile)");
  }}
/>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* --- HEADER SECTION --- */}
        <View className="bg-accent-yellow w-full h-80 relative overflow-hidden pt-14 pb-8 px-6">
          <View className="absolute right-0 top-48 opacity-10 overflow-hidden pointer-events-none">
            <Text className="text-[115px] font-bebas font-bold text-primary-dark leading-none tracking-tighter">
              VERIFY
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
              Get Verified as a Coach
            </Text>
            <Text className="text-zinc-800 text-sm font-semibold leading-5">
              Show your expertise. {"\n"}Let AI enhance your coaching.
            </Text>
          </View>
        </View>

        {/* --- FORM SECTION --- */}
        <View className="bg-white rounded-t-[30px] pt-10 px-6 flex-1 shadow-sm z-20">
          <View className="gap-y-4">
            {/* First Name */}
            <View className="bg-gray-100 rounded-lg px-4 py-4">
              <TextInput
                placeholder="First Name"
                placeholderTextColor="#D6D5D5"
                className="text-base text-primary-dark font-medium"
                onChangeText={(val) =>
                  setFormData({ ...formData, firstName: val })
                }
              />
            </View>

            {/* Last Name */}
            <View className="bg-gray-100 rounded-lg px-4 py-4">
              <TextInput
                placeholder="Last Name"
                placeholderTextColor="#D6D5D5"
                className="text-base text-primary-dark font-medium"
                onChangeText={(val) =>
                  setFormData({ ...formData, lastName: val })
                }
              />
            </View>

            {/* ✅ Coach Sport dropdown (single select) */}
            <View className="bg-gray-100 rounded-lg overflow-hidden">
              <Text className="text-sm text-neutral-700 mt-3 ml-4 mb-1">
                Sport (Specialization)
              </Text>
              <Picker
                selectedValue={sport}
                onValueChange={(val) => setSport(val)}
              >
                <Picker.Item label="Badminton" value="Badminton" />
                <Picker.Item label="Cricket" value="Cricket" />
              </Picker>
            </View>

            {/* ✅ Years of experience */}
            <View className="bg-gray-100 rounded-lg px-4 py-4">
              <TextInput
                placeholder="Years of Experience"
                placeholderTextColor="#D6D5D5"
                keyboardType="number-pad"
                className="text-base text-primary-dark font-medium"
                value={formData.yearsOfExperience}
                onChangeText={(val) =>
                  setFormData({
                    ...formData,
                    yearsOfExperience: val.replace(/[^0-9]/g, ""),
                  })
                }
              />
            </View>

            {/* Email */}
            <View className="bg-gray-100 rounded-lg px-4 py-4">
              <TextInput
                placeholder="Email"
                placeholderTextColor="#D6D5D5"
                keyboardType="email-address"
                autoCapitalize="none"
                className="text-base text-primary-dark font-medium"
                onChangeText={(val) => setFormData({ ...formData, email: val })}
              />
            </View>

            {/* Password */}
            <PasswordInput
              value={formData.password}
              onChangeText={(val) =>
                setFormData({ ...formData, password: val })
              }
              placeholder="Password"
            />
          </View>

          <Text className="text-sm text-neutral-700 mt-2 mb-6 ml-1 leading-4">
            Password must be at least 8 character long and include 1 capital
            letter and 1 symbol
          </Text>

          {/* NIC */}
          <View className="bg-gray-100 rounded-lg px-4 py-4">
            <TextInput
              placeholder="National Identity Card Number"
              placeholderTextColor="#D6D5D5"
              className="text-base text-primary-dark font-medium"
              value={formData.nic}
              onChangeText={(val) => setFormData({ ...formData, nic: val })}
            />
          </View>

          <Text className="text-sm text-neutral-700 mt-2 mb-6 ml-1 leading-4">
            NIC number must be at least 10 character long
          </Text>

          <View className="mt-10">
            <UploadSection />
          </View>

          {/* Terms Checkbox */}
          <View className="flex-row items-start mb-8">
            <TouchableOpacity
              onPress={() => setIsChecked(!isChecked)}
              className={`w-6 h-6 rounded border items-center justify-center mr-3 mt-0.5 ${isChecked ? "bg-primary-dark border-primary-dark" : "bg-white border-gray-300"}`}
            >
              {isChecked && <Feather name="check" size={16} color="white" />}
            </TouchableOpacity>
            <Text className="flex-1 text-sm text-neutral-700">
              I agree to the{" "}
              <Text className="text-primary-dark font-bold underline">
                Terms
              </Text>{" "}
              and{" "}
              <Text className="text-black font-bold underline">
                Privacy Policy
              </Text>
            </Text>
          </View>

          <Text className="text-center text-sm text-neutral-700 px-3 pb-8 leading-5 mt-4">
            Your stats stay protected and are only used to enhance your
            coaching.
          </Text>

          {/* Submit Button */}
          <View className="mb-10">
            <ButtonBlack
              title={loading ? "PLEASE WAIT..." : "CREATE ACCOUNT"}
              onPress={handleCreateAccount}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default getVerified;
