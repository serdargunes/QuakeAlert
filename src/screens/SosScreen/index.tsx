import React, { useState, useEffect } from "react";
import {
  View, Text, Vibration, Alert, SafeAreaView,
  StyleSheet, Dimensions, TouchableOpacity, TextInput,
  Platform // Platform'u import ettik
} from "react-native";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Accelerometer } from "expo-sensors";
import * as SMS from "expo-sms";

const { width } = Dimensions.get('window');

const SosScreen: React.FC = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(["", "", ""]);
  const [isAccelerometerActive, setIsAccelerometerActive] = useState(false);

  // Kayıtlı numaraları yükle
  useEffect(() => {
    const loadNumbers = async () => {
      const saved = await AsyncStorage.getItem("phoneNumbers");
      if (saved) setPhoneNumbers(JSON.parse(saved));
    };
    loadNumbers();
  }, []);

  // Düşme algılama için Accelerometer
  useEffect(() => {
    let subscription: any;
    if (isAccelerometerActive) {
      subscription = Accelerometer.addListener(accelerometerData => {
        const { x, y, z } = accelerometerData;
        const totalAcceleration = Math.sqrt(x * x + y * y + z * z);
        const accelerationThreshold = 2.5; // Düşme hassasiyeti (ayarlanabilir)
        if (totalAcceleration > accelerationThreshold) {
          onEmergencyTriggered();
        }
      });
      Accelerometer.setUpdateInterval(500); // Yarım saniyede bir kontrol et
    }
    return () => {
      subscription && subscription.remove();
    };
  }, [isAccelerometerActive]);

  // Numaraları kaydetme
  const handleSaveNumbers = async () => {
    const validNumbers = phoneNumbers.filter(num => num.trim() !== "");
    if (validNumbers.length === 0) {
      Alert.alert("Hata", "Lütfen en az bir geçerli telefon numarası girin.");
      return;
    }
    await AsyncStorage.setItem("phoneNumbers", JSON.stringify(phoneNumbers));
    Alert.alert("Başarılı", "Numaralar kaydedildi.");
    setIsAccelerometerActive(true); // Numaralar kaydedilince düşme algılamayı başlat
  };

  // Konum alma
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("İzin Gerekli", "Acil durum mesajı gönderebilmek için konum izni vermeniz gerekmektedir.");
      return null;
    }
    return await Location.getCurrentPositionAsync({});
  };

  // SMS ile konum gönderme (Platforma özel mantık)
  const sendLocationViaSMS = async (numbers: string[]) => {
    const location = await getLocation();
    if (!location?.coords) return;

    const { latitude, longitude } = location.coords;
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    // TODO: Bu bilgiler ileride "Bilgilerim" ekranından dinamik olarak alınacak
    const message = `ACİL DURUM! Yardıma ihtiyacım var.\nKonumum: ${mapLink}\n\n---\nKan Grubu: A+\nBoy: 1.80m\nKilo: 75kg`;

    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      const result = await SMS.sendSMSAsync(numbers, message);
      console.log("SMS gönderme sonucu:", result.result);

      // expo-sms her iki platformda da composer'ı açar.
      // Aşağıdaki loglar, hangi platformda hangi davranışın beklendiğini gösterir.
      if (Platform.OS === 'android') {
        console.log("Android: SMS uygulaması açıldı. Otomatik gönderme için 'eject' ve farklı bir kütüphane gerekir.");
      } else {
        console.log("iOS: SMS uygulaması açıldı. Kullanıcının göndere basması bekleniyor.");
      }
    } else {
      Alert.alert("SMS Gönderilemiyor", "Cihazınızda SMS özelliği bulunmuyor veya aktif değil.");
    }
  };

  // Acil durumu tetikleme
  const onEmergencyTriggered = async () => {
    Vibration.vibrate([500, 500, 500]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    const savedNumbers = await AsyncStorage.getItem("phoneNumbers");
    const numbersToSend = savedNumbers ? JSON.parse(savedNumbers).filter(String) : [];

    if (numbersToSend.length > 0) {
      sendLocationViaSMS(numbersToSend);
    } else {
      Alert.alert("Numara Kayıtlı Değil", "Lütfen acil durumda aranacak en az bir numara kaydedin.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Acil Durum Numaraları</Text>
        <Text style={styles.subtitle}>
          Acil bir durumda (düşme algılandığında veya butona basıldığında) konumunuzun gönderileceği 3 telefon numarası girin.
        </Text>
        {phoneNumbers.map((_, index) => (
          <TextInput
            key={index}
            style={styles.input}
            placeholder={`Acil Durum Kişisi ${index + 1}`}
            placeholderTextColor="#888"
            value={phoneNumbers[index]}
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
        <TouchableOpacity style={[styles.button, styles.emergencyButton]} onPress={onEmergencyTriggered}>
          <Text style={styles.buttonText}>Acil Durum Tetikle</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'space-between',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginVertical: 8,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    width: width * 0.90,
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: 40,
    alignItems: 'center',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 15,
    width: width * 0.90,
    alignItems: 'center',
    marginVertical: 5,
    backgroundColor: '#2a3e5a',
  },
  emergencyButton: {
    backgroundColor: '#c0392b',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SosScreen;

