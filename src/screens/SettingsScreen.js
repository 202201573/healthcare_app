import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

const SettingsScreen = ({ navigation }) => {
  const { logout } = useContext(AuthContext);
  
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [liveSyncEnabled, setLiveSyncEnabled] = useState(true);
  const [emergencyEnabled, setEmergencyEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to exit?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout }
    ]);
  };

  const renderToggle = (icon, title, sub, iconColor, bg, value, onValueChange) => (
    <View style={styles.menuItem}>
      <View style={[styles.menuIconWrap, {backgroundColor: bg}]}>
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
      <View style={[styles.menuIconWrap, {backgroundColor: bg}]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.menuTextWrap}>
        <Text style={[styles.menuTitle, {color: iconColor === '#ff4b4b' ? '#ff4b4b' : '#333'}]}>{title}</Text>
        {sub && <Text style={styles.menuSub}>{sub}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 15}}>
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Settings</Text>
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
            <Ionicons name="person" size={24} color="#3282f6" />
          </View>
          <View style={styles.premiumInfo}>
            <Text style={styles.premiumName}>User Account</Text>
            <Text style={styles.premiumSub}>Premium Plan ✦</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
             <Ionicons name="pencil" size={16} color="#3282f6" />
          </TouchableOpacity>
        </LinearGradient>

        <Text style={styles.sectionHeader}>MONITORING</Text>
        <View style={styles.cardBlock}>
          {renderToggle('heart', 'Heart Rate Alerts', 'Notify when abnormal', '#ff4b4b', '#ffebeb', alertsEnabled, setAlertsEnabled)}
          <View style={styles.divider} />
          {renderToggle('sync', 'Live Sync', 'Connect hardware device', '#3282f6', '#e6f0ff', liveSyncEnabled, setLiveSyncEnabled)}
          <View style={styles.divider} />
          {renderToggle('warning', 'Emergency Alert', 'Auto-call contacts', '#f5a623', '#fef3c7', emergencyEnabled, setEmergencyEnabled)}
        </View>

        <Text style={styles.sectionHeader}>APP PREFERENCES</Text>
        <View style={styles.cardBlock}>
          {renderLink('notifications', 'Notifications', 'Manage reminders', '#f5a623', '#fef3c7')}
          <View style={styles.divider} />
          {renderLink('globe', 'Language', 'English', '#3282f6', '#e6f0ff')}
          <View style={styles.divider} />
          {renderLink('lock-closed', 'Privacy & Security', 'Data & permissions', '#845ef7', '#f1f0ff')}
          <View style={styles.divider} />
          {renderLink('help-circle', 'Help & Support', 'FAQ & Contact', '#28c46c', '#ebfbee', () => navigation.navigate('Help'))}
          <View style={styles.divider} />
          {renderLink('log-out', 'Sign Out', null, '#ff4b4b', '#fff0f0', handleLogout)}
        </View>

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
  }
});

export default SettingsScreen;
