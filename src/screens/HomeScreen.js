import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const HomeScreen = () => {
  const [profile, setProfile] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchHealthData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const profileRes = await api.get('user/profile/');
      setProfile(profileRes.data);
      fetchHealthData();
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHealthData = async () => {
    try {
      const response = await api.get('health/data/');
      if (response.data.length > 0) {
        setHealthData(response.data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Blue Header Section */}
        <LinearGradient
          colors={['#4ba1ff', '#2d7df6']}
          style={styles.headerArea}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greetingText}>Good morning,</Text>
              <Text style={styles.nameText}>{profile ? profile.username : 'User'} 👋</Text>
            </View>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={24} color="#3282f6" />
            </View>
          </View>
        </LinearGradient>

        <View style={styles.contentArea}>
          {/* Main Heart Rate Card */}
          <View style={styles.mainCard}>
            <View style={styles.mainCardHeader}>
              <Text style={styles.mainCardTitle}>LIVE HEART RATE</Text>
              <View style={[styles.statusBadge, {backgroundColor: healthData?.status === 'normal' || !healthData ? '#e5f8ed' : '#ffe1e1'}]}>
                <View style={[styles.statusDot, {backgroundColor: healthData?.status === 'normal' || !healthData ? '#28c46c' : '#ff4b4b'}]} />
                <Text style={[styles.statusText, {color: healthData?.status === 'normal' || !healthData ? '#28c46c' : '#ff4b4b'}]}>
                  {healthData ? healthData.status : 'Normal'}
                </Text>
              </View>
            </View>

            <View style={styles.bpmContainer}>
              <Text style={styles.bpmValue}>{healthData ? healthData.heart_rate : '--'}</Text>
              <Text style={styles.bpmLabel}>bpm</Text>
            </View>
            
            {/* Simulated wave */}
            <View style={styles.waveGraphic}>
              <Ionicons name="pulse" size={40} color="#3282f6" style={{opacity: 0.6}} />
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, {color: '#3282f6'}]}>72</Text>
                <Text style={styles.statLabel}>Min BPM</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, {color: '#ff4b4b'}]}>112</Text>
                <Text style={styles.statLabel}>Max BPM</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, {color: '#28c46c'}]}>7h 30m</Text>
                <Text style={styles.statLabel}>Sleep</Text>
              </View>
            </View>
          </View>

          {/* 3 Value Widgets */}
          <View style={styles.widgetsRow}>
            <View style={styles.widgetCard}>
              <View style={[styles.iconCircle, {backgroundColor: '#fff0f0'}]}>
                <Ionicons name="flame" size={20} color="#ff6b6b" />
              </View>
              <Text style={styles.widgetValue}>2100</Text>
              <Text style={styles.widgetLabel}>Calories</Text>
            </View>
            <View style={styles.widgetCard}>
              <View style={[styles.iconCircle, {backgroundColor: '#f1f0ff'}]}>
                <Ionicons name="footsteps" size={20} color="#845ef7" />
              </View>
              <Text style={styles.widgetValue}>8500</Text>
              <Text style={styles.widgetLabel}>Steps</Text>
            </View>
            <View style={styles.widgetCard}>
              <View style={[styles.iconCircle, {backgroundColor: '#e6f3ff'}]}>
                <Ionicons name="water" size={20} color="#339af0" />
              </View>
              <Text style={styles.widgetValue}>1.8L</Text>
              <Text style={styles.widgetLabel}>Water</Text>
            </View>
          </View>

          {/* Elevated heart rate banner (conditionally render or mock) */}
          {healthData && healthData.status !== 'normal' && (
            <View style={styles.alertBanner}>
              <View style={styles.alertIcon}>
                <Ionicons name="warning" size={20} color="#fff" />
              </View>
              <View style={styles.alertInfo}>
                <Text style={styles.alertTitle}>Elevated Heart Rate Detected</Text>
                <Text style={styles.alertTime}>Just now - {healthData.heart_rate} bpm</Text>
              </View>
            </View>
          )}

          <View style={styles.appointmentsHeader}>
            <Text style={styles.sectionTitle}>Appointments</Text>
            <Text style={styles.viewAllText}>View All</Text>
          </View>

          <View style={styles.appointmentCard}>
            <View style={styles.apptIconCircle}>
              <Ionicons name="medical" size={24} color="#3282f6" />
            </View>
            <View style={styles.apptDetails}>
              <Text style={styles.docName}>Dr. Sarah</Text>
              <Text style={styles.docSpec}>Cardiologist</Text>
            </View>
            <View style={styles.apptTimeBlock}>
              <Text style={styles.apptTime}>10:30 AM</Text>
              <Text style={styles.apptDay}>Tomorrow</Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa'
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30
  },
  headerArea: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 90,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  greetingText: {
    fontSize: 16,
    color: '#e6f0ff'
  },
  nameText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  contentArea: {
    paddingHorizontal: 20,
    marginTop: -60
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  mainCardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize'
  },
  bpmContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 15
  },
  bpmValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#222'
  },
  bpmLabel: {
    fontSize: 18,
    color: '#666',
    marginLeft: 5,
    fontWeight: '600'
  },
  waveGraphic: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: '#f0f0f0'
  },
  statItem: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2
  },
  widgetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  widgetCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  widgetValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  widgetLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2
  },
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: '#ffebeb',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#ff4b4b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  alertInfo: {
    flex: 1
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d12e2e'
  },
  alertTime: {
    fontSize: 12,
    color: '#e55b5b',
    marginTop: 2
  },
  appointmentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  viewAllText: {
    fontSize: 14,
    color: '#3282f6',
    fontWeight: '600'
  },
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2
  },
  apptIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eaf2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  apptDetails: {
    flex: 1
  },
  docName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  docSpec: {
    fontSize: 13,
    color: '#888'
  },
  apptTimeBlock: {
    alignItems: 'flex-end'
  },
  apptTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3282f6'
  },
  apptDay: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 2
  }
});

export default HomeScreen;
