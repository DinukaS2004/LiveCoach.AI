import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import ButtonBlack from "@/app/components/buttonBlack";
import { useRouter } from "expo-router";
import { useRequireSignupRole } from "@/app/hooks/useRequireSignupRole";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { api, authHeaders } from "@/lib/api";
import { clearSignupRole } from "@/lib/storage";
import { Picker } from "@react-native-picker/picker";
import PasswordInput from "../components/PasswordInput";

type ExperienceLevel =
    | "beginner"
    | "intermediate"
    | "advanced"
    | "professional";

const getPasswordChecks = (password: string) => ({
  minLength: password.length >= 8,
  hasUppercase: /[A-Z]/.test(password),
  hasLowercase: /[a-z]/.test(password),
  hasNumber: /[0-9]/.test(password),
  hasSymbol: /[!@#$%^&*(),.?":{}|<>_\-\\[\]/+=~`]/.test(password),
});

const PasswordRule = ({
                        label,
                        passed,
                      }: {
  label: string;
  passed: boolean;
}) => {
  return (
      <View className="flex-row items-center mb-2">
        <View
            className={`w-5 h-5 rounded-full items-center justify-center mr-2 ${
                passed ? "bg-green-500" : "bg-neutral-300"
            }`}
        >
          <Feather
              name={passed ? "check" : "minus"}
              size={12}
              color="white"
          />
        </View>
        <Text
            className={`text-sm ${
                passed ? "text-green-600" : "text-neutral-500"
            }`}
        >
          {label}
        </Text>
      </View>
  );
};

const CreateAccount = () => {
  const router = useRouter();
  const loadingRole = useRequireSignupRole("athlete");

  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const SPORT_OPTIONS = ["Badminton", "Cricket"] as const;
  const [sports, setSports] = useState<string[]>([]);

  const toggleSport = (sport: string) => {
    setSports((prev) => {
      const exists = prev.includes(sport);
      return exists ? prev.filter((s) => s !== sport) : [...prev, sport];
    });
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    age: "",
    experienceLevel: "intermediate" as ExperienceLevel,
  });

  const emailRegex = useMemo(() => /\S+@\S+\.\S+/, []);
  const passwordChecks = useMemo(
      () => getPasswordChecks(formData.password),
      [formData.password],
  );

  const isPasswordValid =
      passwordChecks.minLength &&
      passwordChecks.hasUppercase &&
      passwordChecks.hasLowercase &&
      passwordChecks.hasNumber &&
      passwordChecks.hasSymbol;

  const passedCount = Object.values(passwordChecks).filter(Boolean).length;

  const passwordStrength =
      passedCount <= 2 ? "Weak" : passedCount <= 4 ? "Medium" : "Strong";

  const isFormValid = () => {
    const ageNum = Number(formData.age);
    const validAge = Number.isInteger(ageNum) && ageNum >= 5 && ageNum <= 120;

    const { firstName, lastName, email, experienceLevel } = formData;

    return (
        firstName.trim() !== "" &&
        lastName.trim() !== "" &&
        emailRegex.test(email) &&
        isPasswordValid &&
        validAge &&
        sports.length > 0 &&
        ["beginner", "intermediate", "advanced", "professional"].includes(
            experienceLevel,
        ) &&
        isChecked
    );
  };

  const handleCreateAccount = async () => {
    if (loading) return;

    if (!isFormValid()) {
      Alert.alert(
          "Invalid Form",
          "Please complete all required fields and make sure your password meets all requirements.",
      );
      return;
    }

    setLoading(true);

    try {
      const sportString = [...sports].sort().join(",");

      const cred = await createUserWithEmailAndPassword(
          auth,
          formData.email.trim(),
          formData.password,
      );

      await updateProfile(cred.user, {
        displayName: `${formData.firstName} ${formData.lastName}`,
      });

      const token = await cred.user.getIdToken(true);

      await api.post(
          "/api/auth/register",
          {
            firebaseUid: cred.user.uid,
            email: formData.email.trim(),
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            role: "athlete",
            authProvider: "email",
            athleteData: {
              sport: sportString,
              age: Number(formData.age),
              experienceLevel: formData.experienceLevel,
              bio: "",
              goals: [],
            },
          },
          { headers: await authHeaders(token) },
      );

      await api.post(
          "/api/auth/complete-onboarding",
          { role: "athlete" },
          { headers: await authHeaders(token) },
      );

      await clearSignupRole();
      router.replace("/(screens)/(profile)");
    } catch (e: any) {
      console.log("SIGNUP FAILED", {
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
      <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-white">
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
              <View className="bg-accent-yellow w-full h-80 relative overflow-hidden pt-14 pb-8 px-6">
                <View className="absolute right-0 top-48 opacity-10 overflow-hidden pointer-events-none">
                  <Text className="text-[115px] font-bebas font-bold text-primary-dark leading-none tracking-tighter">
                    JOIN
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
                    Create Account
                  </Text>
                  <Text className="text-zinc-800 text-sm font-semibold leading-5">
                    Get personalized coaching guidance{"\n"}powered by AI.
                  </Text>
                </View>
              </View>

              <View className="bg-white rounded-t-[30px] pt-10 px-6 flex-1 shadow-sm z-20">
                <View className="gap-y-4">
                  <View className="bg-gray-100 rounded-lg px-4 py-4">
                    <TextInput
                        placeholder="First Name"
                        placeholderTextColor="#D6D5D5"
                        className="text-base text-primary-dark font-medium"
                        value={formData.firstName}
                        onChangeText={(val) =>
                            setFormData({ ...formData, firstName: val })
                        }
                        returnKeyType="next"
                    />
                  </View>

                  <View className="bg-gray-100 rounded-lg px-4 py-4">
                    <TextInput
                        placeholder="Last Name"
                        placeholderTextColor="#D6D5D5"
                        className="text-base text-primary-dark font-medium"
                        value={formData.lastName}
                        onChangeText={(val) =>
                            setFormData({ ...formData, lastName: val })
                        }
                        returnKeyType="next"
                    />
                  </View>

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
                        returnKeyType="next"
                    />
                  </View>

                  <PasswordInput
                      value={formData.password}
                      onChangeText={(val) =>
                          setFormData({ ...formData, password: val })
                      }
                      placeholder="Password"
                      onFocus={() => {
                        setPasswordFocused(true);
                        setPasswordTouched(true);
                      }}
                      onBlur={() => setPasswordFocused(false)}
                      returnKeyType="next"
                  />

                  {passwordFocused && (
                      <View className="mt-1 ml-1 mb-4">
                        <Text className="text-sm font-semibold text-neutral-700 mb-2">
                          Password requirements
                        </Text>

                        <PasswordRule
                            label="At least 8 characters"
                            passed={passwordChecks.minLength}
                        />
                        <PasswordRule
                            label="One uppercase letter"
                            passed={passwordChecks.hasUppercase}
                        />
                        <PasswordRule
                            label="One lowercase letter"
                            passed={passwordChecks.hasLowercase}
                        />
                        <PasswordRule
                            label="One number"
                            passed={passwordChecks.hasNumber}
                        />
                        <PasswordRule
                            label="One symbol"
                            passed={passwordChecks.hasSymbol}
                        />

                        {formData.password.length > 0 && (
                            <Text className="text-sm text-neutral-700 mt-2">
                              Password strength:{" "}
                              <Text className="font-semibold">{passwordStrength}</Text>
                            </Text>
                        )}
                      </View>
                  )}

                  {!passwordFocused &&
                      passwordTouched &&
                      formData.password.length > 0 &&
                      !isPasswordValid && (
                          <Text className="text-sm text-red-500 mt-1 ml-1 mb-4">
                            Password does not meet all requirements.
                          </Text>
                      )}

                  {!passwordFocused &&
                      passwordTouched &&
                      formData.password.length > 0 &&
                      isPasswordValid && (
                          <Text className="text-sm text-green-600 mt-1 ml-1 mb-4">
                            Password looks good.
                          </Text>
                      )}

                  <View className="bg-gray-100 rounded-lg px-4 py-4">
                    <TextInput
                        placeholder="Age"
                        placeholderTextColor="#D6D5D5"
                        keyboardType="number-pad"
                        className="text-base text-primary-dark font-medium"
                        value={formData.age}
                        onChangeText={(val) =>
                            setFormData({
                              ...formData,
                              age: val.replace(/[^0-9]/g, ""),
                            })
                        }
                        returnKeyType="done"
                    />
                  </View>

                  <Text className="text-sm text-neutral-700 mb-2 ml-1">
                    Sport(s)
                  </Text>

                  <View className="bg-gray-100 rounded-lg px-4 py-4">
                    {SPORT_OPTIONS.map((sport) => {
                      const selected = sports.includes(sport);

                      return (
                          <TouchableOpacity
                              key={sport}
                              onPress={() => toggleSport(sport)}
                              className="flex-row items-center justify-between py-3"
                          >
                            <Text className="text-base text-primary-dark font-medium">
                              {sport}
                            </Text>

                            <View
                                className={`w-6 h-6 rounded border items-center justify-center ${
                                    selected
                                        ? "bg-primary-dark border-primary-dark"
                                        : "bg-white border-gray-300"
                                }`}
                            >
                              {selected && (
                                  <Feather name="check" size={16} color="white" />
                              )}
                            </View>
                          </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View className="bg-gray-100 rounded-lg overflow-hidden">
                    <Text className="text-sm text-neutral-700 mt-3 ml-4 mb-1">
                      Experience Level
                    </Text>

                    <Picker
                        selectedValue={formData.experienceLevel}
                        onValueChange={(val) =>
                            setFormData({
                              ...formData,
                              experienceLevel: val as ExperienceLevel,
                            })
                        }
                    >
                      <Picker.Item label="Beginner" value="beginner" />
                      <Picker.Item label="Intermediate" value="intermediate" />
                      <Picker.Item label="Advanced" value="advanced" />
                      <Picker.Item label="Professional" value="professional" />
                    </Picker>
                  </View>

                  <Text className="text-xs text-neutral-500 mt-2 ml-1">
                    Select one or both. (Badminton / Cricket)
                  </Text>
                </View>

                <View className="flex-row items-start mb-2 mt-8">
                  <TouchableOpacity
                      onPress={() => setIsChecked(!isChecked)}
                      className={`w-6 h-6 rounded border items-center justify-center mr-3 mt-0.5 ${
                          isChecked
                              ? "bg-primary-dark border-primary-dark"
                              : "bg-white border-gray-300"
                      }`}
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

                <View>
                  <ButtonBlack
                      title={loading ? "PLEASE WAIT..." : "CREATE ACCOUNT"}
                      onPress={handleCreateAccount}
                  />
                </View>

                <Text className="text-center text-sm text-neutral-700 px-6 pb-8 leading-5 mt-6">
                  Your stats stay protected and are only used to enhance your
                  coaching.
                </Text>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
  );
};

export default CreateAccount;