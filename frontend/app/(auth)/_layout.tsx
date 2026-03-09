import { Stack } from "expo-router";
import { useAuth } from "@/app/context/AuthContext";

export default function AuthLayout() {
  const { initializing } = useAuth();

  if (initializing) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}