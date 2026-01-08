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
  KeyboardAvoidingView,
  ScrollView,           
  Platform,
  TouchableWithoutFeedback, 
  Keyboard              
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
      Keyboard.dismiss();
      Alert.alert('Başarılı', 'Bilgileriniz başarıyla kaydedildi.');
    } catch (error) {
      Alert.alert('Hata', 'Bilgiler kaydedilirken bir sorun oluştu.');
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
  
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
   
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
    backgroundColor: '#DDE3EC', 
  },

  innerContainer: {
    flexGrow: 1,
    justifyContent: 'center', 
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },


  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
    marginTop: 10,


    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },


    elevation: 4,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.2,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 13.5,
    lineHeight: 19,
    color: '#64748B',
    marginBottom: 18,
  },

  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,

    paddingVertical: 14,
    paddingHorizontal: 14,

    fontSize: 16,
    color: '#0F172A',

    marginVertical: 9,
  },

  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 28,
  },

  button: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#23395D',

    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});


export default MyInfoScreen;

