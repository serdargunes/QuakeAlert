import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Animated } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';

// Veri modelimiz
type EarthquakeData = {
  id: string;
  Date: string;
  Time: string;
  Latitude: number;
  Longitude: number;
  Depth: number;
  Magnitude: number;
  Location: string;
};

const EarthquakeScreen: React.FC = () => {
  const [earthquakes, setEarthquakes] = useState<EarthquakeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showWarning, setShowWarning] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchEarthquakeData = async () => {
      try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const formatDate = (date: Date) => date.toISOString().split('T')[0];
        const todayStr = formatDate(today);
        const yesterdayStr = formatDate(yesterday);

        const [todayResponse, yesterdayResponse] = await Promise.all([
          fetch(`https://api.orhanaydogdu.com.tr/deprem/kandilli/archive?date=${todayStr}`),
          fetch(`https://api.orhanaydogdu.com.tr/deprem/kandilli/archive?date=${yesterdayStr}`)
        ]);

        const todayData = await todayResponse.json();
        const yesterdayData = await yesterdayResponse.json();
        
        let combinedResults = [];
        if (todayData && todayData.result && Array.isArray(todayData.result)) {
          combinedResults.push(...todayData.result);
        }
        if (yesterdayData && yesterdayData.result && Array.isArray(yesterdayData.result)) {
          combinedResults.push(...yesterdayData.result);
        }

        if (combinedResults.length > 0) {
          const filteredEarthquakes = combinedResults.filter((dep: any) => dep.mag >= 2.5);

          const parsedData: EarthquakeData[] = filteredEarthquakes
            .map((dep: any) => {
              if (!dep.geojson?.coordinates || !dep.earthquake_id) {
                return null;
              }
              const datetime = dep.date.split(' ');
              return {
                id: dep.earthquake_id,
                Date: datetime[0],
                Time: datetime[1],
                Latitude: dep.geojson.coordinates[1],
                Longitude: dep.geojson.coordinates[0],
                Depth: dep.depth,
                Magnitude: dep.mag,
                Location: dep.title,
              };
            })
            .filter((eq): eq is EarthquakeData => eq !== null);
            
          setEarthquakes(parsedData);
        }
      } catch (error) {
        console.error("Deprem verisi alınamadı: ", error);
      } finally {
        setLoading(false);
        setShowWarning(true);
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        setTimeout(() => {
          Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => setShowWarning(false));
        }, 10000);
      }
    };

    fetchEarthquakeData();
  }, [fadeAnim]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2a3e5a" />
      </View>
    );
  }

  return (
    <View style={styles.fullScreenContainer}>
      {/* MapView'dan "provider" prop'u kaldırıldı */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 39.0,
          longitude: 35.0,
          latitudeDelta: 15,
          longitudeDelta: 15,
        }}
      >
        {earthquakes.map((eq) => (
          <React.Fragment key={eq.id}>
            <Marker
              coordinate={{ latitude: eq.Latitude, longitude: eq.Longitude }}
              title={`${eq.Location} (${eq.Magnitude})`}
              description={`Tarih: ${eq.Date} Saat: ${eq.Time}`}
              pinColor="red"
            />
            <Circle
              center={{ latitude: eq.Latitude, longitude: eq.Longitude }}
              radius={eq.Magnitude * 8000}
              strokeColor="rgba(255, 0, 0, 0.5)"
              fillColor="rgba(255, 0, 0, 0.1)"
            />
          </React.Fragment>
        ))}
      </MapView>

      {showWarning && (
        <Animated.View style={[styles.warningContainer, { opacity: fadeAnim }]}>
          <Text style={styles.warningText}>
            Sadece 2.5 ve üzeri büyüklükteki son 48 saatin depremleri gösterilmektedir.
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  map: { 
    ...StyleSheet.absoluteFillObject,
  },
  loader: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  warningContainer: {
    position: 'absolute',
    top: 50,
    left: '5%',
    right: '5%',
    width: '90%',
    backgroundColor: 'rgba(42, 62, 90, 0.9)',
    borderRadius: 8,
    padding: 12,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  warningText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default EarthquakeScreen;
