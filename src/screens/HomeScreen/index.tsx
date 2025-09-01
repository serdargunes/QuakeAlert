import React from 'react';
import { View, StyleSheet } from 'react-native';
import HomeBox from '../../components/HomeBox/index';

// Fonksiyon adını 'index' yerine 'HomeScreen' olarak değiştirdim (Büyük harfle başladı).
function HomeScreen() {
  return (
    // ScrollView'ı View ile değiştirdim çünkü HomeBox'taki FlatList zaten kaydırılabilir.
    // Bu, "VirtualizedLists should never be nested" hatasını çözer.
    <View style={styles.container}>
      <HomeBox />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Tüm ekranı kaplaması için
    backgroundColor: '#2a3e5a', // Arka plan rengini korudum
  },
});

// export ismini de güncelledim.
export default HomeScreen;