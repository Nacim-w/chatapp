import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { ImageBackground, Text, TextInput, View } from 'react-native';
import firebase from '../config';

const Login = () => {
  const [login, setLogin] = useState('test@gmail.com');
  const [pwd, setPwd] = useState('12345678');
  const navigation = useNavigation();
  const auth = firebase.auth();

  return (
    <KeyboardAvoidingView
      behavior="height"
      style={styles.container}
    >
      <ImageBackground source={require('../assets/background.jpg')} resizeMode="cover" style={styles.image}>
        <View style={styles.overlay}>
          <Text style={styles.title}>Welcome Back</Text>

          <TextInput
            onChangeText={(text) => setLogin(text)}
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={login}
          />
          <TextInput
            onChangeText={(text) => setPwd(text)}
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            secureTextEntry={true}
            value={pwd}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => {
                auth
                  .signInWithEmailAndPassword(login, pwd)
                  .then((userCredential) => {
                    const user = userCredential.user;
                    console.log('User signed in successfully:', user.uid);

                    // Update online status to true
                    const ref_listprofiles = firebase.database().ref('list_profiles');
                    ref_listprofiles
                      .orderByChild('uid')
                      .equalTo(user.uid)
                      .once('value')
                      .then((snapshot) => {
                        snapshot.forEach((childSnapshot) => {
                          const userKey = childSnapshot.key;
                          ref_listprofiles
                            .child(userKey)
                            .update({
                              online: true, // Set 'online' to true
                            })
                            .then(() => {
                              console.log('Online status updated');
                            })
                            .catch((error) => {
                              console.error('Error updating online status:', error);
                            });
                        });
                      })
                      .catch((error) => {
                        console.error('Error fetching user profile:', error);
                      });

                    navigation.navigate('Home', { currentId: user.uid });
                  })
                  .catch(() => {
                    Alert.alert('Login Failed', 'Invalid Password or Email');
                  });
              }}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => navigation.navigate('CreateUser')}
            >
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    width: '90%',
    height: 50,
    marginVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    backgroundColor: '#fff',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContainer: {
    width: '90%',
    marginTop: 20,
  },
  loginButton: {
    backgroundColor: 'black',
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 10,
    alignItems: 'center',
  },
  signupButton: {
    backgroundColor: 'black',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Login;
