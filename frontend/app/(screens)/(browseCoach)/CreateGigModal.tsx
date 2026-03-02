import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, Alert, TouchableWithoutFeedback } from 'react-native';
import { publishGig, updateGig, deleteMyGig } from '../../../services/gigService'; // Import deleteMyGig
import { getAuth } from 'firebase/auth';

type Props = {
  visible: boolean;
  onClose: () => void;
  existingGig?: any; 
};

const CreateGigModal = ({ visible, onClose, existingGig }: Props) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [sport, setSport] = useState<'Cricket' | 'Badminton'>('Cricket');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible && existingGig) {
      setName(existingGig.name || '');
      setPrice(String(existingGig.price || ''));
      setBillingCycle(existingGig.billingCycle || 'Monthly');
      setPhone(existingGig.phone || '');
      setEmail(existingGig.email || '');
      setSport(existingGig.sport || 'Cricket');
      setLocation(existingGig.location || '');
    } else if (visible && !existingGig) {
        setName(''); setPrice(''); setPhone(''); setEmail(''); setSport('Cricket'); setLocation('');
    }
  }, [visible, existingGig]);

  const handlePriceChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    setPrice(cleaned);
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9+]/g, '');
    setPhone(cleaned);
  };

  const isFormValid = name.trim().length >= 2 && location.trim().length >= 2 && price.length > 0 && email.includes('@');

  const handleAction = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const user = getAuth().currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const gigData = { name: name.trim(), location: location.trim(), price: parseFloat(price), billingCycle, phone: phone.trim(), email: email.trim().toLowerCase(), sport };

      const result = existingGig ? await updateGig(gigData, token) : await publishGig(gigData, token);

      if (result.success) {
        Alert.alert("Success", existingGig ? "Gig updated!" : "Gig published!");
        onClose();
      } else {
        Alert.alert("Error", result.message || "Action failed.");
      }
    } catch (error) {
      Alert.alert("Error", "Connection lost.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NEW DELETE LOGIC ---
  const handleDelete = () => {
    Alert.alert(
      "Are you sure?", 
      "Do you really want to delete your gig? This cannot be undone.",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              const user = getAuth().currentUser;
              if (!user) return;
              const token = await user.getIdToken();
              const result = await deleteMyGig(token);
              
              if (result.success) {
                Alert.alert("Deleted", "Your gig has been removed.");
                onClose(); // This will refresh the main screen list
              } else {
                Alert.alert("Error", result.message);
              }
            } catch (e) {
              Alert.alert("Error", "Failed to delete gig.");
            }
          }
        }
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-t-3xl p-6 h-[85%]">
              <Text className="text-2xl font-bold mb-6 text-black">{existingGig ? "Edit My Gig" : "Create Coach Gig"}</Text>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text className="font-semibold mb-1 text-gray-700">Full Name</Text>
                <TextInput className="bg-gray-100 p-4 rounded-xl mb-4 text-black" value={name} onChangeText={setName} />

                <Text className="font-semibold mb-1 text-gray-700">Location</Text>
                <TextInput className="bg-gray-100 p-4 rounded-xl mb-4 text-black" value={location} onChangeText={setLocation} />

                <Text className="font-semibold mb-1 text-gray-700">Price (USD)</Text>
                <View className="flex-row gap-2 mb-4">
                  <TextInput className="bg-gray-100 p-4 rounded-xl flex-1 text-black" keyboardType="decimal-pad" value={price} onChangeText={handlePriceChange} />
                  <View className="flex-row bg-gray-100 rounded-xl p-1">
                    {(['Monthly', 'Yearly'] as const).map((cycle) => (
                        <TouchableOpacity key={cycle} onPress={() => setBillingCycle(cycle)} className={`px-4 py-3 rounded-lg ${billingCycle === cycle ? 'bg-accent-yellow' : ''}`}>
                          <Text className="font-bold">{cycle}</Text>
                        </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <Text className="font-semibold mb-1 text-gray-700">Phone Number</Text>
                <TextInput className="bg-gray-100 p-4 rounded-xl mb-4 text-black" value={phone} onChangeText={handlePhoneChange} />

                <Text className="font-semibold mb-1 text-gray-700">Email Address</Text>
                <TextInput className="bg-gray-100 p-4 rounded-xl mb-4 text-black" value={email} onChangeText={setEmail} />

                <Text className="font-semibold mb-3 text-gray-700">Sport</Text>
                <View className="flex-row gap-2 mb-16">
                  {['Cricket', 'Badminton'].map((s) => (
                    <TouchableOpacity key={s} onPress={() => setSport(s as any)} className={`px-6 py-2 rounded-full ${sport === s ? 'bg-accent-yellow' : 'bg-gray-200'}`}>
                      <Text className={sport === s ? 'font-bold' : ''}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity 
                  disabled={!isFormValid || isSubmitting} 
                  className={`py-4 rounded-xl items-center ${isFormValid ? 'bg-accent-yellow' : 'bg-gray-300'}`}
                  onPress={handleAction}
                >
                  <Text className="font-bold text-lg text-black">{isSubmitting ? "Processing..." : (existingGig ? "Save Changes" : "Publish Gig")}</Text>
                </TouchableOpacity>

                {/* --- DELETE BUTTON --- */}
                {existingGig && (
                  <TouchableOpacity className="mt-4 py-4 rounded-xl items-center border-2 border-red-500" onPress={handleDelete}>
                    <Text className="font-bold text-lg text-red-500">Delete My Gig</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity className="mt-4 mb-10 items-center" onPress={onClose}>
                  <Text className="text-gray-400">Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CreateGigModal;