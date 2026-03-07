import axios from "axios";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { auth } from "@/lib/firebase";
import { api, authHeaders } from "@/lib/api";
import ProfileAthlete from "./profile";
import ProfileCoach from "./profile-coach";

type BackendRole = "athlete" | "coach";
type UiRole = "Athlete" | "Coach";

//Raw profile from the backend API
type BackendProfile = {
  firstName: string;
  lastName: string;
  role: BackendRole;
  email?: string;
  isEmailVerified?: boolean;
  profilePicture?: string | null;
  //For coaches 
  coachData?: {
    //Current athletes
    currentAthletes?: Array<
      | string
      | {
          _id?: string;
          id?: string;
          name?: string;
          firstName?: string;
          lastName?: string;
        }
    >;
  };
};

//UI profile structure 
type ProfileState = {
  role: UiRole;
  name: string;
  isVerified?: boolean;
  profileImage: string | null;
  players: { id: string; name: string }[];
};

type ApiErrorPayload = {
  message?: string;
};

//full name normalization
const normalizeName = (value: string) => value.trim().toUpperCase();

//Maps current athletes to the players in the UI 
const mapCurrentAthleteToPlayer = (
  athlete: NonNullable<NonNullable<BackendProfile["coachData"]>["currentAthletes"]>[number],
  index: number,
) => {
  if (typeof athlete === "string") {
    const name = normalizeName(athlete);
    return {
      id: `current-athlete-${index}`,
      name,
    };
  }

  const fullName =
    athlete.name?.trim() || `${athlete.firstName ?? ""} ${athlete.lastName ?? ""}`.trim();

  return {
    id: athlete._id || athlete.id || `current-athlete-${index}`,
    name: normalizeName(fullName || `ATHLETE ${index + 1}`),
  };
};

//Getting the current athletes from the coach)
const toCoachPlayers = (coachData?: BackendProfile["coachData"]) => {
  const fromCurrentAthletes = (coachData?.currentAthletes ?? [])
    .map(mapCurrentAthleteToPlayer)
    .filter((player) => player.name.length > 0);
  const uniqueByName = new Map<string, { id: string; name: string }>(); //Remove duplicate names 

  fromCurrentAthletes.forEach((player) => {
    if (!uniqueByName.has(player.name)) {
      uniqueByName.set(player.name, player);
    }
  });

  return Array.from(uniqueByName.values());
};

const splitName = (fullName: string) => {
  const parts = fullName.trim().replace(/\s+/g, " ").split(" ");
  const firstName = parts.shift() || "";
  const lastName = parts.join(" ") || firstName;
  return { firstName, lastName };
};

const toUiProfile = (raw: BackendProfile): ProfileState => {
  const fullName = `${raw.firstName ?? ""} ${raw.lastName ?? ""}`.trim();


  return {
    role: raw.role === "coach" ? "Coach" : "Athlete",
    name: normalizeName(fullName || fallbackName),
    isVerified: raw.role === "coach" ? !!raw.isEmailVerified : undefined, //verified checking for coaches 
    profileImage: raw.profilePicture || null,
    players: raw.role === "coach" ? toCoachPlayers(raw.coachData) : [],
  };
};

//API error parsing and handling
const parseRequestError = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const payload = error.response?.data as ApiErrorPayload | undefined;

    return {
      status,
      message: payload?.message || error.message || fallbackMessage,
    };
  }

  if (error instanceof Error) {
    return {
      status: undefined,
      message: error.message || fallbackMessage,
    };
  }

  return {
    status: undefined,
    message: fallbackMessage,
  };
};

const isUnauthorizedStatus = (status?: number) => status === 401 || status === 403;

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Unable to read selected image."));
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unable to encode selected image."));
      }
    };

    reader.readAsDataURL(blob);
  });

const localUriToDataUrl = async (localUri: string): Promise<string> => {
  const imageResponse = await fetch(localUri);

  if (!imageResponse.ok) {
    throw new Error("Unable to load selected image.");
  }

  const imageBlob = await imageResponse.blob();

  if (imageBlob.size > 5 * 1024 * 1024) {
    throw new Error("Selected image is too large. Please choose a smaller image.");
  }

  const dataUrl = await blobToDataUrl(imageBlob);

  if (!/^data:image\//i.test(dataUrl)) {
    throw new Error("Selected file is not a supported image.");
  }

  return dataUrl;
};

const Index = () => {
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingName, setUpdatingName] = useState(false);
  const [updatingImage, setUpdatingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  const getAuthToken = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("You are not signed in.");
    }

    return currentUser.getIdToken();
  }, []);

  const applyRequestError = useCallback((error: unknown, fallbackMessage: string) => {
    const parsed = parseRequestError(error, fallbackMessage);
    setErrorMessage(parsed.message);
    setErrorStatus(parsed.status ?? null);

    return parsed;
  }, []);

  const fetchProfile = useCallback(async () => {
    const token = await getAuthToken();

    const res = await api.get("/api/user/profile", {
      headers: await authHeaders(token),
    });

    const payload = res.data?.data as BackendProfile | undefined;

    if (!payload) {
      throw new Error("Profile data is missing from the server response.");
    }

    setProfile(toUiProfile(payload));
    setErrorMessage(null);
    setErrorStatus(null);
  }, [getAuthToken]);

  const retryFetchProfile = useCallback(async () => {
    setLoading(true);

    try {
      await fetchProfile();
    } catch (error) {
      applyRequestError(error, "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  }, [applyRequestError, fetchProfile]);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      (async () => {
        if (mounted) {
          setLoading(true);
        }

        try {
          await fetchProfile();
        } catch (error) {
          if (mounted) {
            applyRequestError(error, "Unable to load profile.");
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      })();

      return () => {
        mounted = false;
      };
    }, [applyRequestError, fetchProfile]),
  );

  const handleUnauthorized = useCallback(async () => {
    await auth.signOut();
    router.replace("/(auth)/signIn");
  }, []);

  const handleUpdateName = useCallback(
    async (nextName: string) => {
      if (updatingName) {
        return;
      }

      const trimmedName = nextName.trim();

      if (!trimmedName) {
        return;
      }

      const previousName = profile?.name;
      const { firstName, lastName } = splitName(trimmedName);

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              name: normalizeName(`${firstName} ${lastName}`.trim()),
            }
          : prev,
      );

      setUpdatingName(true);

      try {
        const token = await getAuthToken();

        await api.put(
          "/api/user/profile",
          { firstName, lastName },
          { headers: await authHeaders(token) },
        );

        setErrorMessage(null);
        setErrorStatus(null);
      } catch (error) {
        if (previousName) {
          setProfile((prev) => (prev ? { ...prev, name: previousName } : prev));
        }

        const parsed = applyRequestError(error, "Unable to update your name.");

        Alert.alert(isUnauthorizedStatus(parsed.status) ? "Session expired" : "Update failed", parsed.message);

        if (isUnauthorizedStatus(parsed.status)) {
          await handleUnauthorized();
        }
      } finally {
        setUpdatingName(false);
      }
    },
    [applyRequestError, getAuthToken, handleUnauthorized, profile?.name, updatingName],
  );

  const handleUpdatePlayers = useCallback(
    async (nextPlayers: { id: string; name: string }[]) => {
      const previousPlayers = profile?.players ?? [];

      setProfile((prev) => (prev ? { ...prev, players: nextPlayers } : prev));

      try {
        const token = await getAuthToken();

        await api.put(
          "/api/user/profile",
          {
            coachData: {
              currentAthletes: nextPlayers.map((player) => player.name.trim()),
            },
          },
          { headers: await authHeaders(token) },
        );

        setErrorMessage(null);
        setErrorStatus(null);
      } catch (error) {
        setProfile((prev) => (prev ? { ...prev, players: previousPlayers } : prev));

        const parsed = applyRequestError(error, "Unable to update players.");

        if (isUnauthorizedStatus(parsed.status)) {
          await handleUnauthorized();
        }

        throw error;
      }
    },
    [applyRequestError, getAuthToken, handleUnauthorized, profile?.players],
  );

  const handleUpdateProfileImage = useCallback(
    async (localUri: string) => {
      if (!profile || updatingImage) {
        return;
      }

      const previousImage = profile.profileImage;
      setProfile((prev) => (prev ? { ...prev, profileImage: localUri } : prev));
      setUpdatingImage(true);

      try {
        const token = await getAuthToken();
        const dataUrl = await localUriToDataUrl(localUri);

        await api.put(
          "/api/user/profile",
          { profilePicture: dataUrl },
          { headers: await authHeaders(token) },
        );

        setProfile((prev) => (prev ? { ...prev, profileImage: dataUrl } : prev));
        setErrorMessage(null);
        setErrorStatus(null);
      } catch (error) {
        setProfile((prev) => (prev ? { ...prev, profileImage: previousImage } : prev));

        const parsed = applyRequestError(error, "Unable to update profile image.");

        Alert.alert(
          isUnauthorizedStatus(parsed.status) ? "Session expired" : "Image update failed",
          parsed.message,
        );

        if (isUnauthorizedStatus(parsed.status)) {
          await handleUnauthorized();
        }
      } finally {
        setUpdatingImage(false);
      }
    },
    [applyRequestError, getAuthToken, handleUnauthorized, profile, updatingImage],
  );

  if (loading && !profile) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    const isUnauthorized = isUnauthorizedStatus(errorStatus ?? undefined);

    return (
      <SafeAreaView className="flex-1 bg-primary">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base text-black">
            {errorMessage || "Unable to load profile."}
          </Text>

          <Pressable
            onPress={() => {
              void retryFetchProfile();
            }}
            className="mt-4 rounded-full bg-black px-6 py-3"
          >
            <Text className="font-manrope text-sm font-bold uppercase text-white">Retry</Text>
          </Pressable>

          {isUnauthorized && (
            <Pressable
              onPress={() => {
                void handleUnauthorized();
              }}
              className="mt-3 rounded-full border border-black px-6 py-3"
            >
              <Text className="font-manrope text-sm font-bold uppercase text-black">Go To Sign In</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={["bottom"]}>
      <View className="flex-1">
        {profile.role === "Coach" ? (
          <ProfileCoach
            data={{
              role: "Coach",
              name: profile.name,
              isVerified: profile.isVerified,
              players: profile.players,
            }}
            profileImage={profile.profileImage}
            onPressPlayer={() => router.push("/(screens)/(profile)/sessions")}
            onUpdateName={handleUpdateName}
            onUpdatePlayers={handleUpdatePlayers}
            onUpdateProfileImage={handleUpdateProfileImage}
            isSavingName={updatingName}
            isSavingImage={updatingImage}
          />
        ) : (
          <ProfileAthlete
            data={{
              role: "Athlete",
              name: profile.name,
            }}
            profileImage={profile.profileImage}
            onPressSessions={() => router.push("/(screens)/(profile)/sessions")}
            onUpdateName={handleUpdateName}
            onUpdateProfileImage={handleUpdateProfileImage}
            isSavingName={updatingName}
            isSavingImage={updatingImage}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Index;
