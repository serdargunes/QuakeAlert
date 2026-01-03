import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../Navigation';

const { width } = Dimensions.get('window');

type BoxDataItem = {
  id: string;
  icon: any;
  iconSet: 'MaterialCommunityIcons' | 'MaterialIcons';
  color: string;
  text: string;
  navigateTo: keyof RootStackParamList;
};

function HomeBox() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // ✅ İçeriğe dokunmadım
  const boxData: BoxDataItem[] = [
    { id: '1', icon: 'account-alert-outline', iconSet: 'MaterialCommunityIcons', color: '#b185fa', text: 'Acil Durum', navigateTo: 'SosScreen' },
    { id: '2', icon: 'crisis-alert', iconSet: 'MaterialIcons', color: '#fe9899', text: 'Anlık Depremler', navigateTo: 'EarthquakeScreen' },
    { id: '3', icon: 'weather-cloudy', iconSet: 'MaterialCommunityIcons', color: '#70d0fb', text: 'Hava Durumu', navigateTo: 'WeatherScreen' },
    { id: '4', icon: 'account-details-outline', iconSet: 'MaterialCommunityIcons', color: '#63db9a', text: 'Bilgilerim', navigateTo: 'MyInfoScreen' },
  ];

  const renderIcon = (iconSet: string, icon: any) => {
    const size = 34;
    if (iconSet === 'MaterialCommunityIcons') {
      return <MaterialCommunityIcons name={icon} size={size} color="white" />;
    }
    if (iconSet === 'MaterialIcons') {
      return <MaterialIcons name={icon} size={size} color="white" />;
    }
    return null;
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      {/* Header (2. görseldeki gibi) */}
      <View style={styles.header}>
      </View>

      <FlatList
        data={boxData}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate(item.navigateTo)}
            style={styles.cardWrap}
          >
            {/* Kart arka plan (dark + yumuşak) */}
            <LinearGradient
              colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              {/* İkon yuvarlağı (renkli gradient hissi) */}
              <LinearGradient
                colors={[item.color, 'rgba(255,255,255,0.15)']}
                start={{ x: 0.1, y: 0.1 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconBubble}
              >
                {renderIcon(item.iconSet, item.icon)}
              </LinearGradient>

              <Text style={styles.cardText}>{item.text}</Text>

              {/* Alt küçük çizgi (daha “app-like” görünüm) */}
              <View style={styles.cardDivider} />
            </LinearGradient>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const CARD_W = (width - 24 * 2 - 14) / 2;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#222B44', // 1. görselindeki koyu arka plan hissi
  },

  header: {
    paddingTop: 18,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
  },

  listContent: {
    paddingHorizontal: 24,
  paddingTop: 12,
  paddingBottom: 28,
  flexGrow: 1,
  justifyContent: 'center',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  cardWrap: {
    width: CARD_W,
  },

  card: {
    borderRadius: 26,
    padding: 16,
    height: 170,
    justifyContent: 'space-between',

    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },

    // Android shadow
    elevation: 8,

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  iconBubble: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 16,
    fontWeight: '600',
  },

  cardDivider: {
    height: 2,
    width: 28,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});

export default HomeBox;
