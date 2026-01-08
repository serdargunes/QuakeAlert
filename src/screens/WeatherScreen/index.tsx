import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

type WeatherLook = {
  gradient: readonly [string, string, ...string[]];
  accent: string;
  tint: 'light' | 'dark';
};

type WeatherData = {
  location: string;
  temp: number;
  description: string;
  iconUrl: string;
  feelslike: number;
  wind_kph: number;
  humidity: number;
  hourly: HourlyForecast[];
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

const getWeatherLook = (iconUrl?: string): WeatherLook => {
  if (!iconUrl) {
    return { gradient: ['#0B1220', '#172A4A', '#0B1220'], accent: '#8FB7FF', tint: 'dark' };
  }

  const lower = iconUrl.toLowerCase();
  const isNight = lower.includes('night');
  const isRain = lower.includes('rain') || lower.includes('drizzle') || lower.includes('storm');
  const isSnow = lower.includes('snow') || lower.includes('sleet') || lower.includes('ice');
  const isCloud =
    lower.includes('cloud') || lower.includes('overcast') || lower.includes('mist') || lower.includes('fog');

  if (isNight) {
    if (isSnow) return { gradient: ['#070B14', '#1A2B3F', '#070B14'], accent: '#B7D3FF', tint: 'dark' };
    if (isRain) return { gradient: ['#070A12', '#17233A', '#070A12'], accent: '#8FB7FF', tint: 'dark' };
    return { gradient: ['#050814', '#162B4D', '#050814'], accent: '#9CC2FF', tint: 'dark' };
  }


  if (isSnow) return { gradient: ['#1A2B3F', '#2E4B7B', '#1A2B3F'], accent: '#B7D3FF', tint: 'dark' };
  if (isRain) return { gradient: ['#0B244A', '#2A5EA8', '#0B244A'], accent: '#8FB7FF', tint: 'dark' };
  if (isCloud) return { gradient: ['#0C2042', '#2C66B6', '#0C2042'], accent: '#A9C7FF', tint: 'dark' };

  return { gradient: ['#0C1F3E', '#2C72D8', '#0C1F3E'], accent: '#A9C7FF', tint: 'dark' };
};

const GlassCard: React.FC<{
  children: React.ReactNode;
  style?: any;
  intensity?: number;
}> = ({ children, style, intensity = 22 }) => {
  return (
    <BlurView intensity={intensity} tint="dark" style={[styles.glass, style]}>
      <View style={styles.glassInner}>{children}</View>
    </BlurView>
  );
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
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${query}&days=7&aqi=no&alerts=no&lang=tr`
      );
      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data?.error?.message || 'Veri alınamadı.');
        setLoading(false);
        return;
      }

      
      const now = new Date();
      const hourlyForecasts: HourlyForecast[] = data.forecast.forecastday
        .flatMap((d: any) => d.hour)
        .filter((hour: any) => new Date(hour.time_epoch * 1000) > now)
        .slice(0, 24)
        .map((hour: any) => ({
          time: new Date(hour.time_epoch * 1000).toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          temp: hour.temp_c,
          iconUrl: `https:${hour.condition.icon}`,
        }));

    
      const dailyForecasts: DailyForecast[] = data.forecast.forecastday.slice(0, 7).map((day: any) => ({
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
        hourly: hourlyForecasts,
        daily: dailyForecasts,
      });
    } catch (error) {
      setErrorMsg('Bir hata oluştu. İnternet bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  }, []);

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

  const look = useMemo(() => getWeatherLook(weatherData?.iconUrl), [weatherData?.iconUrl]);

  if (loading && !weatherData) {
    return (
      <LinearGradient colors={look.gradient} style={styles.full}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={look.gradient} style={styles.full}>
      {Platform.OS === 'ios' && <StatusBar barStyle="light-content" />}

      <SafeAreaView style={styles.safe}>
   
        <View pointerEvents="none" style={styles.bgLayer}>
          <View style={[styles.halo, styles.haloTop]} />
          <View style={[styles.halo, styles.haloMid]} />
          <View style={[styles.halo, styles.haloBottom]} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
     
          <GlassCard style={styles.searchWrap} intensity={18}>
            <MaterialCommunityIcons name="map-marker-outline" size={18} color="rgba(255,255,255,0.8)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Şehir ara..."
              placeholderTextColor="rgba(255,255,255,0.55)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
              <MaterialCommunityIcons name="magnify" size={20} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
          </GlassCard>

          {errorMsg ? (
            <GlassCard style={styles.errorCard} intensity={22}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </GlassCard>
          ) : weatherData ? (
            <>
              <View style={styles.hero}>
                <Text style={styles.city}>{weatherData.location}</Text>
                <Text style={styles.desc}>{weatherData.description}</Text>

                <View style={styles.iconWrap}>
                  <Image
                    source={{ uri: weatherData.iconUrl.replace('64x64', '128x128') }}
                    style={styles.bigIcon}
                  />
                  <View style={styles.iconShadow} />
                </View>

                <Text style={styles.temp}>{Math.round(weatherData.temp)}°</Text>
                <Text style={styles.feels}>Hissedilen: {Math.round(weatherData.feelslike)}°</Text>

                <View style={styles.chipsRow}>
                  <GlassCard style={styles.chip} intensity={18}>
                    <MaterialCommunityIcons name="weather-windy" size={16} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.chipText}>{Math.round(weatherData.wind_kph)} km/s</Text>
                  </GlassCard>
                  <GlassCard style={styles.chip} intensity={18}>
                    <MaterialCommunityIcons name="water-outline" size={16} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.chipText}>%{weatherData.humidity}</Text>
                  </GlassCard>
                </View>
              </View>

              <View style={styles.sheetOuter}>
                <BlurView intensity={28} tint="dark" style={styles.sheet}>
                  <View style={styles.handle} />

                  <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons name="calendar-clock-outline" size={16} color="rgba(255,255,255,0.85)" />
                    <Text style={styles.sectionTitle}>Forecast</Text>
                  </View>

          
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourRow}>
                    {weatherData.hourly.map((hour, idx) => {
                      const selected = idx === 1;
                      return (
                        <BlurView
                          key={idx}
                          intensity={selected ? 34 : 20}
                          tint="dark"
                          style={[styles.hourCard, selected && styles.hourCardSelected]}
                        >
                          <Text style={[styles.hourTime, selected && styles.hourTimeSelected]}>{hour.time}</Text>
                          <Image source={{ uri: hour.iconUrl }} style={styles.hourIcon} />
                          <Text style={[styles.hourTemp, selected && styles.hourTempSelected]}>
                            {Math.round(hour.temp)}°
                          </Text>
                        </BlurView>
                      );
                    })}
                  </ScrollView>

                  <View style={[styles.sectionHeader, { marginTop: 14 }]}>
                    <MaterialCommunityIcons name="calendar-week-outline" size={16} color="rgba(255,255,255,0.85)" />
                    <Text style={styles.sectionTitle}>DAY / WEEK</Text>
                  </View>

           
                  <View style={styles.dailyList}>
                    {weatherData.daily.map((day, index) => (
                      <View key={index} style={styles.dailyRow}>
                        <Text style={styles.dayLabel}>{index === 0 ? 'Bugün' : day.date}</Text>

                        <View style={styles.dayMid}>
                          <Image source={{ uri: day.iconUrl }} style={styles.dayIcon} />
                        </View>

                        <View style={styles.dayTemps}>
                          <Text style={styles.dayMax}>{Math.round(day.maxtemp)}°</Text>
                          <Text style={styles.dayMin}>{Math.round(day.mintemp)}°</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </BlurView>
              </View>
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  full: { flex: 1 },
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },


  scroll: {
    paddingTop: Platform.OS === 'ios' ? 18 : (StatusBar.currentHeight ?? 18),
    paddingHorizontal: 16,
    paddingBottom: 24,
    minHeight: height,
  },

  bgLayer: { ...StyleSheet.absoluteFillObject },
  halo: {
    position: 'absolute',
    width: width * 1.3,
    height: width * 1.3,
    borderRadius: 999,
    backgroundColor: 'rgba(120, 160, 255, 0.14)',
  },
  haloTop: {
    top: -width * 0.6,
    left: -width * 0.25,
    backgroundColor: 'rgba(140, 190, 255, 0.18)',
  },
  haloMid: {
    top: height * 0.18,
    right: -width * 0.55,
    backgroundColor: 'rgba(80, 130, 255, 0.14)',
  },
  haloBottom: {
    bottom: -width * 0.7,
    left: -width * 0.25,
    backgroundColor: 'rgba(80, 110, 220, 0.20)',
  },

  glass: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  glassInner: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },


  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,

    width: '100%',
    alignSelf: 'stretch',
    marginTop: 10, 
  },
  searchInput: {
    flex: 1,
    height: 26,
    color: 'rgba(255,255,255,0.92)',
    fontSize: 14.5,
  },
  searchBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  errorCard: { marginTop: 12 },
  errorText: { color: 'rgba(255,255,255,0.92)', textAlign: 'center', fontSize: 14 },

  hero: { alignItems: 'center', paddingTop: 10, paddingBottom: 8 },
  city: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginTop: 4,
  },
  desc: { color: 'rgba(255,255,255,0.68)', fontSize: 13, marginTop: 3, textTransform: 'capitalize' },

  iconWrap: { marginTop: 16, marginBottom: 6, width: 170, height: 170, alignItems: 'center', justifyContent: 'center' },
  bigIcon: { width: 160, height: 160, transform: [{ scale: 1.05 }] },
  iconShadow: {
    position: 'absolute',
    bottom: 24,
    width: 120,
    height: 26,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.35)',
    transform: [{ scaleX: 1.05 }],
  },

  temp: { color: 'rgba(255,255,255,0.95)', fontSize: 84, fontWeight: '200', letterSpacing: -3.5, marginTop: -6 },
  feels: { color: 'rgba(255,255,255,0.66)', fontSize: 13.5, marginTop: 2 },

  chipsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14 },
  chipText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '500' },

  sheetOuter: { marginTop: 14, paddingBottom: 14 },
  sheet: {
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: 14,
  },
  handle: { alignSelf: 'center', width: 54, height: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 10 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2, marginBottom: 10 },
  sectionTitle: { color: 'rgba(255,255,255,0.75)', fontSize: 12.5, fontWeight: '700', letterSpacing: 1.3 },

  hourRow: { paddingRight: 6, gap: 10 },
  hourCard: {
    width: 78,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  hourCardSelected: { borderColor: 'rgba(255,255,255,0.20)', backgroundColor: 'rgba(255,255,255,0.10)', transform: [{ translateY: -2 }] },
  hourTime: { color: 'rgba(255,255,255,0.62)', fontSize: 11.5, fontWeight: '600', marginBottom: 8 },
  hourTimeSelected: { color: 'rgba(255,255,255,0.88)' },
  hourIcon: { width: 34, height: 34 },
  hourTemp: { color: 'rgba(255,255,255,0.75)', fontSize: 15, fontWeight: '700', marginTop: 8 },
  hourTempSelected: { color: 'rgba(255,255,255,0.95)' },

  dailyList: {
    marginTop: 2,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  dailyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12 },
  dayLabel: { flex: 1, color: 'rgba(255,255,255,0.86)', fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  dayMid: { width: 54, alignItems: 'center', justifyContent: 'center' },
  dayIcon: { width: 34, height: 34 },
  dayTemps: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  dayMax: { color: 'rgba(255,255,255,0.92)', fontSize: 14, fontWeight: '700' },
  dayMin: { color: 'rgba(255,255,255,0.58)', fontSize: 14, fontWeight: '600' },
});

export default WeatherScreen;
