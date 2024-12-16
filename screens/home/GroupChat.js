import React, { useEffect, useState } from 'react';
import { 
  FlatList, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  SafeAreaView 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firebase from '../../config';

const GroupChat = () => {
  const currentUser = firebase.auth().currentUser;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Fetch messages logic
    const messagesRef = firebase.database().ref('groupChats/general/messages');
    messagesRef.on('value', (snapshot) => {
      const data = snapshot.val() || {};
      setMessages(Object.values(data));
    });

    return () => messagesRef.off();
  }, []);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    console.log(currentUser)
        const message = {
      sender: currentUser.email || "Anonymous",
      text: newMessage.trim(),
      timestamp: Date.now(),
    };

    firebase.database().ref('groupChats/general/messages').push(message);
    setNewMessage("");
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender === currentUser.email;

    return (
      <View style={isMyMessage ? styles.myMessage : styles.otherMessage}>
        <Text style={styles.senderText}>{item.sender}</Text>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestampText}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.groupTitle}>Group Chat</Text>
        </View>

        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => index.toString()}
          style={styles.messageList}
        />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor="#aaa"
              value={newMessage}
              onChangeText={setNewMessage}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Ionicons name="send" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 10,
    backgroundColor: "#1E1E2C",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor:"#3F51B5"
  },
  header: {
    padding: 16,
    backgroundColor: "# 3F51B5",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  groupTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
    maxWidth: "70%",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#444",
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
    maxWidth: "70%",
  },
  senderText: {
    fontSize: 12,
    color: "#aaa",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: "#fff",
  },
  timestampText: {
    fontSize: 10,
    color: "#bbb",
    marginTop: 4,
    textAlign: "right",
  },
  keyboardAvoidingView: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#333",
    borderTopWidth: 1,
    borderTopColor: "#444",
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: "#444",
    borderRadius: 8,
    color: "#fff",
  },
  sendButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default GroupChat;
