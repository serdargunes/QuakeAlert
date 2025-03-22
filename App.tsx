import React from 'react'
import { View,Text, ScrollView,StatusBar } from 'react-native'
import HomeScreen from './src/screens/HomeScreen'
import SosScreen from './src/screens/SosScreen'
import EarthquakeScreen from './src/screens/EarthquakeScreen/index'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'





function App() {
  const Stack = createStackNavigator();
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" />
      <Stack.Navigator>
        <Stack.Screen name = "Home" component={HomeScreen}
        options={{
          headerTintColor:'white',
          headerStyle:{
            backgroundColor:'#2a3e5a'
            
          }
        }}
        />
        <Stack.Screen name = "SosScreen" component={SosScreen} />
        <Stack.Screen name = "EarthquakeScreen" component={EarthquakeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  
  )
}

export default App;