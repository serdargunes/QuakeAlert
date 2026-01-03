import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Animated, Alert } from 'react-native';
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

// AFAD API'den gelen veriye uygun Tip Tanımlaması (İsteğe bağlı, ancak hata yakalamayı kolaylaştırır)
type AfadDeprem = {
    eventID: string;
    longitude: string; // AFAD API'de string olarak gelir
    latitude: string;  // AFAD API'de string olarak gelir
    magnitude: number;
    depth: number;
    location: string;
    date: string; // YYYY-MM-DD HH:MM:SS formatında gelir
};


const EarthquakeScreen: React.FC = () => {
  const [earthquakes, setEarthquakes] = useState<EarthquakeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showWarning, setShowWarning] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchEarthquakeData = async () => {
      
      // 1. ADIM: 72 Saatlik (3 Günlük) Tarih Aralığını Hesaplama
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 3); // Bugün - 3 gün = Son 72 saatten biraz fazlası

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

      // AFAD API endpoint'i: minmag=2.5 ve tarih aralığı ile tek istekte çekim
      const AFAD_API_URL = `https://deprem.afad.gov.tr/apiv2/event/filter?format=json&minmag=2.5&start=${encodeURIComponent(startDateStr)}&end=${encodeURIComponent(endDateStr)}`;

      try {
        console.log("AFAD API'den veri çekiliyor. URL:", AFAD_API_URL);

        const response = await fetch(AFAD_API_URL);

        if (!response.ok) {
            throw new Error(`HTTP hata kodu: ${response.status}`);
        }
        
        const rawData: AfadDeprem[] = await response.json();
        
        // AFAD'dan boş dizi gelmesi de bir başarıdır (o aralıkta deprem yok demektir)
        if (Array.isArray(rawData)) {
            
          // 2. ADIM: AFAD Veri Yapısını Proje Modeline Dönüştürme
          const parsedData: EarthquakeData[] = rawData
            .map((dep: AfadDeprem) => {
              
              // AFAD verisinde tarih ve saat tek bir alanda (date) gelir
              const datetime = dep.date.split(' '); 
              
              return {
                id: dep.eventID, // AFAD eventID'sini kullan
                Date: datetime[0],
                Time: datetime[1],
                // AFAD verisi string olarak geldiği için Number() ile dönüştür
                Latitude: Number(dep.latitude), 
                Longitude: Number(dep.longitude), 
                Depth: dep.depth,
                Magnitude: dep.magnitude,
                Location: dep.location,
              };
            })
            // AFAD API'den gelen veride bazen koordinatlar NaN olabilir, filtrele
            .filter(eq => !isNaN(eq.Latitude) && !isNaN(eq.Longitude)); 
            
          setEarthquakes(parsedData);
          console.log(`AFAD API'den ${parsedData.length} adet deprem verisi çekildi.`);
        } else {
            // Yanıt 200 OK olsa bile JSON beklenen dizi formatında değilse
            console.warn("AFAD API'den geçerli bir dizi formatında veri gelmedi.");
        }

      } catch (error) {
        // Hata Yönetimi İyileştirmesi: Konsola detaylı hata basma
        console.error("Deprem verisi alınamadı. Lütfen internet bağlantınızı ve API URL'sini kontrol edin. Hata:", error);
        // Kullanıcıya da bilgi verme
        Alert.alert("Hata", "Deprem verileri çekilemedi. Lütfen internet bağlantınızı kontrol edin.");
      } finally {
        setLoading(false);
        // Uyarıyı 72 saatlik veri için göster
        setShowWarning(true);
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        setTimeout(() => {
          Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => setShowWarning(false));
        }, 10000);
      }
    };

    fetchEarthquakeData();
  }, [fadeAnim]);

  // Yükleme ekranı
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2a3e5a" />
      </View>
    );
  }

  // Ana Ekran ve Harita
  return (
    <View style={styles.fullScreenContainer}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 39.0, // Türkiye merkezi
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
            {/* Depremin büyüklüğüne göre haritada çember (Circle) çizimi */}
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