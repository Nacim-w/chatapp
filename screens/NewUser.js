import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { ImageBackground, Text, TextInput, View } from 'react-native';
import firebase from '../config';

const Auth = firebase.auth();
const db = firebase.database();
const ref_listprofiles = db.ref('list_profiles');

const CreateUser = () => {
  const [login, setLogin] = useState('');
  const [pwd, setPwd] = useState('');
  const [nom, setNom] = useState('');
  const [cpwd, setCpwd] = useState('');
  const navigation = useNavigation();

  return (
    <KeyboardAvoidingView
      behavior='height'
      style={styles.container}
    >
      <ImageBackground source={require('../assets/background.jpg')} resizeMode="cover" style={styles.image}>
        <View style={styles.overlay}>
          <Text style={styles.title}>Create Your Account</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={login}
            onChangeText={(text) => setLogin(text)}
            placeholderTextColor="#666"
          />

          <TextInput
            style={styles.input}
            placeholder="Name"
            value={nom}
            onChangeText={(text) => setNom(text)}
            placeholderTextColor="#666"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={pwd}
            onChangeText={(text) => setPwd(text)}
            secureTextEntry={true}
            placeholderTextColor="#666"
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={cpwd}
            onChangeText={(text) => setCpwd(text)}
            secureTextEntry={true}
            placeholderTextColor="#666"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={async () => {
                if (pwd !== cpwd) {
                  Alert.alert('Error', 'Passwords do not match!');
                  return;
                }

                Auth.createUserWithEmailAndPassword(login, pwd)
                  .then(async (userCredential) => {
                    const user = userCredential.user;
                    const currentId = user.uid;

                    await ref_listprofiles.push({
                      email: user.email,
                      uid: user.uid,
                      nom: nom,
                      tel: '',
                      connected: false,
                      online: true, 
                    });

                    console.log('User created successfully:', user);
                    navigation.replace('My Profile', { currentId: currentId });
                  })
                  .catch((err) => {
                    Alert.alert('Error', err.message);
                  });
              }}
            >
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.buttonText}>Login</Text>
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
    textAlign: 'center',
  },
  input: {
    height: 40,
    width: '90%',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonContainer: {
    marginTop: 20,
    width: '90%',
  },
  createButton: {
    backgroundColor: 'black',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: '#black',
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

export default CreateUser;
