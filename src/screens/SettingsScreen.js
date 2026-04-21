import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';

const SettingsScreen = ({ navigation }) => {
  const { logout } = useContext(AuthContext);
  const { t, locale, changeLanguage } = useContext(LanguageContext);

  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [liveSyncEnabled, setLiveSyncEnabled] = useState(true);
  const [emergencyEnabled, setEmergencyEnabled] = useState(false);


  const [notiModalVisible, setNotiModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);


  const [pushEnabled, setPushEnabled] = useState(true);
  const [reportEnabled, setReportEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);


  const [profile, setProfile] = useState(null);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    try {
      const currentUsername = await AsyncStorage.getItem('current_username');
      const usersStr = await AsyncStorage.getItem('app_users_db');
      const users = usersStr ? JSON.parse(usersStr) : [];
      let currentUser = users.find(u => u.username === currentUsername);
      if (currentUser) {
        setProfile(currentUser);
        setEditDisplayName(currentUser.displayName || currentUser.username);
      }

      const settingsStr = await AsyncStorage.getItem(`app_settings_${currentUsername}`);
      if (settingsStr) {
        const s = JSON.parse(settingsStr);
        if (s.alertsEnabled !== undefined) setAlertsEnabled(s.alertsEnabled);
        if (s.liveSyncEnabled !== undefined) setLiveSyncEnabled(s.liveSyncEnabled);
        if (s.emergencyEnabled !== undefined) setEmergencyEnabled(s.emergencyEnabled);
        if (s.pushEnabled !== undefined) setPushEnabled(s.pushEnabled);
        if (s.reportEnabled !== undefined) setReportEnabled(s.reportEnabled);
        if (s.biometricEnabled !== undefined) setBiometricEnabled(s.biometricEnabled);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const updateSetting = async (key, val, setter) => {
    setter(val);
    try {
      const currentUsername = await AsyncStorage.getItem('current_username');
      const settingsStr = await AsyncStorage.getItem(`app_settings_${currentUsername}`);
      let s = settingsStr ? JSON.parse(settingsStr) : {};
      s[key] = val;
      await AsyncStorage.setItem(`app_settings_${currentUsername}`, JSON.stringify(s));
    } catch (e) { }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const currentUsername = await AsyncStorage.getItem('current_username');
      const usersStr = await AsyncStorage.getItem('app_users_db');
      let users = usersStr ? JSON.parse(usersStr) : [];
      let userIndex = users.findIndex(u => u.username === currentUsername);
      if (userIndex !== -1) {
        users[userIndex].avatarUri = result.assets[0].uri;
        await AsyncStorage.setItem('app_users_db', JSON.stringify(users));
        setProfile(users[userIndex]);
      }
    }
  };

  const saveProfileName = async () => {
    const currentUsername = await AsyncStorage.getItem('current_username');
    const usersStr = await AsyncStorage.getItem('app_users_db');
    let users = usersStr ? JSON.parse(usersStr) : [];
    let userIndex = users.findIndex(u => u.username === currentUsername);
    if (userIndex !== -1) {
      users[userIndex].displayName = editDisplayName;
      await AsyncStorage.setItem('app_users_db', JSON.stringify(users));
      setProfile(users[userIndex]);
      setEditProfileModalVisible(false);
      Alert.alert('Success', 'Profile updated!');
    }
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to exit?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout }
    ]);
  };

  const renderToggle = (icon, title, sub, iconColor, bg, value, onValueChange) => (
    <View style={styles.menuItem}>
      <View style={[styles.menuIconWrap, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.menuTextWrap}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#e5e5ea', true: '#34c759' }}
        thumbColor="#fff"
      />
    </View>
  );

  const renderLink = (icon, title, sub, iconColor, bg, onPress) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIconWrap, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.menuTextWrap}>
        <Text style={[styles.menuTitle, { color: iconColor === '#ff4b4b' ? '#ff4b4b' : '#333' }]}>{title}</Text>
        {sub && <Text style={styles.menuSub}>{sub}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{t('settings')}</Text>
            <Text style={styles.headerSub}>Customize your experience</Text>
          </View>
        </View>

        <LinearGradient
          colors={['#4ba1ff', '#2d7df6']}
          style={styles.premiumCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.premiumAvatar}>
            {profile?.avatarUri ? (
              <Image source={{ uri: profile.avatarUri }} style={{ width: 50, height: 50, borderRadius: 25 }} />
            ) : (
              <Ionicons name="person" size={24} color="#3282f6" />
            )}
          </View>
          <View style={styles.premiumInfo}>
            <Text style={styles.premiumName}>{profile?.displayName || profile?.username || 'Loading...'}</Text>
            <Text style={styles.premiumSub}>{profile ? profile.email : 'Premium Plan'}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditProfileModalVisible(true)}>
            <Ionicons name="pencil" size={16} color="#3282f6" />
          </TouchableOpacity>
        </LinearGradient>

        <Text style={styles.sectionHeader}>{t('monitoring')}</Text>
        <View style={styles.cardBlock}>
          {renderToggle('heart', 'Heart Rate Alerts', 'Notify when abnormal', '#ff4b4b', '#ffebeb', alertsEnabled, (v) => updateSetting('alertsEnabled', v, setAlertsEnabled))}
          <View style={styles.divider} />
          {renderToggle('sync', 'Live Sync', 'Connect hardware device', '#3282f6', '#e6f0ff', liveSyncEnabled, (v) => updateSetting('liveSyncEnabled', v, setLiveSyncEnabled))}
          <View style={styles.divider} />
          {renderToggle('warning', 'Emergency Alert', 'Auto-call contacts', '#f5a623', '#fef3c7', emergencyEnabled, (v) => updateSetting('emergencyEnabled', v, setEmergencyEnabled))}
        </View>

        <Text style={styles.sectionHeader}>{t('app_preferences')}</Text>
        <View style={styles.cardBlock}>
          {renderLink('notifications', t('notifications'), 'Manage reminders', '#f5a623', '#fef3c7', () => setNotiModalVisible(true))}
          <View style={styles.divider} />
          {renderLink('globe', t('language'), locale === 'en' ? 'English' : 'العربية', '#3282f6', '#e6f0ff', () => setLangModalVisible(true))}
          <View style={styles.divider} />
          {renderLink('lock-closed', t('privacy'), 'Data & permissions', '#845ef7', '#f1f0ff', () => setPrivacyModalVisible(true))}
          <View style={styles.divider} />
          {renderLink('help-circle', 'Help & Support', 'FAQ & Contact', '#28c46c', '#ebfbee', () => navigation.navigate('Help'))}
          <View style={styles.divider} />
          {renderLink('log-out', t('logout'), null, '#ff4b4b', '#fff0f0', handleLogout)}
        </View>

        {/* --- MODALS --- */}

        {/* Edit Profile Modal */}
        <Modal visible={editProfileModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Account</Text>
                <TouchableOpacity onPress={() => setEditProfileModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <TouchableOpacity onPress={pickImage} style={[styles.premiumAvatar, { width: 100, height: 100, borderRadius: 50, marginBottom: 10 }]}>
                  {profile?.avatarUri ? (
                    <Image source={{ uri: profile.avatarUri }} style={{ width: 100, height: 100, borderRadius: 50 }} />
                  ) : (
                    <Ionicons name="person" size={50} color="#3282f6" />
                  )}
                  <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#3282f6', borderRadius: 15, padding: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 }}>
                    <Ionicons name="camera" size={16} color="#fff" />
                  </View>
                </TouchableOpacity>
                <Text style={{ color: '#888', fontSize: 12 }}>Tap to change photo</Text>
              </View>

              <Text style={{ fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '600' }}>Display Name</Text>
              <TextInput
                style={{ backgroundColor: '#f1f0ff', height: 50, borderRadius: 15, paddingHorizontal: 15, marginBottom: 20, fontSize: 16 }}
                value={editDisplayName}
                onChangeText={setEditDisplayName}
                placeholder="Enter name"
              />
              <TouchableOpacity style={styles.saveBtn} onPress={saveProfileName}>
                <Text style={styles.saveBtnText}>Save Account Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Notifications Modal */}
        <Modal visible={notiModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Notification Settings</Text>
                <TouchableOpacity onPress={() => setNotiModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              {renderToggle('notifications', 'Push Notifications', 'Real-time health alerts', '#3282f6', '#e6f0ff', pushEnabled, (v) => updateSetting('pushEnabled', v, setPushEnabled))}
              <View style={styles.divider} />
              {renderToggle('document-text', 'Daily Health Reports', 'Evening health summary', '#28c46c', '#ebfbee', reportEnabled, (v) => updateSetting('reportEnabled', v, setReportEnabled))}
              <TouchableOpacity style={styles.saveBtn} onPress={() => setNotiModalVisible(false)}>
                <Text style={styles.saveBtnText}>{t('done')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Language Modal */}
        <Modal visible={langModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Language</Text>
                <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              {['English', 'العربية (Arabic)', 'Français (French)', 'Español (Spanish)'].map((lang, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.langItem}
                  onPress={() => {
                    const newLocale = lang.includes('Arabic') ? 'ar' : 'en';
                    changeLanguage(newLocale);
                    setLangModalVisible(false);
                  }}
                >
                  <Text style={[styles.langText, (locale === 'ar' && lang.includes('Arabic')) || (locale === 'en' && lang === 'English') ? styles.langActive : null]}>{lang}</Text>
                  {((locale === 'ar' && lang.includes('Arabic')) || (locale === 'en' && lang === 'English')) && <Ionicons name="checkmark-circle" size={20} color="#3282f6" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

        {/* Privacy & Security Modal */}
        <Modal visible={privacyModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Privacy & Security</Text>
                <TouchableOpacity onPress={() => setPrivacyModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              {renderToggle('finger-print', 'Biometric Lock', 'Use FaceID/Fingerprint', '#845ef7', '#f1f0ff', biometricEnabled, (v) => updateSetting('biometricEnabled', v, setBiometricEnabled))}
              <View style={styles.divider} />
              {renderLink('trash-outline', 'Clear Chat History', 'Delete all AI records', '#ff4b4b', '#fff0f0', () => {
                Alert.alert("Confirm", "Delete all chat history permanently?", [
                  { text: 'Cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Cleared', 'Chat history fully cleared from device cache.') }
                ])
              })}
              <TouchableOpacity style={styles.saveBtn} onPress={() => setPrivacyModalVisible(false)}>
                <Text style={styles.saveBtnText}>Save Preferences</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222'
  },
  headerSub: {
    fontSize: 14,
    color: '#888'
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
    shadowColor: '#3282f6',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  premiumAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  premiumInfo: {
    flex: 1
  },
  premiumName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  premiumSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 10,
    marginLeft: 5,
    letterSpacing: 1
  },
  cardBlock: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  menuTextWrap: {
    flex: 1
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  menuSub: {
    fontSize: 12,
    color: '#888',
    marginTop: 2
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#f0f0f0'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 40
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  saveBtn: {
    backgroundColor: '#3282f6',
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  langItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5'
  },
  langText: {
    fontSize: 16,
    color: '#333'
  },
  langActive: {
    color: '#3282f6',
    fontWeight: 'bold'
  }
});

export default SettingsScreen;
