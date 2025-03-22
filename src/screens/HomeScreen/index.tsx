import React from 'react'
import {View,Text,StyleSheet} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler';
import HomeBox from '../../components/HomeBox/index'

function index() {
  return (
    <ScrollView style = {styles.container}>
      <HomeBox />
      </ScrollView>
    
  )
}
const styles = StyleSheet.create({
  container:{
    backgroundColor:'#2a3e5a'
  }

})

export default index;