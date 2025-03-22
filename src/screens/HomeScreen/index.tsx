import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text, Vibration, Alert, SafeAreaView } from "react-native";
import * as Location from "expo-location";
import { Linking } from "react-native";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Accelerometer } from "expo-sensors"; // expo-sensors paketini dahil ettik

const index = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(["", "", ""]); // 3 kişiyi tutacak state
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });

  // Konum alma fonksiyonu
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Konum izni reddedildi.");
      return null;
    }

    let location = await Location.getCurrentPositionAsync({});
    return location.coords;
  };

  // WhatsApp mesajını gönderme fonksiyonu
  const sendLocationToWhatsApp = async (phoneNumber: string) => {
    const location = await getLocation();
    if (!location) {
      Alert.alert("Konum alınamadı.");
      return;
    }

    const message = `Acil Durum! Konum: https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    // WhatsApp'a mesaj gönder
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert("WhatsApp açma hatası!");
    });
  };

  // 3 kişiyi kaydetme
  const handleSaveNumbers = async () => {
    // Boş numara varsa uyarı gösterme
    if (phoneNumbers.every((num) => num === "")) {
      Alert.alert("Lütfen en az bir telefon numarası girin.");
      return;
    }
    await AsyncStorage.setItem("phoneNumbers", JSON.stringify(phoneNumbers));
    Alert.alert("Numaralar başarıyla kaydedildi!");
  };

  // Titreşim algılandığında mesaj gönderme
  const onEmergencyTriggered = async () => {
    Vibration.vibrate();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    // Girilen numaralarla mesaj gönder
    for (const phoneNumber of phoneNumbers) {
      if (phoneNumber) {
        await sendLocationToWhatsApp(phoneNumber);
      }
    }
  };

  // Accelerometer (ivmeölçer) verilerini izlemek ve düşüşü algılamak
  useEffect(() => {
    const subscription = Accelerometer.addListener(accelerometerData => {
      setAccelerometerData(accelerometerData);

      const { x, y, z } = accelerometerData;
      const acceleration = Math.sqrt(x * x + y * y + z * z); // Toplam ivme

      // Daha hassas bir eşik değeri belirledim
      const accelerationThreshold = 10; // Eşik değerini 10 olarak ayarladım
      if (acceleration > accelerationThreshold) {
        console.log("Acil durum algılandı: Düşüş veya ani hareket");
        onEmergencyTriggered();
      }
    });

    // Cleanup on component unmount
    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ padding: 20 }}>
        <Text>Telefon Numaralarını Girin (Başında + ile):</Text>
        {phoneNumbers.map((phoneNumber, index) => (
          <TextInput
            key={index}
            style={{
              borderWidth: 1,
              borderColor: "gray",
              padding: 10,
              marginVertical: 10,
              fontSize: 16,
              backgroundColor: 'white'
            }}
            placeholder={`Örn: +905xxxxxxxxx (Kişi ${index + 1})`}
            value={phoneNumber}
            onChangeText={(text) => {
              const newPhoneNumbers = [...phoneNumbers];
              newPhoneNumbers[index] = text;
              setPhoneNumbers(newPhoneNumbers);
            }}
            keyboardType="phone-pad"
          />
        ))}
        <Button title="Numaraları Kaydet" onPress={handleSaveNumbers} />
        <Button title="Acil Durum Tetikle" onPress={onEmergencyTriggered} />
        <Text>Serdar GÜneş</Text>
      </View>
    </SafeAreaView>
  );
};

export default index;
