import {Slot, Stack} from "expo-router";
import "./global.css";
import {requireNativeComponent, StatusBar} from "react-native";
import { useFonts } from "expo-font"

export default function RootLayout() {
    const [loaded] = useFonts({
        "abeezee": require('../app/fonts/ABeeZee-Regular.ttf'),
        "bebas": require('../app/fonts/BebasNeue-Regular.ttf'),
        "manrope": require('../app/fonts/Manrope-VariableFont_wght.ttf')
    })

    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* {<Stack.Screen name="(auth)" options={{ headerShown: false }} /> } */}
            {/* Your route groups are children automatically */}
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            {/* <Stack.Screen name="(screens)" options={{ headerShown: false }} /> */}
        </Stack>
    );
}
