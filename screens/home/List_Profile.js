import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, SafeAreaView, StyleSheet } from "react-native";
import { List } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import firebase from "../../config";
import { useNavigation } from "@react-navigation/native";
import md5 from 'md5';

const database = firebase.database();
const auth = firebase.auth();

export default function List_Profil(props) {
  const [data, setData] = useState([]);
  const ref_profiles = database.ref("list_profiles");
  const ref_status = database.ref("/status");
  const navigation = useNavigation();
  const currentId = props.route.params.currentId;

  useEffect(() => {
    const user = auth.currentUser;

    if (user) {
      const loggedInEmail = user.email;

      const fetchProfiles = () => {
        ref_profiles.on("value", (snapshot) => {
          let profiles = [];
          snapshot.forEach((un_profil) => {
            const key = un_profil.key;
            const val = un_profil.val();

            if (val.email !== loggedInEmail) {
              profiles.push({ key, ...val });
            }
          });

          ref_status.once("value", (statusSnapshot) => {
            const statuses = statusSnapshot.val() || {};
            const updatedProfiles = profiles.map((profile) => ({
              ...profile,
            }));

            updatedProfiles.forEach((profile, index) => {
              const chatId = generateChatId(loggedInEmail, profile.email);
              const messagesRef = database.ref(`chats/${chatId}/messages`);
              
              messagesRef.limitToLast(1).once('value', (messagesSnapshot) => {
                const lastMessage = messagesSnapshot.val();
                if (lastMessage) {
                  const lastMessageData = Object.values(lastMessage)[0];
                  updatedProfiles[index].lastMessage = lastMessageData.text;
                } else {
                  updatedProfiles[index].lastMessage = "No messages yet";
                }

                if (index === updatedProfiles.length - 1) {
                  setData(updatedProfiles);
                }
              });

              messagesRef.on('child_added', (snapshot) => {
                const lastMessage = snapshot.val();
                const messageText = lastMessage ? lastMessage.text : "No messages yet";

                updatedProfiles[index].lastMessage = messageText;
                setData([...updatedProfiles]);
              });
            });
          });
        });
      };

      fetchProfiles();
    }

    return () => {
      ref_profiles.off();
    };
  }, []);

  const generateChatId = (email1, email2) => {
    const sanitizedEmails = [email1, email2].sort().map((email) =>
      email.replace(/[.#$\/\[\]]/g, '_')
    );
    return md5(`${sanitizedEmails[0]}_${sanitizedEmails[1]}`);
  };

  const navigateToChat = (contactNumber, contactEmail, contactName) => {
    navigation.navigate("Chat", {
      contactNumber,
      contactEmail,
      contactName,
      currentId: auth.currentUser.uid,
    });
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity onPress={() => navigateToChat(item.tel, item.email, `${item.nom} ${item.prenom}`)}>
      <List.Item
        title={`${item.nom} ${item.prenom}`}
        description={`Last message: ${item.lastMessage}`} 
        titleStyle={styles.itemTitle}
        descriptionStyle={styles.itemDescription}
        left={() => (
          <View style={styles.imageContainer}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.profileImage} />
            ) : (
              <Image source={require("../../assets/img_prof.png")} style={styles.profileImage} />
            )}
            {item.online && <View style={styles.onlineDot} />}
          </View>
        )}
        right={() => (
          <Icon name="chevron-right" size={25} color="#FFC107" style={styles.chevronIcon} />
        )}
        style={[styles.listItem, { backgroundColor: index % 2 === 0 ? "#3F51B5" : "#8BC34A" }]}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Chats</Text>
        <FlatList
          style={styles.flatList}
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, i) => i.toString()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    fontSize: 30,
    textAlign: "center",
    padding: 20,
    backgroundColor: "#3F51B5",
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 10,
    elevation: 3,
  },
  flatList: {
    flex: 1,
  },
  listItem: {
    margin: 5,
    borderRadius: 10,
    paddingVertical: 10,
  },
  itemTitle: {
    color: "#f5f5f5f5",
    fontWeight: "bold",
  },
  itemDescription: {
    color: "#ffff",
  },
  imageContainer: {
    marginRight: 10,
    paddingLeft: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineDot: {
    width: 12,
    height: 12,
    backgroundColor: "#4CAF50",
    borderRadius: 6,
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  chevronIcon: {
    alignSelf: "center",
  },
});
