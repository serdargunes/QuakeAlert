import React from 'react';
import { View, StyleSheet } from 'react-native';
import HomeBox from '../../components/HomeBox/index';

function HomeScreen() {
  return (
    <View style={styles.container}>
      <HomeBox />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#2a3e5a',
  },
});


export default HomeScreen;