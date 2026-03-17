import {View, Text} from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import Upload from './upload';
import UploadCoach from './upload-coach';

const Index = () => {

    return (
        <SafeAreaView className="flex-1 bg-primary-light">
            <View className="px-4 py-4 pt-6 flex-1">
                <Text className="font-bebas text-4xl text-primary-dark">
                    UPLOAD VIDEO
                </Text>

                <View className="mt-4 flex-1">
                    <Upload />
                    {/* <UploadCoach/> */}
                </View>     
            </View>
        </SafeAreaView>
    )
}
export default Index