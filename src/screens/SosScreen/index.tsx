// src/screens/SosScreen/index.tsx

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Vibration,
  Alert,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Accelerometer } from "expo-sensors";
import * as Notifications from "expo-notifications";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const SosScreen: React.FC = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(["", "", ""]);
  const [isAccelerometerActive, setIsAccelerometerActive] = useState(false);

  // Acil durumun tekrar tekrar tetiklenmesini önlemek için bayrak
  const isTriggeredRef = useRef(false);

  // Numaraları component açıldığında yükle
  useEffect(() => {
    const loadNumbers = async () => {
      const saved = await AsyncStorage.getItem("phoneNumbers");
      if (saved) {
        setPhoneNumbers(JSON.parse(saved));
        setIsAccelerometerActive(true);
      }
    };
    loadNumbers();
  }, []);

  // İvmeölçer dinleyicisi
  useEffect(() => {
    let subscription: any;
    if (isAccelerometerActive) {
      console.log("Düşme algılama AKTİF.");
      subscription = Accelerometer.addListener((accelerometerData) => {
        const { x, y, z } = accelerometerData;
        const totalAcceleration = Math.sqrt(x * x + y * y + z * z);
        const accelerationThreshold = 3.5;
        if (totalAcceleration > accelerationThreshold) {
          onEmergencyTriggered();
        }
      });
      Accelerometer.setUpdateInterval(500);
    } else {
      console.log("Düşme algılama PASİF.");
    }
    return () => {
      subscription && subscription.remove();
    };
  }, [isAccelerometerActive]);

  const handleSaveNumbers = async () => {
    const validNumbers = phoneNumbers.filter((num) => num.trim() !== "");
    if (validNumbers.length === 0) {
      Alert.alert("Hata", "Lütfen en az bir geçerli telefon numarası girin.");
      setIsAccelerometerActive(false);
      return;
    }
    await AsyncStorage.setItem("phoneNumbers", JSON.stringify(phoneNumbers));
    Keyboard.dismiss();
    Alert.alert("Başarılı", "Numaralar kaydedildi. Düşme algılama aktif.");
    setIsAccelerometerActive(true);
  };

  const onEmergencyTriggered = async () => {
    // Eğer acil durum son 15 saniye içinde zaten tetiklendiyse, hiçbir şey yapma
    if (isTriggeredRef.current) {
      console.log("Acil durum zaten tetiklenmiş, 15 saniye bekleniyor...");
      return;
    }

    isTriggeredRef.current = true;
    console.log("Acil durum tetiklendi, bildirim gönderiliyor...");

    Vibration.vibrate([500, 500, 500]);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    const savedNumbers = await AsyncStorage.getItem("phoneNumbers");
    if (!savedNumbers || JSON.parse(savedNumbers).filter(String).length === 0) {
      isTriggeredRef.current = false;
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🚨 ACİL DURUM ALGILANDI 🚨",
        body: 'Yardım çağırmak için "Konumumu Gönder" butonuna basın.',
        sound: "default",
        categoryIdentifier: "emergency",
      },
      trigger: null,
    });

    // 15 saniye sonra yeni tetiklemelere izin ver
    setTimeout(() => {
      console.log("Bekleme süresi doldu, yeni tetiklemelere izin veriliyor.");
      isTriggeredRef.current = false;
    }, 15000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.innerContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ÜST BAŞLIK (tekilleştirildi) */}
            <View style={styles.top}>
              <View style={styles.logoBadge}>
                <MaterialCommunityIcons
                  name="flower-tulip-outline"
                  size={28}
                  color="#2C3E2F"
                />
              </View>

             
            </View>

            {/* FORM KART */}
            <View style={styles.card}>
              {/* Kart içi başlıklar sadeleştirildi (tekrar yok) */}
              <Text style={styles.cardTitle}>Acil Durum Kişileri</Text>
              <Text style={styles.cardSub}>
                Konumunuzun gönderileceği 3 numarayı girin.
              </Text>

              {phoneNumbers.map((_, index) => (
                <View key={index} style={styles.inputWrap}>
                  <View style={styles.inputIcon}>
                    <MaterialCommunityIcons
                      name={index === 0 ? "phone-outline" : "account-outline"}
                      size={20}
                      color="#5A6B5D"
                    />
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder={`Acil Durum Kişisi ${index + 1}`}
                    placeholderTextColor="#7A877D"
                    value={phoneNumbers[index]}
                    onChangeText={(text) => {
                      const newPhoneNumbers = [...phoneNumbers];
                      newPhoneNumbers[index] = text;
                      setPhoneNumbers(newPhoneNumbers);
                    }}
                    keyboardType="phone-pad"
                  />
                </View>
              ))}

              {/* Ayırıcı */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>•</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Kaydet Butonu + açıklama */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSaveNumbers}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryButtonText}>Numaraları Kaydet</Text>
              </TouchableOpacity>
              <Text style={styles.helperText}>
                Kaydettiğinizde düşme algılama otomatik olarak aktif olur.
              </Text>

              {/* Test Butonu + açıklama */}
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={onEmergencyTriggered}
                activeOpacity={0.9}
              >
                <Text style={styles.dangerButtonText}>
                  Acil Durum Tetikle (Test)
                </Text>
              </TouchableOpacity>
              <Text style={styles.helperText}>
                Bildirim aksiyonlarını ve acil durum akışını test etmek için kullanın.
              </Text>
            </View>

            <View style={{ height: 22 }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E7EFE7",
  },

  innerContainer: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 28,
  },

  top: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 14,
  },

  logoBadge: {
    width: 58,
    height: 58,
    borderRadius: 999,
    backgroundColor: "#F6F7F3",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    marginBottom: 10,
  },

  titleTop: {
    fontSize: 22,
    fontWeight: "800",
    color: "#243126",
    letterSpacing: 0.2,
  },

  subtitleTop: {
    marginTop: 6,
    fontSize: 13,
    color: "#4C5B4F",
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 320,
  },

  card: {
    backgroundColor: "#F7F7F2",
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#223024",
    textAlign: "center",
  },

  cardSub: {
    marginTop: 8,
    fontSize: 13,
    color: "#516055",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 14,
  },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DFE6DD",
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 52,
    marginVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },

  inputIcon: {
    width: 34,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    opacity: 0.95,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#1F2A21",
    paddingVertical: 0,
  },

  dividerRow: {
    marginTop: 8,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  dividerLine: {
    height: 1,
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.10)",
  },

  dividerText: {
    color: "rgba(0,0,0,0.35)",
    fontSize: 16,
    marginTop: -2,
  },

  primaryButton: {
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6F8A6C",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  primaryButtonText: {
    color: "#F7F7F2",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  dangerButton: {
    marginTop: 12,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C1534A",
  },

  dangerButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  helperText: {
    marginTop: 8,
    marginBottom: 2,
    fontSize: 12,
    color: "rgba(0,0,0,0.52)",
    textAlign: "center",
    lineHeight: 16,
  },
});

export default SosScreen;
