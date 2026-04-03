import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [healthData, setHealthData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const profileRes = await api.get('user/profile/');
      setProfile(profileRes.data);

      const healthRes = await api.get('health/data/');
      if (healthRes.data.length > 0) {
        setHealthData(healthRes.data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isHealthy = healthData?.status === 'normal' || !healthData;

  const renderMenuItem = (icon, title, sub, iconColor, bg) => (
    <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
      <View style={[styles.menuIconWrap, {backgroundColor: bg}]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.menuTextWrap}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSub}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Curved Header & Profile Card */}
        <LinearGradient
          colors={['#4ba1ff', '#2d7df6']}
          style={styles.headerArea}
        >
          <View style={styles.headerTop}>
             <Text style={styles.headerTitle}></Text>
             <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                <Ionicons name="settings-outline" size={24} color="#fff" />
             </TouchableOpacity>
          </View>

          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={50} color="#3282f6" />
            </View>
          </View>

          <Text style={styles.userName}>{profile ? profile.username : 'User Name'}</Text>
          <Text style={styles.userEmail}>{profile ? profile.email : 'user@example.com'}</Text>

          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>Premium Member ✦</Text>
          </View>
        </LinearGradient>

        <View style={styles.contentArea}>
          
          <View style={styles.statsCard}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{healthData ? healthData.heart_rate : '86'}</Text>
              <Text style={styles.statLabel}>Avg BPM</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{profile && profile.age ? profile.age : '28'}</Text>
              <Text style={styles.statLabel}>Age</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBox}>
              <Text style={[styles.statVal, {color: isHealthy ? '#222' : '#ff4b4b'}]}>{isHealthy ? 'Low' : 'High'}</Text>
              <Text style={styles.statLabel}>Risk Level</Text>
            </View>
          </View>

          <View style={[styles.healthyBanner, {backgroundColor: isHealthy ? '#eafcf0' : '#ffebeb', borderColor: isHealthy ? '#c3f5d5' : '#ffcaca'}]}>
             <View style={[styles.statusIcon, {backgroundColor: isHealthy ? '#28c46c' : '#ff4b4b'}]}>
               <Ionicons name={isHealthy ? "checkmark" : "warning"} size={20} color="#fff" />
             </View>
             <View>
               <Text style={[styles.healthyTitle, {color: isHealthy ? '#1b8a47' : '#d12e2e'}]}>
                 {isHealthy ? 'All Vitals Healthy' : 'Elevated Vitals'}
               </Text>
               <Text style={[styles.healthySub, {color: isHealthy ? '#28c46c' : '#ff4b4b'}]}>Last check: Today 9:41 AM</Text>
             </View>
          </View>

          <View style={styles.menuContainer}>
             {renderMenuItem('person-circle', 'Personal Info', 'Age, weight, medical history', '#3282f6', '#e6f0ff')}
             {renderMenuItem('heart', 'Heart History', 'All recorded readings', '#ff4b4b', '#ffebeb')}
             {renderMenuItem('document-text', 'Medical Records', 'Upload & manage documents', '#f5a623', '#fef3c7')}
             {renderMenuItem('people', 'Emergency Contacts', '3 contacts saved', '#28c46c', '#ebfbee')}
          </View>

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
    flexGrow: 1,
    paddingBottom: 40
  },
  headerArea: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 70,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center'
  },
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold'
  },
  avatarContainer: {
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 50,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    alignItems: 'center'
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 15
  },
  premiumBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20
  },
  premiumText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  contentArea: {
    paddingHorizontal: 20,
    marginTop: -40
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20
  },
  statBox: {
    alignItems: 'center',
    width: '30%'
  },
  statVal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222'
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 5
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#eee'
  },
  healthyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 25
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  healthyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2
  },
  healthySub: {
    fontSize: 12
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
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
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5'
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
    marginTop: 3
  }
});

export default ProfileScreen;
