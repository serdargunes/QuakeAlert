

import * as Location from "expo-location";
import * as SMS from "expo-sms";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export const sendLocationViaSMS = async (numbers: string[]) => {
  console.log("sendLocationViaSMS fonksiyonu başlatıldı.");
  try {
    console.log("Konum izni isteniyor...");
    let { status } = await Location.requestForegroundPermissionsAsync();
    console.log("Konum izni durumu:", status);
    
    if (status !== "granted") {
      Alert.alert("İzin Gerekli", "Konum gönderebilmek için konum izni vermeniz gerekmektedir.");
      return;
    }
    
    console.log("Cihazın mevcut konumu alınıyor...");
    const location = await Location.getCurrentPositionAsync({});
    if (!location?.coords) {
      console.error("HATA: Konum bilgisi alınamadı.");
      return;
    }

    const savedInfoRaw = await AsyncStorage.getItem('user_info');
    const savedInfo = savedInfoRaw 
      ? JSON.parse(savedInfoRaw) 
      : { age: 'Belirtilmedi', bloodType: 'Belirtilmedi', height: 'Belirtilmedi', weight: 'Belirtilmedi' };

    const { latitude, longitude } = location.coords;
    const mapLink = `http://googleusercontent.com/maps/google.com/1{latitude},${longitude}`;

    const message = `ACİL DURUM! Yardıma ihtiyacım var.\nKonumum: ${mapLink}\n\n` +
                    `--- Tıbbi Bilgiler ---\n` +
                    `Yaş: ${savedInfo.age || 'Belirtilmedi'}\n` +
                    `Kan Grubu: ${savedInfo.bloodType || 'Belirtilmedi'}\n` +
                    `Boy: ${savedInfo.height || 'Belirtilmedi'}m\n` +
                    `Kilo: ${savedInfo.weight || 'Belirtilmedi'}kg`;

    const isAvailable = await SMS.isAvailableAsync();
    console.log("Cihaz SMS gönderebilir mi?:", isAvailable);
    
    if (isAvailable) {
      console.log("SMS ekranı açılıyor...");
      await SMS.sendSMSAsync(numbers, message);
    } else {
      Alert.alert("SMS Gönderilemiyor", "Cihazınızda SMS özelliği bulunmuyor veya aktif değil.");
    }
  } catch (error) {
    console.error("sendLocationViaSMS içinde bir hata oluştu:", error);
  }
};

export const triggerSmsFlow = async () => {
  console.log("--- triggerSmsFlow (Global) BAŞLADI ---");
  try {
    const savedNumbers = await AsyncStorage.getItem("phoneNumbers");
    const numbersToSend = savedNumbers ? JSON.parse(savedNumbers).filter(String) : [];
    console.log("SMS gönderilecek geçerli numaralar:", numbersToSend);

    if (numbersToSend.length > 0) {
      await sendLocationViaSMS(numbersToSend);
    } else {
      Alert.alert("Hata", "SMS gönderilecek kayıtlı numara bulunamadı.");
    }
  } catch (error) {
    console.error("triggerSmsFlow içinde bir hata oluştu:", error);
  }
};