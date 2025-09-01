import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Image,
} from 'react-native';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Tipleri güncelledim: WeatherData'ya hourly eklendi
type WeatherData = {
  location: string;
  temp: number;
  description: string;
  iconUrl: string;
  feelslike: number;
  wind_kph: number;
  humidity: number;
  hourly: HourlyForecast[]; // EKLENDİ
  daily: DailyForecast[];
};

type HourlyForecast = {
  time: string;
  temp: number;
  iconUrl: string;
};

type DailyForecast = {
  date: string;
  maxtemp: number;
  mintemp: number;
  iconUrl: string;
};

const getWeatherLook = (iconUrl: string) => {
  const isDay = !iconUrl.includes('night');
  if (isDay) {
    return { gradient: ['#4a90e2', '#86c5f7'] };
  } else {
    return { gradient: ['#0f2027', '#203a43', '#2c5364'] };
  }
};

const WeatherScreen: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const API_KEY = '089c539173d04339b69112224252808';

  const fetchWeatherData = useCallback(async (query: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${query}&days=5&aqi=no&alerts=no&lang=tr`
      );
      const data = await response.json();

      if (response.ok) {
        // --- YENİ EKLENEN KISIM BAŞLANGICI ---
        // API'den gelen saatlik veriyi işleyelim
        const hourlyForecasts: HourlyForecast[] = data.forecast.forecastday[0].hour
          .filter((hour: any) => new Date(hour.time_epoch * 1000) > new Date()) // Sadece gelecek saatleri al
          .slice(0, 8) // Gelecek 8 saati göster
          .map((hour: any) => ({
            time: new Date(hour.time_epoch * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            temp: hour.temp_c,
            iconUrl: `https:${hour.condition.icon}`,
          }));
        // --- YENİ EKLENEN KISIM SONU ---

        const dailyForecasts: DailyForecast[] = data.forecast.forecastday.map((day: any) => ({
          date: new Date(day.date_epoch * 1000).toLocaleDateString('tr-TR', { weekday: 'long' }),
          maxtemp: day.day.maxtemp_c,
          mintemp: day.day.mintemp_c,
          iconUrl: `https:${day.day.condition.icon}`,
        }));

        setWeatherData({
          location: data.location.name,
          temp: data.current.temp_c,
          description: data.current.condition.text,
          iconUrl: `https:${data.current.condition.icon}`,
          feelslike: data.current.feelslike_c,
          wind_kph: data.current.wind_kph,
          humidity: data.current.humidity,
          hourly: hourlyForecasts, // İşlenmiş saatlik veriyi state'e ekle
          daily: dailyForecasts,
        });
      } else {
        setErrorMsg(data.error.message || 'Veri alınamadı.');
      }
    } catch (error) {
      setErrorMsg('Bir hata oluştu. İnternet bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  }, [API_KEY]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Konum izni gerekli.');
        setLoading(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      const query = `${location.coords.latitude},${location.coords.longitude}`;
      fetchWeatherData(query);
    })();
  }, [fetchWeatherData]);

  const handleSearch = () => {
    Keyboard.dismiss();
    if (searchQuery.trim()) {
      fetchWeatherData(searchQuery.trim());
    }
  };

  if (loading && !weatherData) {
    return <LinearGradient colors={['#2c3e50', '#4a69bd']} style={styles.centered}><ActivityIndicator size="large" color="#fff" /></LinearGradient>;
  }

  const background = weatherData ? getWeatherLook(weatherData.iconUrl) : getWeatherLook('');

  return (
    <LinearGradient colors={background.gradient} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Şehir adı ara..."
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
              <MaterialCommunityIcons name="magnify" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {errorMsg ? (
            <View style={styles.errorContainer}><Text style={styles.errorText}>{errorMsg}</Text></View>
          ) : weatherData ? (
            <>
              <View style={styles.currentWeatherCard}>
                <Text style={styles.currentCityText}>{weatherData.location}</Text>
                <Text style={styles.currentDescriptionText}>{weatherData.description}</Text>
                <Image source={{ uri: weatherData.iconUrl.replace('64x64', '128x128') }} style={styles.weatherIcon} />
                <Text style={styles.currentTempText}>{Math.round(weatherData.temp)}°</Text>
                <Text style={styles.feelsLikeText}>Hissedilen: {Math.round(weatherData.feelslike)}°</Text>
              </View>
              
              {/* --- YENİ EKLENEN KISIM BAŞLANGICI --- */}
              {/* SAATLİK TAHMİN KARTI */}
              <View style={styles.forecastSection}>
                <Text style={styles.sectionTitle}>Saatlik Tahmin</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {weatherData.hourly.map((hour, index) => (
                    <View key={index} style={styles.hourlyItem}>
                      <Text style={styles.hourlyTime}>{hour.time}</Text>
                      <Image source={{ uri: hour.iconUrl }} style={styles.forecastIcon} />
                      <Text style={styles.hourlyTemp}>{Math.round(hour.temp)}°</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
              {/* --- YENİ EKLENEN KISIM SONU --- */}

              <View style={styles.forecastSection}>
                <Text style={styles.sectionTitle}>5 Günlük Tahmin</Text>
                {weatherData.daily.map((day, index) => (
                  <View key={index} style={styles.dailyItem}>
                    <Text style={styles.dailyDate}>{index === 0 ? 'Bugün' : day.date}</Text>
                    <Image source={{ uri: day.iconUrl }} style={styles.forecastIcon} />
                    <View style={styles.dailyTempContainer}>
                      <Text style={styles.dailyTempMax}>{Math.round(day.maxtemp)}°</Text>
                      <Text style={styles.dailyTempMin}>{Math.round(day.mintemp)}°</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

// Stillere saatlik tahmin için gerekli olanlar eklendi
const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollViewContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 15, paddingHorizontal: 15, alignItems: 'center', marginBottom: 20 },
  searchInput: { flex: 1, color: 'white', fontSize: 16, height: 50 },
  searchButton: { padding: 5 },
  errorContainer: { padding: 20, backgroundColor: 'rgba(255, 0, 0, 0.5)', borderRadius: 10, alignItems: 'center' },
  errorText: { color: 'white', fontSize: 16, textAlign: 'center' },
  currentWeatherCard: { alignItems: 'center', marginBottom: 30 },
  currentCityText: { fontSize: 34, fontWeight: '300', color: 'white' },
  currentDescriptionText: { fontSize: 18, color: 'rgba(255, 255, 255, 0.8)', textTransform: 'capitalize', marginTop: 4 },
  weatherIcon: { width: 150, height: 150 },
  currentTempText: { fontSize: 96, fontWeight: '200', color: 'white', letterSpacing: -5 },
  feelsLikeText: { fontSize: 16, color: 'rgba(255, 255, 255, 0.8)' },
  forecastSection: { width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 15, padding: 15, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.9)', marginBottom: 10 },
  
  // YENİ EKLENEN STİLLER
  hourlyItem: {
    alignItems: 'center',
    marginRight: 15,
  },
  hourlyTime: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
  },
  hourlyTemp: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  // MEVCUT STİLLER
  dailyItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  dailyDate: { color: 'white', fontSize: 16, flex: 1 },
  forecastIcon: { width: 50, height: 50 },
  dailyTempContainer: { flexDirection: 'row', justifyContent: 'flex-end', flex: 1 },
  dailyTempMax: { color: 'white', fontSize: 16, fontWeight: '500' },
  dailyTempMin: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 16, marginLeft: 15 },
});

export default WeatherScreen;