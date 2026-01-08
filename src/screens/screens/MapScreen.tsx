import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigation'; 

type MapScreenRouteProp = RouteProp<RootStackParamList, 'MapScreen'>;

interface MapScreenProps {
  route: MapScreenRouteProp;
}

const MapScreen: React.FC<MapScreenProps> = ({ route }) => {
  const { latitude, longitude } = route.params;

  return (
    <View style={styles.container}>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        <Marker coordinate={{ latitude, longitude }} title="Deprem Konumu" />
        <Circle
          center={{ latitude, longitude }}
          radius={2000}
          strokeColor="rgba(255,0,0,0.8)"
          fillColor="rgba(255,0,0,0.2)"
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
});

export default MapScreen;
