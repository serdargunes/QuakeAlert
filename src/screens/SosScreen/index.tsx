import React, { useState, useEffect } from "react";
import {
  View, Text, Vibration, Alert, SafeAreaView,
  StyleSheet, Dimensions, TouchableOpacity
} from "react-native";
import * as Location from "expo-location";
import { Linking } from "react-native";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Accelerometer } from "expo-sensors";
import { TextInput } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

const Index = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(["", "", ""]);
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

  // WhatsApp mesajı gönderme
  const sendLocationToWhatsApp = async (phoneNumber: string) => {
    const location = await getLocation();
    if (!location) {
      Alert.alert("Konum alınamadı.");
      return;
    }

    const message = `Acil Durum! Konum: https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert("WhatsApp açma hatası!");
    });
  };

  // Numaraları kaydetme
  const handleSaveNumbers = async () => {
    if (phoneNumbers.every((num) => num === "")) {
      Alert.alert("Lütfen en az bir telefon numarası girin.");
      return;
    }
    await AsyncStorage.setItem("phoneNumbers", JSON.stringify(phoneNumbers));
    Alert.alert("Numaralar başarıyla kaydedildi!");
  };

  // Acil durum tetikleme
  const onEmergencyTriggered = async () => {
    Vibration.vibrate();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    for (const phoneNumber of phoneNumbers) {
      if (phoneNumber) {
        await sendLocationToWhatsApp(phoneNumber);
      }
    }
  };

  // İvmeölçer ile düşüş algılama
  useEffect(() => {
    const subscription = Accelerometer.addListener(accelerometerData => {
      setAccelerometerData(accelerometerData);

      const { x, y, z } = accelerometerData;
      const acceleration = Math.sqrt(x * x + y * y + z * z);

      const accelerationThreshold = 10;
      if (acceleration > accelerationThreshold) {
        console.log("Acil durum algılandı: Düşüş veya ani hareket");
        onEmergencyTriggered();
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.alertbox}>
      <MaterialCommunityIcons name="alert" size={200} color="#F06292" />
      <View style = {{flexWrap:'wrap',}}>
      <Text>-Numaraları Olabildiğince Başka Şehirlerden Seçiniz.</Text>
      <Text>-Acil Durum Haricinde Tetikle Butonunu Kullanmayınız.</Text>
      </View>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <Text style={styles.title}>Telefon Numaralarını Girin (Başında + ile):</Text>
        {phoneNumbers.map((phoneNumber, index) => (
          <TextInput
            mode="flat"
            key={index}
            secureTextEntry
            style={styles.input}
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
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleSaveNumbers}>
          <Text style={styles.buttonText}>Numaraları Kaydet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onEmergencyTriggered}>
          <Text style={styles.buttonText}>Acil Durum Tetikle</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  alertbox:{
    width:width*0.90,
    marginLeft:20,
    marginTop:20,
    borderRadius:8,
    shadowOffset: { width: 0, height: 4 },
    shadowColor:'black',
    shadowOpacity:0.5,
    backgroundColor:'white',
    height: 270, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 30,
  },
  input: {
    borderWidth: 2,
    borderColor: "#B0B0B0",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginVertical: 8,
    fontSize: 16,
    fontWeight: "400",
    backgroundColor: "#FFFFFF",
    color: "#333333",
    width: width * 0.90,
    height: height * 0.04,


  },
  buttonContainer: {
    width: '100%',
    paddingBottom: 20,
    alignItems: 'center',
  },
  button: {
    borderRadius: 50,
    backgroundColor: 'black',
    width: width * 0.9,
    height: height * 0.08,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
});

export default Index;
