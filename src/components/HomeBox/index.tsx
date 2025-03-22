import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';  
import { FontAwesome } from '@expo/vector-icons';   
import { MaterialCommunityIcons } from '@expo/vector-icons';   
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

function Index() {
  const Navigation = useNavigation();

  const boxData = [
    { id: '1', icon: 'account-alert-outline', iconSet: 'MaterialCommunityIcons', color: '#b185fa', text: 'Acil Durum', navigateTo: 'SosScreen' },
    { id: '2', icon: 'crisis-alert', iconSet: 'MaterialIcons', color: '#fe9899', text: 'Anlık Depremler', navigateTo: 'EarthquakeScreen' },
    { id: '3', icon: 'weather-cloudy', iconSet: 'MaterialCommunityIcons', color: '#70d0fb', text: 'Hava Durumu', navigateTo: 'AttentionScreen' },
    { id: '4', icon: 'warning', iconSet: 'MaterialIcons', color: '#63db9a', text: 'Tehlike', navigateTo: 'DangerScreen' },
  ];
  <MaterialCommunityIcons name="account-alert-outline" size={24} color="black" />

  const renderIcon = (iconSet: string, icon: string) => {
    if (iconSet === 'MaterialCommunityIcons') return <MaterialCommunityIcons name={icon} size={80} color="white" />;
    if (iconSet === 'MaterialIcons') return <MaterialIcons name={icon} size={80} color="white" />;
    if (iconSet === 'MaterialCommunityIcons') return <MaterialCommunityIcons name={icon} size={80} color="white" />;
    return null;
  };

  return (
    <FlatList
      data={boxData}
      keyExtractor={(item) => item.id}
      numColumns={2} 
      renderItem={({ item }) => (
        <TouchableOpacity 
          onPress={() => Navigation.navigate(item.navigateTo)}  
          style={[styles.container, { backgroundColor: item.color }]}
        >
          <View style={styles.text}>
            {renderIcon(item.iconSet, item.icon)}
            <Text style={styles.textStyle}>{item.text}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: width * 0.42,
    height: height * 0.22,
    borderRadius: 30,
    margin: 10,
    marginTop:30,
    marginLeft:20,
  },
  text: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  textStyle: {
    fontSize: 20,
    color: 'white',
    fontStyle: 'italic',
    fontWeight: '400',
    marginTop: 20,
  },
});

export default Index;
