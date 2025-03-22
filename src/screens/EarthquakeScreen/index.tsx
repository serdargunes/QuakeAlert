import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';

type EarthquakeData = {
  Date: string;
  Time: string;
  Magnitude: string;
  Location: string;
  Depth: string;
  Latitude: string;
  Longitude: string;
};

const EarthquakeScreen: React.FC = () => {
  const [earthquakes, setEarthquakes] = useState<EarthquakeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // API'den veriyi çekmek için useEffect kullanıyoruz.
  useEffect(() => {
    const fetchEarthquakeData = async () => {
      try {
        const response = await fetch('https://www.koeri.boun.edu.tr/scripts/lst6.asp');
        const data = await response.text(); // Veriyi metin formatında alıyoruz.
        
        // Metni işleyerek JSON formatına dönüştürmemiz gerekebilir.
        // Bu örnekte, sadece basit bir işleme yapacağız, verilerin formatı doğru şekilde işlenmelidir.
        
        const parsedData = processEarthquakeData(data);
        setEarthquakes(parsedData);
        setLoading(false);
      } catch (error) {
        console.error("Veri çekilirken hata oluştu: ", error);
        setLoading(false);
      }
    };

    fetchEarthquakeData();
  }, []);

  // Metin verisini işleyerek daha anlamlı hale getiriyoruz (örnek işlem).
  const processEarthquakeData = (data: string): EarthquakeData[] => {
    const rows = data.split("\n").slice(1); // Satırlara ayırıyoruz
    return rows.map(row => {
      const cols = row.split("\t");
      return {
        Date: cols[0],
        Time: cols[1],
        Magnitude: cols[2],
        Location: cols[3],
        Depth: cols[4],
        Latitude: cols[5],
        Longitude: cols[6]
      };
    });
  };

  // Eğer veri yükleniyorsa, bir loading spinner gösterelim
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Veriler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={earthquakes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.text}>Tarih: {item.Date}</Text>
            <Text style={styles.text}>Saat: {item.Time}</Text>
            <Text style={styles.text}>Büyüklük: {item.Magnitude}</Text>
            <Text style={styles.text}>Lokasyon: {item.Location}</Text>
            <Text style={styles.text}>Derinlik: {item.Depth} km</Text>
            <Text style={styles.text}>Enlem: {item.Latitude}</Text>
            <Text style={styles.text}>Boylam: {item.Longitude}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  item: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});

export default EarthquakeScreen;
