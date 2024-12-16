import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { default as React, useEffect, useState } from 'react';
import { Image, ImageBackground, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import firebase, { supabase } from '../../config';
import { Ionicons } from '@expo/vector-icons';

const db = firebase.database();
const ref_listprofiles = db.ref("list_profiles");

function logOut(navigation) {
  const auth = firebase.auth();
  const currentUser = auth.currentUser;

  if (currentUser) {
    const ref_listprofiles = firebase.database().ref('list_profiles');

    // Search for the user's profile using the uid
    ref_listprofiles
      .orderByChild('uid')
      .equalTo(currentUser.uid)
      .once('value')
      .then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const userKey = childSnapshot.key; // Get the key of the user's profile

          // Update the user's online status to false
          ref_listprofiles
            .child(userKey)
            .update({
              online: false,  // Set 'online' to false
            })
            .then(() => {
              console.log('User logged out and online status set to false');
            })
            .catch((error) => {
              console.error('Error updating online status:', error);
            });
        });
      })
      .catch((error) => {
        console.error('Error fetching user profile for logout:', error);
      });

    auth
      .signOut()
      .then(() => {
        console.log('User signed out successfully');
        navigation.navigate('Login'); // Navigate to the Login screen after logout
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  } else {
    console.log('No user is logged in');
  }
}

function Myaccount(props) {
  const [login, setlogin] = useState('');
  const [tel, settel] = useState('');
  const [nom, setNom] = useState("");
  const [key, setkey] = useState("");
  const [prenom, setPrenom] = useState("");
  const currentId = props.route.params.currentId;

  const [profileImage, setProfileImage] = useState(null);
  const [uriLocalImage, setUriLocalImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const onDataChange = (snapshot) => {
          snapshot.forEach((un_profil) => {
            const key = un_profil.key;
            const val = un_profil.val();

            if (val.uid === currentId) {
              setNom(val.nom);
              setlogin(val.email);
              settel(val.tel || '');
              setPrenom(val.prenom);
              setProfileImage(val.avatar);
              setkey(key);
              return;
            }
          });
        };
        ref_listprofiles.on("value", onDataChange);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [currentId, uriLocalImage]);

  async function updateProfile() {
    try {
      await ref_listprofiles.child(key).update({
        email: login,
        uid: currentId,
        tel,
        nom,
        prenom: prenom || '',
        avatar: uriLocalImage ? uriLocalImage : profileImage,
      });
    } catch (error) {
      console.error('Error updating data:', error);
    }
  }
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });

      if (result.canceled) return;

      const base64File = result.assets[0]?.base64;
      if (!base64File) throw new Error("No base64 file");

      const fileName = `public/${currentId}_avatar.jpg`;
      const uploadedFile = await supabase.storage
        .from("whatsapp-tp")
        .upload(fileName, decode(base64File), {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadedFile.error) throw uploadedFile.error;

      const supabaseUrl = "https://ycnunrrfuxkxfzggaqwf.supabase.co";
      const imageLink =
        supabaseUrl + "/storage/v1/object/public/" + uploadedFile.data.fullPath;

      setUriLocalImage(imageLink);
      setProfileImage(imageLink);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../../assets/background.jpg')} resizeMode="cover" style={styles.image}>
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <Image source={require("../../assets/img_prof.png")} style={styles.profileImage} />
            )}
          </TouchableOpacity>
          <Text style={styles.userName}>{nom}</Text>
        </View>

        <View style={styles.formSection}>
          <TextInput
            value={login}
            style={styles.input}
            placeholder="Email"
            onChangeText={setlogin}
          />
          <TextInput
            value={tel}
            style={styles.input}
            placeholder="Phone Number"
            onChangeText={settel}
          />
          <TextInput
            value={nom}
            style={styles.input}
            placeholder="Last Name"
            onChangeText={setNom}
          />
          <TextInput
            value={prenom}
            style={styles.input}
            placeholder="First Name"
            onChangeText={setPrenom}
          />
        </View>

        <TouchableOpacity style={styles.updateButton} onPress={updateProfile}>
          <Text style={styles.updateButtonText}>Update Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={() => logOut(props.navigation)}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  image: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  formSection: {
    marginBottom: 30,
  },
  input: {
    height: 45,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingLeft: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: 'black',
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'black',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Myaccount;
