import { Tabs } from "expo-router";
import { Pressable, StatusBar, View } from "react-native";

// SVG Icons
import HomeIcon from "../../assets/navbarIcons/homeIcon.svg";
import TutorialsIcon from "../../assets/navbarIcons/tutorialsIcon.svg";
import UploadIcon from "../../assets/navbarIcons/uploadIcon.svg";
import CoachIcon from "../../assets/navbarIcons/coachIcon.svg";
import ProfileIcon from "../../assets/navbarIcons/profileIcon.svg";

export default function ScreensTabsLayout() {
  const ACTIVE_COLOR = "#F8FE11";
  const INACTIVE_COLOR = "#000000";

  return (
    <>
      <StatusBar barStyle="dark-content" />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          animation: "fade",
          tabBarStyle: {
            display: "none",
          },
        }}
        tabBar={(props) => {

          const tabs = [
            { name: "(social)/index", Icon: HomeIcon, group: "(social)" },
            { name: "(tutorials)/index", Icon: TutorialsIcon, group: "(tutorials)" },
            { name: "(videoAnalyze)/index", Icon: UploadIcon, group: "(videoAnalyze)" },
            { name: "(browseCoach)/index", Icon: CoachIcon, group: "(browseCoach)" },
            { name: "(profile)/index", Icon: ProfileIcon, group: "(profile)" },
          ];

          //Current active screen
          const { state, descriptors} = props;
          const currentRouteKey = state.routes[state.index].key;
          const options = descriptors[currentRouteKey].options as any;

          const currentRouteName = props.state.routes[props.state.index].name;

          // hide navbar on splash + sessions
          const shouldHideTabBar =
              currentRouteName.includes("splash") ||
              currentRouteName === "(profile)/sessions" ||
              currentRouteName === "(profile)/prograssChart" ||
              currentRouteName === "(videoAnalyze)/analyze-result" ||

              options.tabBarVisible === false;

          if (shouldHideTabBar) return null;
          
          return (
            <View className="bg-primary px-3 pb-8 pt-2 absolute bottom-0 left-0 right-0 z-50">
              <View className="flex-row items-center justify-center">
                <View className="w-0 h-0 border-t-[26px] border-t-transparent border-b-[26px] border-b-transparent border-r-[20px] border-r-neutral-400" />

                <View className="flex-1 h-[52px] bg-neutral-400 flex-row justify-between items-center px-6">
                  {tabs.map((tab, index) => {
                    const isActive =
                      currentRouteName === tab.name ||
                      currentRouteName.startsWith(tab.group + "/");

                    return (
                      <Pressable
                        key={index}
                        onPress={() => props.navigation.navigate(tab.name)}
                        className="active:opacity-70"
                      >
                        <tab.Icon
                          width={26}
                          height={26}
                          color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
                        />
                      </Pressable>
                    );
                  })}
                </View>

                <View className="w-0 h-0 border-t-[26px] border-t-transparent border-b-[26px] border-b-transparent border-l-[20px] border-l-neutral-400" />
              </View>
            </View>
          );
        }}
      >
        {/* Main Routes */}
        <Tabs.Screen name="(social)/index" />
        <Tabs.Screen name="(tutorials)/index" />
        <Tabs.Screen name="(videoAnalyze)/index" />
        <Tabs.Screen name="(browseCoach)/index" />
        <Tabs.Screen name="(profile)/index" />

        {/* Hidden Routes */}
        <Tabs.Screen name="(splash)/index" options={{ href: null }} />
        <Tabs.Screen name="(splash)/splash" options={{ href: null }} />
        <Tabs.Screen name="(profile)/sessions" options={{ href: null }} />
        <Tabs.Screen name="(profile)/prograssChart" options={{ href: null }} />
        <Tabs.Screen name="(tutorials)/viewVideo" options={{ href: null }} />
        <Tabs.Screen name="(tutorials)/sportOverview" options={{ href: null }} />
        <Tabs.Screen name="(browseCoach)/SportTabs" options={{ href: null }} />
        <Tabs.Screen name="(browseCoach)/CoachCard" options={{ href: null }} />
        <Tabs.Screen name="(browseCoach)/CoachContactModel" options={{ href: null }} />
        <Tabs.Screen name="(videoAnalyze)/upload" options={{ href: null }} />
        <Tabs.Screen name="(videoAnalyze)/upload-coach" options={{ href: null }} />
        <Tabs.Screen name="(videoAnalyze)/upload-result" options={{ href: null }} />
        <Tabs.Screen name="(videoAnalyze)/analyze-result" options={{ href: null }} />
        <Tabs.Screen name="(profile)/profile" options={{ href: null }} />
        <Tabs.Screen name="(profile)/profile-coach" options={{ href: null }} />
        <Tabs.Screen name="(profile)/add-note" options={{ href: null }} />
        <Tabs.Screen name="(social)/social" options={{ href: null }} />
      </Tabs>

     

    </>
  );
}