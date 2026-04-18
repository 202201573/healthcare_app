import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import RiskPredictor from '../ml/RiskPredictor';
import { SensorContext } from '../context/SensorContext';
import { LanguageContext } from '../context/LanguageContext';

const ChatbotScreen = ({ navigation }) => {
  const { t } = useContext(LanguageContext);
  const { liveBpm, liveSpo2, liveSys, liveDia, liveTemp } = useContext(SensorContext);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    // Since there's no backend, load the default greeting instantly
    setMessages([{
      id: '1', 
      sender: 'ai', 
      message: `Hello! I've been monitoring your active vitals. Your heart rate is currently ${liveBpm} bpm and your SpO2 is ${liveSpo2}%. Anything specific you'd like me to analyze for you?`,
      timestamp: Date.now()
    }]);
  };

  const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  const fetchGeminiResponse = async (input) => {
    try {
      const mlPrediction = RiskPredictor.predict(liveBpm, liveSpo2);
      const systemInstruction = `You are PulseGuard AI, a highly knowledgeable healthcare assistant. 
IMPORTANT CONTEXT: Below are the user's REAL-TIME physiological vitals actively recorded from their sensors right now:
- Heart Rate: ${liveBpm} BPM
- SpO2: ${liveSpo2}%
- Blood Pressure: ${liveSys}/${liveDia}
- Body Temp: ${liveTemp} C
- LOCAL AI RISK ENGINE PREDICTION OVERRIDE: ${mlPrediction.riskLabel}

Use this live organic data to answer ALL questions about their current health status. Provide concise helpful advice under 4 sentences to fit a mobile screen.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: input }] }],
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            }
          })
        }
      );
      
      const data = await response.json();
      if (data && data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
      }
      return "I'm sorry, I couldn't process that request at the moment.";
    } catch (error) {
      console.error(error);
      return "Network error. Please make sure you have internet access to reach the AI servers.";
    }
  };

  const sendMessage = async (textOverride = null) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim()) return;

    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { id: tempId, sender: 'user', message: textToSend, timestamp: Date.now() }]);
    if (!textOverride) setInputText('');

    // Fetch intelligent response from Gemini
    const aiResponse = await fetchGeminiResponse(textToSend);
    
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      message: aiResponse,
      timestamp: Date.now()
    }]);
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
        <Text style={[styles.timeText, item.sender === 'user' ? {color: 'rgba(255,255,255,0.7)'} : null]}>
            {new Date(item.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      {item.sender === 'user' && (
        <View style={styles.userAvatarWrapper}>
          <Ionicons name="person" size={16} color="#fff" />
        </View>
      )}
    </View>
  );

  const filteredMessages = messages.filter(msg => 
    msg.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4ba1ff', '#2d7df6']} style={styles.header}>
        {isSearching ? (
            <View style={styles.searchHeaderInner}>
                <TouchableOpacity onPress={() => {setIsSearching(false); setSearchQuery('');}}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <TextInput 
                    style={styles.headerSearchInput}
                    placeholder="Search messages..."
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    autoFocus
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
        ) : (
            <>
                <View style={styles.headerIconGrp}>
                <View style={styles.headerAiAvatar}><Ionicons name="happy" size={24} color="#ff4b4b" /></View>
                <View style={{marginLeft: 15}}>
                    <Text style={styles.headerTitle}>PulseGuard AI</Text>
                    <Text style={styles.headerStatus}>• Online & Monitoring</Text>
                </View>
                </View>
                <View style={styles.headerActions}>
                <TouchableOpacity onPress={() => setIsSearching(true)}>
                    <Ionicons name="search" size={24} color="#fff" style={{marginRight: 15}} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMenuVisible(true)}>
                    <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                </TouchableOpacity>
                </View>
            </>
        )}
      </LinearGradient>

      {/* Menu Modal */}
      <Modal visible={menuVisible} transparent animationType="fade">
          <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
              <View style={styles.menuBox}>
                  <TouchableOpacity style={styles.menuItem} onPress={() => {setMenuVisible(false); navigation.navigate('Home');}}>
                      <Ionicons name="home-outline" size={20} color="#333" />
                      <Text style={styles.menuItemText}>{t('home')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem} onPress={() => {setMenuVisible(false); navigation.navigate('Dashboard');}}>
                      <Ionicons name="stats-chart-outline" size={20} color="#333" />
                      <Text style={styles.menuItemText}>{t('dashboard')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem} onPress={() => {setMenuVisible(false); navigation.navigate('Profile');}}>
                      <Ionicons name="person-outline" size={20} color="#333" />
                      <Text style={styles.menuItemText}>{t('profile')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
                      <Ionicons name="settings-outline" size={20} color="#333" />
                      <Text style={styles.menuItemText}>{t('settings')}</Text>
                  </TouchableOpacity>
              </View>
          </TouchableOpacity>
      </Modal>

      <KeyboardAvoidingView style={styles.contentWrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={flatListRef}
          data={searchQuery ? filteredMessages : (messages.length > 0 ? messages : [{id: '1', sender: 'ai', message: "Hello! I've analyzed your vitals. Your heart rate looks normal today - 86 bpm. Anything specific you'd like to know?"}])}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.chatList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => !searchQuery && flatListRef.current?.scrollToEnd({animated: true})}
          onLayout={() => !searchQuery && flatListRef.current?.scrollToEnd({animated: true})}
        />

        <View style={styles.bottomArea}>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptsRow}>
             <TouchableOpacity style={styles.promptBtn} onPress={() => sendMessage("Generate a 7-day health schedule for me")}>
               <Text style={styles.promptText}>🗓️ 7-Day Schedule</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.promptBtn} onPress={() => sendMessage("What are the risks of heart disease?")}>
               <Text style={styles.promptText}>🫀 Risk Analysis</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.promptBtn} onPress={() => sendMessage("Explain my latest health data")}>
               <Text style={styles.promptText}>💡 Data Insight</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.promptBtn} onPress={() => sendMessage("Give me 5 sleep tips")}>
               <Text style={styles.promptText}>🌙 Sleep Tips</Text>
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
  searchHeaderInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40
  },
  headerSearchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20
  },
  menuBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 180,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20
  },
  menuItemText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500'
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
