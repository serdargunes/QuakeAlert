// src/Navigation.ts

import { createStackNavigator } from '@react-navigation/stack';

// Uygulamanızdaki tüm ekranları ve alacakları parametreleri tanımlıyoruz.
export type RootStackParamList = {
  Home: undefined; // Home ekranı parametre almıyor
  SosScreen: undefined; // SosScreen ekranı parametre almıyor
  EarthquakeScreen: undefined; // EarthquakeScreen parametre almıyor
  MapScreen: { latitude: number; longitude: number }; // MapScreen latitude ve longitude alıyor
  WeatherScreen: undefined;
};

export const Stack = createStackNavigator<RootStackParamList>();