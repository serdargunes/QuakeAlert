

import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';

import { triggerSmsFlow } from './src/services/smsService';

import HomeScreen from './src/screens/HomeScreen';
import SosScreen from './src/screens/SosScreen';
import EarthquakeScreen from './src/screens/EarthquakeScreen';
import MyInfoScreen from './src/screens/MyInfoScreen';
import WeatherScreen from './src/screens/WeatherScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,


    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const Stack = createStackNavigator();

export default function App() {
  const processedLastResponse = useRef(false);

  useEffect(() => {
    console.log('--- App.tsx useEffect BAŞLADI ---');

    const setupNotifications = async () => {

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
        });
      }


      await Notifications.requestPermissionsAsync();


      await Notifications.setNotificationCategoryAsync('emergency', [
        {
          identifier: 'send-sms',
          buttonTitle: 'Konumumu Gönder 🚨',
          options: { opensAppToForeground: false },
        },
        {
          identifier: 'im-ok',
          buttonTitle: 'İyiyim 👍',
          options: { isDestructive: true, opensAppToForeground: false },
        },
      ]);
    };

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        if (response.actionIdentifier === 'send-sms') {
          triggerSmsFlow();
        }
      });

    const checkLastResponse = async () => {
      if (processedLastResponse.current) return;

      const lastResponse = await Notifications.getLastNotificationResponseAsync();

      console.log(
        '--- Son bildirim yanıtı (lastResponse):',
        JSON.stringify(lastResponse, null, 2)
      );

      if (lastResponse?.actionIdentifier === 'send-sms') {
        processedLastResponse.current = true;
        triggerSmsFlow();
      }
    };

    setupNotifications();
    checkLastResponse();

    return () => {
      responseListener.remove();
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false, title: 'Ana Sayfa' }}
        />

        <Stack.Screen
          name="SosScreen"
          component={SosScreen}
          options={{ headerShown: false, title: 'Acil Durum' }}
        />

        <Stack.Screen
          name="EarthquakeScreen"
          component={EarthquakeScreen}
          options={{title: 'Anlık Depremler' }}
        />

        <Stack.Screen
          name="MyInfoScreen"
          component={MyInfoScreen}
          options={{headerShown:false, title: 'Bilgilerim' }}
        />

        <Stack.Screen
          name="WeatherScreen"
          component={WeatherScreen}
          options={{headerShown:false, title: 'Hava Durumu' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
