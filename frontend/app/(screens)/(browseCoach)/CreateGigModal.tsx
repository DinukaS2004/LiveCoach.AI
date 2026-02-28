import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, Alert, TouchableWithoutFeedback } from 'react-native';
import { publishGig } from '../../../services/gigService';
import { getAuth } from 'firebase/auth';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const CreateGigModal = ({ visible, onClose }: Props) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [sport, setSport] = useState<'Cricket' | 'Badminton'>('Cricket');
  const [location, setLocation] = useState('');

  // --- Professional Input Handlers ---

  // Sanitizes Price: Allows only numbers and one decimal point
  const handlePriceChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return; // Prevent multiple decimal points
    setPrice(cleaned);
  };

  // Sanitizes Phone: Allows only numbers and the + symbol
  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9+]/g, '');
    setPhone(cleaned);
  };

  // Logic to determine if the form is complete and valid
  const isFormValid = 
    name.trim().length >= 2 && 
    location.trim().length >= 2 && 
    price.length > 0 && 
    !isNaN(parseFloat(price)) &&
    email.includes('@');

  const handlePublish = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Error", "You must be logged in to post a gig.");
        return;
      }

      const token = await user.getIdToken();
      const numericPrice = parseFloat(price);

      const gigData = { 
        name: name.trim(), 
        location: location.trim(), 
        price: numericPrice, 
        billingCycle, 
        phone: phone.trim(), 
        email: email.trim().toLowerCase(), 
        sport 
      };

      const result = await publishGig(gigData, token);

      if (result.success) {
        Alert.alert("Success", "Gig published under your account!");
        // Reset form for next time
        setName('');
        setPrice('');
        setPhone('');
        setEmail('');
        onClose();
      } else {
        Alert.alert("Error", result.message || "Failed to save gig.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to authenticate or connection lost.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-t-3xl p-6 h-[85%]">
              <Text className="text-2xl font-bold mb-6 text-black">Create Coach Gig</Text>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* NAME INPUT */}
                <Text className="font-semibold mb-1 text-gray-700">Full Name</Text>
                <TextInput 
                  className="bg-gray-100 p-4 rounded-xl mb-4 text-black"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChangeText={setName}
                />

                {/* LOCATION INPUT */}
                <Text className="font-semibold mb-1 text-gray-700">Location</Text>
                <TextInput
                  className="bg-gray-100 p-4 rounded-xl mb-4 text-black"
                  placeholder="e.g. Colombo"
                  value={location}
                  onChangeText={setLocation}
                />

                {/* PRICE & BILLING CYCLE */}
                <Text className="font-semibold mb-1 text-gray-700">Price (USD)</Text>
                <View className="flex-row gap-2 mb-4">
                  <TextInput
                    className="bg-gray-100 p-4 rounded-xl flex-1 text-black"
                    placeholder="0.00"
                    keyboardType="decimal-pad" // Pro: Shows numeric/decimal keyboard
                    value={price}
                    onChangeText={handlePriceChange} // Pro: Blocks letters
                  />

                  <View className="flex-row bg-gray-100 rounded-xl p-1 overflow-hidden">
                    {(['Monthly', 'Yearly'] as const).map((cycle) => {
                      const active = billingCycle === cycle;
                      return (
                        <TouchableOpacity
                          key={cycle}
                          onPress={() => setBillingCycle(cycle)}
                          className={`px-4 py-3 rounded-lg justify-center ${active ? 'bg-accent-yellow' : 'bg-transparent'}`}
                          activeOpacity={0.8}
                        >
                          <Text className={`${active ? 'font-bold text-black' : 'text-gray-500'}`}>
                            {cycle}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* CONTACT INFO */}
                <Text className="font-semibold mb-1 text-gray-700">Phone Number</Text>
                <TextInput 
                  className="bg-gray-100 p-4 rounded-xl mb-4 text-black"
                  placeholder="+94 77 123 4567"
                  keyboardType="phone-pad" // Pro: Shows phone keyboard
                  value={phone}
                  onChangeText={handlePhoneChange} // Pro: Blocks letters
                />

                <Text className="font-semibold mb-1 text-gray-700">Email Address</Text>
                <TextInput 
                  className="bg-gray-100 p-4 rounded-xl mb-4 text-black"
                  placeholder="coach@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />

                <Text className="font-semibold mb-3 text-gray-700">Select Sport</Text>
                <View className="flex-row gap-2 mb-16">
                  {['Cricket', 'Badminton'].map((s) => (
                    <TouchableOpacity 
                      key={s}
                      onPress={() => setSport(s as any)}
                      className={`px-6 py-2 rounded-full ${sport === s ? 'bg-accent-yellow' : 'bg-gray-200'}`}
                    >
                      <Text className={sport === s ? 'font-bold' : ''}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* SUBMIT BUTTON */}
                <TouchableOpacity 
                  disabled={!isFormValid} // Pro: Prevents clicking until valid
                  className={`py-4 rounded-xl items-center ${isFormValid ? 'bg-accent-yellow' : 'bg-gray-300'}`}
                  onPress={handlePublish}
                >
                  <Text className={`font-bold text-lg ${isFormValid ? 'text-black' : 'text-gray-500'}`}>
                    Publish Gig
                  </Text>
                </TouchableOpacity>

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