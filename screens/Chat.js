import md5 from 'md5';
import React, { useEffect, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import {supabase} from '../config';
import { decode } from 'base64-arraybuffer';

import { 
  FlatList, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  KeyboardAvoidingView, 
  Platform ,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import firebase from '../config';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { makePhoneCall, sendLocation } from '../utils';

const Chat = ({ route }) => {
  const currentUser = firebase.auth().currentUser;
  const { contactEmail, contactName, contactNumber } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setContactIsTyping] = useState(false);

  const sanitizeEmailForFirebaseKey = (email) => {
    if (!email) return '';
    return email.replace(/[.#$\/\[\]]/g, '_');
  };

  const generateChatId = (email1, email2) => {   
    const sortedEmails = [email1, email2].sort();
    const sanitizedEmails = sortedEmails.map(email => sanitizeEmailForFirebaseKey(email));
    return md5(`${sanitizedEmails[0]}_${sanitizedEmails[1]}`);
  };

  useEffect(() => {
    if (!currentUser) {
      console.log('User is not authenticated');
      return;
    }
    const chatId = generateChatId(currentUser.email, contactEmail);
    const messagesRef = firebase.database().ref(`chats/${chatId}/messages`);
    const userTypingRef = firebase.database().ref(`chats/${chatId}/usersTyping`);

    const onMessageAdded = (snapshot) => {
      const newMessage = snapshot.val();
      if (firebase.auth().currentUser) 
        setMessages((prevMessages) => [...prevMessages, newMessage]);
       else 
        messagesRef.off('child_added', onMessageAdded);
    };

    const onTypingStatusChanged = (snapshot) => {
      const typingStatus = snapshot.val() || {};
      const isContactTyping = typingStatus[sanitizeEmailForFirebaseKey(contactEmail)] || false;
      setContactIsTyping(isContactTyping);
    };

    messagesRef.on('child_added', onMessageAdded);
    userTypingRef.on('value', onTypingStatusChanged);

    return () => {
      messagesRef.off('child_added', onMessageAdded);
      userTypingRef.off('value', onTypingStatusChanged);
    };
  }, [currentUser, contactEmail]);

  const sendMessage = () => {
    if (!currentUser) {
      console.log('User is not authenticated');
      return;
    }

    if (newMessage.trim() === '') {
      return;
    }

    const chatId = generateChatId(currentUser.email, contactEmail);
    const message = {
      senderEmail: currentUser.email,
      receiverEmail: contactEmail,
      text: newMessage,
      timestamp: Date.now(),
      read: false,
    };

    firebase.database().ref(`chats/${chatId}/messages`).push(message);
    setNewMessage('');

    stopTyping();
  };

  const startTyping = () => {
    const chatId = generateChatId(currentUser.email, contactEmail);
    const userTypingRef = firebase.database().ref(`chats/${chatId}/usersTyping`);

    userTypingRef.update({
      [sanitizeEmailForFirebaseKey(currentUser.email)]: true,
    });
  };


  const stopTyping = () => {
    const chatId = generateChatId(currentUser.email, contactEmail);
    const userTypingRef = firebase.database().ref(`chats/${chatId}/usersTyping`);

    userTypingRef.update({
      [sanitizeEmailForFirebaseKey(currentUser.email)]: false,
    });
  };

  const renderMessage = ({ item }) => {
    const formattedDate = new Date(item.timestamp).toLocaleString();
    const myMessage = item.senderEmail === currentUser.email;
    console.log(item.type)
    if(item.type!=undefined)
    {
      console.log(item.text)
      return  (<View style={myMessage ? styles.userMessage : styles.contactMessage}> <Image
        style={{width: 100, height: 100}}
        source={{uri: `${item.text}`
      }}/>
        <Text style={myMessage ? styles.userTimestampText : styles.contactTimestampText}>{formattedDate}</Text></View>)
    }
    else{
      return (
        <View style={myMessage ? styles.userMessage : styles.contactMessage}>
          <Text style={myMessage ? styles.userMessageText : styles.contactMessageText}>{item.text}</Text>
          <Text style={myMessage ? styles.userTimestampText : styles.contactTimestampText}>{formattedDate}</Text>
        </View>
      );

    }
    
  };

  const capitalizeWords = (str) => {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  function handleCall() {
    makePhoneCall(contactNumber.toString());
  }
  const handleSendDocument = async () => {

    const result = await DocumentPicker.getDocumentAsync({});

      const fileUri = result.assets[0].uri;
      const fileName = result.assets[0].name;
      const fileType = result.assets[0].mimeType;

      try {
        const response = await fetch(fileUri);
        const base64 = await response.blob()
        .then(blob => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }));
        const base64String = base64.split(',')[1];
        const arrayBuffer = decode(base64String);
        const filename = `${fileType}-${currentUser.email}-${Date.now()}`;
        console.log(supabase)
        const { data, error } = await supabase.storage
          .from('chat_files') 
          .upload(filename, arrayBuffer, {
            contentType: fileType,
          });

        if (error) throw error;

        const { data: publicUrl } = supabase.storage
          .from('chat_files')
          .getPublicUrl(filename);

        const filePath = publicUrl.publicUrl

        const chatId = generateChatId(currentUser.email, contactEmail);
        const message = {
          senderEmail: currentUser.email,
          receiverEmail: contactEmail,
          text: filePath,
          type:'image',
          timestamp: Date.now(),
          read: false,
        };    
        firebase.database().ref(`chats/${chatId}/messages`).push(message);
      } catch (error) {
        console.error("Error sending file:", error);
        Alert.alert("Error", "Failed to send file.");
      }
    
  };
  async function handleSendLocation() {
    const msg = await sendLocation(contactEmail);
    const chatId = generateChatId(currentUser.email, contactEmail);
    const message = {
      senderEmail: currentUser.email,
      receiverEmail: contactEmail,
      text: msg,
      timestamp: Date.now(),
      read: false,
    };

    firebase.database().ref(`chats/${chatId}/messages`).push(message);
    setNewMessage('');
  }

  return (
    <View style={styles.container}>
      <View style={styles.navabar}>
        <Icon name="phone" size={30} color="#FFF" style={styles.icon} onPress={handleCall} />
        <Text style={styles.sendButtonText}>{capitalizeWords(contactName)}</Text>
      </View>

      <FlatList
        keyboardDismissMode='interactive'
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.timestamp.toString()}
        style={styles.messageContainer}
      />
      {isTyping && <Text style={styles.typingText}>{contactName} is typing...</Text>}

      <KeyboardAvoidingView
        behavior='position'
        keyboardVerticalOffset={90}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#bbb"
            value={newMessage}
            onFocus={startTyping}
            onBlur={stopTyping} 
            onChangeText={(text) => {
              setNewMessage(text);
            }}
          />
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={sendMessage}
          >
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.locationButton} 
            onPress={handleSendLocation}
          >
            <Icon name="location-arrow" size={30} color="#FFF" />
          </TouchableOpacity>

          {/* New icon for sending files */}
          <TouchableOpacity 
            style={styles.fileButton} 
            onPress={handleSendDocument}
          >
            <Ionicons name="attach" size={30} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3F51B5", // Dark background to match the List_Profil component
  },
  navabar: {
    backgroundColor: "#3F51B5", // Match header background
    width: "100%",
    height: "8%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#444", // Add subtle border
  },
  icon: {
    marginRight: 15,
    marginLeft: 15,
    color: "white", // Yellow icon color to match List_Profil
  },
  sendButtonText: {
    color: "white", // Yellow text to match the header
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  messageContainer: {
    flex: 1,
    padding: 25,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007bff", // Keep user message color blue
    borderRadius: 10,
    padding: 10,
    maxWidth: "80%",
    marginTop:5,
    marginBottom:5,
  },
  contactMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#444", // Darker gray for the contact's messages
    borderRadius: 10,
    padding: 10,
    maxWidth: "80%",
  },
  userMessageText: {
    fontSize: 16,
    color: "#fff", // White text for user messages
  },
  contactMessageText: {
    fontSize: 16,
    color: "#ddd", // Lighter gray for contact's text
  },
  userTimestampText: {
    fontSize: 12,
    color: "#bbb", // Light gray for timestamps
    textAlign: "right",
    marginTop: 5,
  },
  contactTimestampText: {
    fontSize: 12,
    color: "#888", // Slightly darker gray for contact timestamps
    textAlign: "right",
    marginTop: 5,
  },
  typingText: {
    color: "white", // Yellow italic text to indicate typing
    fontStyle: "italic",
    marginLeft: 16,
    marginBottom: 8,
  },
  keyboardAvoidingView: {
    flexDirection: 'column-reverse',
    backgroundColor: "#1E1E2C",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#222", // Dark background for the input container
    borderTopWidth: 1,
    borderTopColor: "#444", // Subtle border color
  },
  input: {
    flex: 1,
    color: "white", // White text color
    fontSize: 16,
    padding: 10,
    backgroundColor: "#333", // Dark input background
    borderRadius: 20,
  },
  sendButton: {
    backgroundColor: "#007bff", // Send button blue
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  locationButton: {
    backgroundColor: "green",
    padding: 5,
    borderRadius: 5,
    marginLeft: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  fileButton: {
    backgroundColor: "orange",
    padding: 5,
    borderRadius: 5,
    marginLeft: 5,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Chat;
