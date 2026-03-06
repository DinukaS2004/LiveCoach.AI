import React, { useCallback, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { auth } from "@/lib/firebase";
import { api, authHeaders } from "@/lib/api";
import ProfileAthlete, { AthleteData } from "./profile";
import ProfileCoach, { CoachData } from "./profile-coach";

type BackendRole = "athlete" | "coach";
type UiRole = "Athlete" | "Coach";

type BackendProfile = {
  firstName: string;
  lastName: string;
  role: BackendRole;
  isEmailVerified?: boolean;
  coachData?: {
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
    players?: string[];
  };
};

type ProfileState = {
  role: UiRole;
  name: string;
  isVerified?: boolean;
  players: { id: string; name: string }[];
};

const normalizeName = (value: string) => value.trim().toUpperCase();

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

const toCoachPlayers = (coachData?: BackendProfile["coachData"]) => {
  const fromCurrentAthletes = (coachData?.currentAthletes ?? [])
    .map(mapCurrentAthleteToPlayer)
    .filter((player) => player.name.length > 0);

  const fromLegacyPlayers = (coachData?.players ?? [])
    .map((playerName, index) => ({
      id: `legacy-player-${index}`,
      name: normalizeName(playerName || ""),
    }))
    .filter((player) => player.name.length > 0);

  const merged = [...fromCurrentAthletes, ...fromLegacyPlayers];
  const uniqueByName = new Map<string, { id: string; name: string }>();

  merged.forEach((player) => {
    if (!uniqueByName.has(player.name)) {
      uniqueByName.set(player.name, player);
    }
  });

  return Array.from(uniqueByName.values());
};

//Convert first and last name into a full-name
const splitName = (fullName: string) => {
  const parts = fullName.trim().replace(/\s+/g, " ").split(" "); //remove extra spaces and split into array
  const firstName = parts.shift() || "";
  const lastName = parts.join(" ") || firstName;
  return { firstName, lastName };
};

//Convert backend profile data to frontend UI
const UiProfile = (raw: BackendProfile): ProfileState => ({
  role: raw.role === "coach" ? "Coach" : "Athlete",
  name: `${raw.firstName ?? ""} ${raw.lastName ?? ""}`.trim().toUpperCase(), 
  isVerified: raw.role === "coach" ? !!raw.isEmailVerified : undefined, 
  players: raw.role === "coach" ? toCoachPlayers(raw.coachData) : [],
});

const Index = () => {
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingName, setUpdatingName] = useState(false);

  // Fetch profile for the user
  const fetchProfile = useCallback(async () => {
    const token = await auth.currentUser!.getIdToken();
    const res = await api.get("/api/user/profile", {
      headers: await authHeaders(token),
    });
    const payload = (res.data?.data) as BackendProfile; 
    setProfile(UiProfile(payload));
  }, []);

  // Refetch profile whenever user swithces back to the screen
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          if (mounted) setLoading(true);
          await fetchProfile();
        } finally {
          if (mounted) setLoading(false);
        }
      })();
      return () => {
        mounted = false;
      };
    }, [fetchProfile]),
  );

  //Update the users name in the backend
  const handleUpdateName = useCallback(
    async (nextName: string) => {
      const token = await auth.currentUser!.getIdToken();
      const { firstName, lastName } = splitName(nextName);

      // Update the UI before the API call
      setProfile((prev) =>
        prev
          ? { ...prev, name: `${firstName} ${lastName}`.trim().toUpperCase() }
          : prev,
      );

      setUpdatingName(true);
      try {
        //update the name in backend
        await api.put(
          "/api/user/profile",
          { firstName, lastName },
          { headers: await authHeaders(token) },
        );
        //Fetch the updated profile from the server
        await fetchProfile();
      } finally {
        setUpdatingName(false);
      }
    },
    [fetchProfile],
  );

  //Update the players for a coach in the backend
  const handleUpdatePlayers = useCallback(
    async (nextPlayers: { id: string; name: string }[]) => {
      setProfile((prev) => (prev ? { ...prev, players: nextPlayers } : prev));

      const token = await auth.currentUser!.getIdToken();
      await api.put(
        "/api/user/profile",
        {
          coachData: {
            currentAthletes: nextPlayers.map((player) => player.name.trim()),
          },
        },
        { headers: await authHeaders(token) },
      );

      await fetchProfile();
    },
    [fetchProfile],
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
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <View className="flex-1 items-center justify-center">
          <Text>Unable to load profile.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={["bottom"]}>
      <View className="flex-1">
        {/*Route to the correct profile component */}
        {profile.role === "Coach" ? (
          <ProfileCoach
            data={profile as CoachData}
            onPressPlayer={() => router.push("/(screens)/(profile)/sessions")}
            onUpdateName={handleUpdateName}
            onUpdatePlayers={handleUpdatePlayers}
            isSavingName={updatingName}
          />
        ) : (
          <ProfileAthlete
            data={profile as AthleteData}
            onPressSessions={() => router.push("/(screens)/(profile)/sessions")}
            onUpdateName={handleUpdateName}
            isSavingName={updatingName}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Index;