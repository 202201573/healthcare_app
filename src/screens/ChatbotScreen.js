import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get('chat/');
      setMessages(response.data);
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async (textOverride = null) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim()) return;

    try {
      const userMsg = { message: textToSend };
      
      const tempId = Date.now().toString();
      setMessages(prev => [...prev, { id: tempId, sender: 'user', message: textToSend }]);
      if (!textOverride) setInputText('');

      await api.post('chat/', userMsg);
      fetchMessages();
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
      {item.sender === 'ai' && (
        <View style={styles.aiAvatarWrapper}>
          <Ionicons name="happy" size={20} color="#ff4b4b" />
        </View>
      )}
      <View style={[styles.messageBlock, item.sender === 'user' ? styles.userBlock : styles.aiBlock]}>
        {item.sender === 'ai' && item.message.includes('86') ? (
            <View style={styles.vitalSnippet}>
              <Ionicons name="heart" size={16} color="#ff4b4b" />
              <Text style={styles.vitalSnippetVal}> 86 bpm </Text>
              <Text style={styles.vitalSnippetLabel}>- Normal</Text>
            </View>
        ): null}
        <Text style={[styles.messageText, item.sender === 'user' ? styles.userText : styles.aiText]}>{item.message}</Text>
        <Text style={styles.timeText}>10:44 AM</Text>
      </View>
      {item.sender === 'user' && (
        <View style={styles.userAvatarWrapper}>
          <Ionicons name="person" size={16} color="#fff" />
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4ba1ff', '#2d7df6']} style={styles.header}>
        <View style={styles.headerIconGrp}>
          <View style={styles.headerAiAvatar}><Ionicons name="happy" size={24} color="#ff4b4b" /></View>
          <View style={{marginLeft: 15}}>
             <Text style={styles.headerTitle}>PulseGuard AI</Text>
             <Text style={styles.headerStatus}>• Online & Monitoring</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
           <Ionicons name="search" size={24} color="#fff" style={{marginRight: 15}} />
           <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={styles.contentWrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={messages.length > 0 ? messages : [{id: '1', sender: 'ai', message: "Hello! I've analyzed your vitals. Your heart rate looks normal today - 86 bpm. Anything specific you'd like to know?"}]}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.chatList}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.bottomArea}>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptsRow}>
             <TouchableOpacity style={styles.promptBtn} onPress={() => sendMessage("Show my heart history")}>
               <Text style={styles.promptText}>Show my heart history</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.promptBtn} onPress={() => sendMessage("Am I at risk?")}>
               <Text style={styles.promptText}>Am I at risk?</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.promptBtn} onPress={() => sendMessage("Sleep tips")}>
               <Text style={styles.promptText}>Sleep tips</Text>
             </TouchableOpacity>
           </ScrollView>
           
           <View style={styles.inputRow}>
             <TouchableOpacity style={styles.iconBtn}><Ionicons name="add" size={24} color="#bdc3c7" /></TouchableOpacity>
             <TextInput
               style={styles.inputBox}
               placeholder="Type your message..."
               value={inputText}
               onChangeText={setInputText}
             />
             <TouchableOpacity style={styles.iconBtn}><Ionicons name="mic-outline" size={24} color="#bdc3c7" /></TouchableOpacity>
             <TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage(null)}>
               <Ionicons name="send" size={20} color="#fff" style={{marginLeft: 3, marginTop: 2}} />
             </TouchableOpacity>
           </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10
  },
  headerIconGrp: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerAiAvatar: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff'
  },
  headerStatus: {
    fontSize: 12,
    color: '#e6f0ff',
    marginTop: 2
  },
  headerActions: {
    flexDirection: 'row'
  },
  contentWrap: {
    flex: 1
  },
  chatList: {
    padding: 20,
    paddingBottom: 10
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-end'
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  aiBubble: {
    justifyContent: 'flex-start',
  },
  aiAvatarWrapper: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1
  },
  userAvatarWrapper: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2b225e',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10
  },
  messageBlock: {
    maxWidth: '75%',
    padding: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1
  },
  userBlock: {
    backgroundColor: '#3282f6',
    borderBottomRightRadius: 5
  },
  aiBlock: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 5
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22
  },
  userText: {
    color: '#fff'
  },
  aiText: {
    color: '#333'
  },
  timeText: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.4)',
    alignSelf: 'flex-end',
    marginTop: 5
  },
  vitalSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0f0',
    padding: 8,
    borderRadius: 10,
    marginBottom: 10
  },
  vitalSnippetVal: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#222'
  },
  vitalSnippetLabel: {
    fontSize: 12,
    color: '#888'
  },
  bottomArea: {
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 5
  },
  promptsRow: {
    paddingLeft: 15,
    marginBottom: 10
  },
  promptBtn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3282f6',
    marginRight: 10,
    backgroundColor: '#fff'
  },
  promptText: {
    color: '#3282f6',
    fontWeight: '600'
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15
  },
  iconBtn: {
    padding: 10
  },
  inputBox: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    height: 45,
    borderRadius: 25,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#eee',
    color: '#333'
  },
  sendBtn: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#3282f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    shadowColor: '#3282f6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3
  }
});

export default ChatbotScreen;
