import {View, TextInput, ActivityIndicator, Alert} from 'react-native'
import React, {useState, useEffect} from 'react'
import ButtonYellow from '@/app/components/buttonYellow';
import DropDownPicker from 'react-native-dropdown-picker';
import UploadResultModal from './upload-result';
import { router } from "expo-router";
import * as DocumentPicker from 'expo-document-picker';
import { auth } from '@/lib/firebase';
import { uploadAndAnalyze } from '@/lib/analyzeApi';



const SPORTS_DATA = [
  { label: 'Cricket', value: 'cricket' },
  { label: 'Badminton', value: 'badminton' },
];

const SHOTS_DATA = {
  cricket: [
    { label: 'Cover Drive', value: 'cover_drive' },
    { label: 'Pull Shot', value: 'pull_shot' },
    { label: 'Straight Drive', value: 'straight_drive' },
  ],
  badminton: [
    { label: 'Smash', value: 'smash' },
    { label: 'Drop', value: 'drop_shot' },
    { label: 'Clear', value: 'clear' },
  ],
};

const Upload = () => {
    //State for Pop up
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedVideoUri, setSelectedVideoUri] = useState<string | null>(null);
    const [analysisId, setAnalysisId] = useState<string | null>(null);
    
    // State for Sport Dropdown
    const [openSport, setOpenSport] = useState(false);
    const [sportValue, setSportValue] = useState(null);
    const [sports, setSports] = useState(SPORTS_DATA);

    // State for Shot Dropdown
    const [openShot, setOpenShot] = useState(false);
    const [shotValue, setShotValue] = useState(null);
    const [shots, setShots] = useState([]);

    // 2. Effect to update shots when sport changes
    useEffect(() => {
        if (sportValue) {
            setShots(SHOTS_DATA[sportValue]);
            setShotValue(null); // Reset shot selection when sport changes
        } else {
            setShots([]);
        }
    }, [sportValue]);

    const pickVideo = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'video/*',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                setSelectedVideoUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking video:', error);
            Alert.alert('Error', 'Failed to pick video');
        }
    };

    const handleUploadAndAnalyze = async () => {
        if (!selectedVideoUri) {
            Alert.alert('Error', 'Please select a video first');
            return;
        }

        if (!sportValue || !shotValue) {
            Alert.alert('Error', 'Please select both sport and shot type');
            return;
        }

        setLoading(true);

        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                Alert.alert('Error', 'User not authenticated');
                setLoading(false);
                return;
            }

            const idToken = await currentUser.getIdToken();

            const result = await uploadAndAnalyze(
                selectedVideoUri,
                sportValue as string,
                shotValue as string,
                idToken
            );

            if (result.success && result.data?.analysisId) {
                setAnalysisId(result.data.analysisId);
                setShowResult(true);
            } else {
                Alert.alert('Error', result.message || 'Analysis failed');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Upload failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1">
            {/* Form Fields */}
            <View>
            <TextInput
                placeholder="Session title"
                placeholderTextColor="#ADABAB"
                className="bg-neutral-50 p-4 rounded-sm text-base mb-8"
            />
                
            <TextInput
                placeholder="Session Details"
                placeholderTextColor="#ADABAB"
                numberOfLines={4}
                className="bg-neutral-50 p-4 rounded-sm text-base"
            />

            <View className="z-50 my-4 w-40">
                <DropDownPicker
                open={openSport}
                value={sportValue}
                items={sports}
                setOpen={setOpenSport}
                setValue={setSportValue}
                onOpen={() => setOpenShot(false)}
                placeholder="Select Sport"
                style={styles.dropdownBase}
                textStyle={styles.dropdownText}
                dropDownContainerStyle={styles.containerStyle}
                arrowIconStyle={{ tintColor: 'black' } as any}
                />
            </View>

            {/* Shot Selection (Bottom Dropdown - Disabled if no sport selected) */}
            <View className="z-10 w-40">
                <DropDownPicker
                open={openShot}
                value={shotValue}
                items={shots}
                setOpen={setOpenShot}
                setValue={setShotValue}
                onOpen={() => setOpenSport(false)}
                disabled={!sportValue}
                placeholder={sportValue ? "Select Shot" : "Pick Sport"}
                style={[
                    styles.dropdownBase, 
                    !sportValue && { opacity: 0.5 }
                ]}
                textStyle={styles.dropdownText}
                dropDownContainerStyle={styles.containerStyle}
                />
            </View>

            {/* Video Selection Button */}
            <View className="my-4">
                <ButtonYellow
                    title={selectedVideoUri ? "VIDEO SELECTED ✓" : "PICK VIDEO"}
                    onPress={pickVideo}
                />
            </View>

            {/* Upload and Analyze Button */}
            <View className="my-4">
                {loading ? (
                    <View className="bg-accent-yellow py-4 rounded-2xl items-center justify-center">
                        <ActivityIndicator size="large" color="#000" />
                    </View>
                ) : (
                    <ButtonYellow
                        title="UPLOAD"
                        onPress={handleUploadAndAnalyze}
                    />
                )}
            </View>   
            </View>

            {/* Upload Result Popup */}
            <UploadResultModal
                visible={showResult}
                onClose={() => setShowResult(false)}
                onAnalyze={() => {
                    setShowResult(false);
                    router.push({
                        pathname: "/analyze-result",
                        params: { analysisId }
                    });
            }}
            />
        </View>    
    )
}

export default Upload

const styles = {
  dropdownBase: {
    backgroundColor: '#E5E7EB', // slate-200
    borderWidth: 0,
    borderRadius: 8,
    minHeight: 45,
  },
  dropdownText: {
    fontSize: 14,
    color: '#000',
  },
  containerStyle: {
    borderWidth: 0,
    backgroundColor: '#E5E7EB',
  }
};


