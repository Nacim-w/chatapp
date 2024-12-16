import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet } from 'react-native';
import Chat from './screens/Chat';
import CreateUser from './screens/NewUser';
import Home from './screens/Home';
import Login from './screens/login';
import Myaccount from './screens/home/Myaccount';


const Stack = createNativeStackNavigator();
const App = () => { 
  return (
    <NavigationContainer >
    <Stack.Navigator initialRouteName='Login'>
        <Stack.Screen options={{headerShown: false}} name='Login' component={Login}/>
        <Stack.Screen options={{headerShown: false}} name='CreateUser' component={CreateUser}/>
        <Stack.Screen options={{headerShown: false}} name = 'Home' component={Home}/>
        <Stack.Screen name="My Profile" component={Myaccount} />
        <Stack.Screen options={{headerShown: true}} name = 'Chat' component={Chat}/>
      
    </Stack.Navigator>
    </NavigationContainer>

)};

const styles = StyleSheet.create({
  container: {
    flex: 1,
   
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 42,
   
    fontWeight: 'bold',
    textAlign: 'center',
    
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

export default App;