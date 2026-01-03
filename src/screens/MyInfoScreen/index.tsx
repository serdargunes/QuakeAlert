import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  KeyboardAvoidingView, // <-- 1. YENİ İMPORT
  ScrollView,           // <-- 2. YENİ İMPORT
  Platform,
  TouchableWithoutFeedback, // <-- 3. YENİ İMPORT
  Keyboard              // <-- 4. YENİ İMPORT
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

type UserInfo = {
  age: string;
  bloodType: string;
  height: string;
  weight: string;
};

const MyInfoScreen: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    age: '',
    bloodType: '',
    height: '',
    weight: '',
  });

  useEffect(() => {
    const loadUserInfo = async () => {
      const savedData = await AsyncStorage.getItem('user_info');
      if (savedData) {
        setUserInfo(JSON.parse(savedData));
      }
    };
    loadUserInfo();
  }, []);

  const handleInputChange = (field: keyof UserInfo, value: string) => {
    setUserInfo(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSaveInfo = async () => {
    try {
      await AsyncStorage.setItem('user_info', JSON.stringify(userInfo));
      Keyboard.dismiss(); // Kaydettikten sonra klavyeyi kapat
      Alert.alert('Başarılı', 'Bilgileriniz başarıyla kaydedildi.');
    } catch (error) {
      Alert.alert('Hata', 'Bilgiler kaydedilirken bir sorun oluştu.');
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Klavye açıldığında görünümü yukarı itecek sarmalayıcı */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Boş bir alana tıklandığında klavyeyi kapatmak için */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {/* Ekranın kaydırılabilir olmasını sağlayan sarmalayıcı */}
          <ScrollView contentContainerStyle={styles.innerContainer}>
            <View style={styles.content}>
              <Text style={styles.title}>Kişisel Bilgilerim</Text>
              <Text style={styles.subtitle}>
                Bu bilgiler, bir acil durum anında gönderilecek olan mesaja eklenecektir.
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder="Yaş (örn: 30)"
                placeholderTextColor="#888"
                value={userInfo.age}
                onChangeText={(text) => handleInputChange('age', text)}
                keyboardType="number-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Kan Grubu (örn: A+)"
                placeholderTextColor="#888"
                value={userInfo.bloodType}
                onChangeText={(text) => handleInputChange('bloodType', text)}
                autoCapitalize="characters"
              />
              <TextInput
                style={styles.input}
                placeholder="Boy (örn: 1.80)"
                placeholderTextColor="#888"
                value={userInfo.height}
                onChangeText={(text) => handleInputChange('height', text)}
                keyboardType="decimal-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Kilo (örn: 75)"
                placeholderTextColor="#888"
                value={userInfo.weight}
                onChangeText={(text) => handleInputChange('weight', text)}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleSaveInfo}>
                <Text style={styles.buttonText}>Bilgileri Kaydet</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    // ScrollView'ın içindeki alanı ortalamak için yeni stil
    innerContainer: {
        flexGrow: 1,
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
      marginBottom: 20,
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
      paddingTop: 20, // Buton ile inputlar arasına boşluk ekledik
    },
    button: {
      borderRadius: 12,
      paddingVertical: 15,
      width: width * 0.90,
      alignItems: 'center',
      marginVertical: 5,
      backgroundColor: '#2a3e5a',
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
});

export default MyInfoScreen;

