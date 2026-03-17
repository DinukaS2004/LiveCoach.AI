import {View, Text} from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import Social from './social';

const Index = () => {

    return (
        <SafeAreaView className="flex-1 bg-light">
            <View className="px-4 py-4 pt-6 flex-1">
                <Text className="font-bebas text-4xl text-black">
                    Social
                </Text>

                <View className="mt-4 flex-1">
                    <Social />
                </View>     
            </View>
        </SafeAreaView>
    )
}
export default Index