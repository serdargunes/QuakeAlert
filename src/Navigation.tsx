import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Home: undefined;
  SosScreen: undefined;
  EarthquakeScreen: undefined;
  WeatherScreen: undefined;

  MyInfoScreen: undefined; 
  MapScreen: {
    latitude: number;
    longitude: number;
  };
};


export type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MapScreen'>;
export type MapScreenRouteProp = RouteProp<RootStackParamList, 'MapScreen'>;

export type MapScreenProps = {
  navigation: MapScreenNavigationProp;
  route: MapScreenRouteProp;
};
