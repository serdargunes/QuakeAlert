import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Animated, Alert } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';


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


type AfadDeprem = {
    eventID: string;
    longitude: string; 
    latitude: string;  
    magnitude: number;
    depth: number;
    location: string;
    date: string;
};


const EarthquakeScreen: React.FC = () => {
  const [earthquakes, setEarthquakes] = useState<EarthquakeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showWarning, setShowWarning] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchEarthquakeData = async () => {
      
     
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 3); 

      const formatAfadDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      const startDateStr = formatAfadDate(startDate);
      const endDateStr = formatAfadDate(endDate);

      
      const AFAD_API_URL = `https://deprem.afad.gov.tr/apiv2/event/filter?format=json&minmag=2.5&start=${encodeURIComponent(startDateStr)}&end=${encodeURIComponent(endDateStr)}`;

      try {
        console.log("AFAD API'den veri çekiliyor. URL:", AFAD_API_URL);

        const response = await fetch(AFAD_API_URL);

        if (!response.ok) {
            throw new Error(`HTTP hata kodu: ${response.status}`);
        }
        
        const rawData: AfadDeprem[] = await response.json();
        
        if (Array.isArray(rawData)) {
            
          const parsedData: EarthquakeData[] = rawData
            .map((dep: AfadDeprem) => {
              
              const datetime = dep.date.split(' '); 
              
              return {
                id: dep.eventID, 
                Date: datetime[0],
                Time: datetime[1],
                Latitude: Number(dep.latitude), 
                Longitude: Number(dep.longitude), 
                Depth: dep.depth,
                Magnitude: dep.magnitude,
                Location: dep.location,
              };
            })
            .filter(eq => !isNaN(eq.Latitude) && !isNaN(eq.Longitude)); 
            
          setEarthquakes(parsedData);
          console.log(`AFAD API'den ${parsedData.length} adet deprem verisi çekildi.`);
        } else {
            console.warn("AFAD API'den geçerli bir dizi formatında veri gelmedi.");
        }

      } catch (error) {
        console.error("Deprem verisi alınamadı. Lütfen internet bağlantınızı ve API URL'sini kontrol edin. Hata:", error);
        Alert.alert("Hata", "Deprem verileri çekilemedi. Lütfen internet bağlantınızı kontrol edin.");
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
              description={`Tarih: ${eq.Date} Saat: ${eq.Time} Derinlik: ${eq.Depth}km`}
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
            Sadece 2.5 ve üzeri büyüklükteki **son 72 saatin** depremleri gösterilmektedir.
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