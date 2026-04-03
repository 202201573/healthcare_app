import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const DashboardScreen = () => {
  const [healthData, setHealthData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHealthData();
  }, []);

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

  return (
    <View style={styles.container}>
      {/* Small Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <LinearGradient colors={['#e6f0ff', '#e6f0ff']} style={styles.dateBadge}>
          <Text style={styles.dateText}>Feb 23</Text>
        </LinearGradient>
      </View>
      <Text style={styles.headerSub}>Today's health overview</Text>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchHealthData} />}
      >
        {/* Risk Level Banner */}
        <LinearGradient
          colors={['#ff6b6b', '#ff4b4b']}
          style={styles.riskBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.riskRow}>
            <View style={styles.riskIconCircle}>
              <Ionicons name="pulse" size={24} color="#ff4b4b" />
            </View>
            <View style={styles.riskInfo}>
              <Text style={styles.riskLabel}>RISK LEVEL</Text>
              <Text style={styles.riskTitle}>Low Risk ✓</Text>
              <Text style={styles.riskDesc}>All vitals within normal range</Text>
            </View>
            <View style={styles.riskValueBox}>
              <Text style={styles.riskValueBig}>{healthData ? healthData.heart_rate : '86'}</Text>
              <Text style={styles.riskValueSmall}>bpm now</Text>
            </View>
          </View>
        </LinearGradient>

        {/* 2x2 Vitals Grid */}
        <View style={styles.gridRow}>
          {/* Heart Rate */}
          <View style={styles.gridCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrap, {backgroundColor: '#ffebeb'}]}>
                <Ionicons name="heart" size={20} color="#ff4b4b" />
              </View>
              <View style={[styles.trendBadge, {backgroundColor: '#e5f8ed'}]}>
                <Text style={[styles.trendText, {color: '#28c46c'}]}>+2%</Text>
              </View>
            </View>
            <Text style={styles.cardValue}>{healthData ? healthData.heart_rate : '86'} <Text style={styles.cardUnit}>bpm</Text></Text>
            <Text style={styles.cardLabel}>Heart Rate</Text>
          </View>

          {/* Blood Pressure */}
          <View style={styles.gridCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrap, {backgroundColor: '#e6f0ff'}]}>
                <Ionicons name="water" size={20} color="#3282f6" />
              </View>
              <View style={[styles.trendBadge, {backgroundColor: '#fff0f0'}]}>
                <Text style={[styles.trendText, {color: '#ff4b4b'}]}>-1%</Text>
              </View>
            </View>
            <Text style={styles.cardValue}>{healthData ? `${healthData.blood_pressure_sys}/${healthData.blood_pressure_dia}` : '120/80'}</Text>
            <Text style={styles.cardLabel}>Blood Pressure</Text>
          </View>
        </View>

        <View style={styles.gridRow}>
          {/* SpO2 */}
          <View style={styles.gridCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrap, {backgroundColor: '#ebfbee'}]}>
                <Ionicons name="leaf" size={20} color="#28c46c" />
              </View>
              <View style={[styles.trendBadge, {backgroundColor: '#e5f8ed'}]}>
                <Text style={[styles.trendText, {color: '#28c46c'}]}>+5%</Text>
              </View>
            </View>
            <Text style={styles.cardValue}>{healthData ? healthData.sp02 : '98'} <Text style={styles.cardUnit}>%</Text></Text>
            <Text style={styles.cardLabel}>SpO2</Text>
          </View>

          {/* Temp */}
          <View style={styles.gridCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrap, {backgroundColor: '#fef3c7'}]}>
                <Ionicons name="thermometer" size={20} color="#d97706" />
              </View>
              <View style={[styles.trendBadge, {backgroundColor: '#e5f8ed'}]}>
                <Text style={[styles.trendText, {color: '#28c46c'}]}>Norm</Text>
              </View>
            </View>
            <Text style={styles.cardValue}>{healthData ? healthData.temperature : '36.6'} <Text style={styles.cardUnit}>°C</Text></Text>
            <Text style={styles.cardLabel}>Temp</Text>
          </View>
        </View>

        {/* Weekly Trend Chart (Mockup representation) */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weekly Heart Rate Trend</Text>
          <View style={styles.barsContainer}>
            <View style={styles.barWrap}><View style={[styles.bar, {height: 40, backgroundColor: '#e5ecf6'}]} /><Text style={styles.barLabel}>Mon</Text></View>
            <View style={styles.barWrap}><View style={[styles.bar, {height: 60, backgroundColor: '#e5ecf6'}]} /><Text style={styles.barLabel}>Tue</Text></View>
            <View style={styles.barWrap}><View style={[styles.bar, {height: 50, backgroundColor: '#e5ecf6'}]} /><Text style={styles.barLabel}>Wed</Text></View>
            <View style={styles.barWrap}><View style={[styles.bar, {height: 80, backgroundColor: '#ffb3b3'}]} /><Text style={styles.barLabel}>Thu</Text></View>
            <View style={styles.barWrap}><View style={[styles.bar, {height: 45, backgroundColor: '#e5ecf6'}]} /><Text style={styles.barLabel}>Fri</Text></View>
            <View style={styles.barWrap}><View style={[styles.bar, {height: 90, backgroundColor: '#3282f6'}]} /><Text style={[styles.barLabel, {color: '#3282f6', fontWeight: 'bold'}]}>Sat</Text></View>
            <View style={styles.barWrap}><View style={[styles.bar, {height: 55, backgroundColor: '#e5ecf6'}]} /><Text style={styles.barLabel}>Sun</Text></View>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionsRow}>
          <View style={styles.actionCard}>
            <View style={[styles.iconWrap, {backgroundColor: '#fff7e6'}]}>
              <Ionicons name="document-text" size={24} color="#ffa94d" />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>Fill Records</Text>
              <Text style={styles.actionSub}>Update info</Text>
            </View>
          </View>
          <View style={styles.actionCard}>
            <View style={[styles.iconWrap, {backgroundColor: '#ebfbee'}]}>
              <Ionicons name="time" size={24} color="#40c057" />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>History</Text>
              <Text style={styles.actionSub}>All data</Text>
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
    backgroundColor: '#f5f7fa',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000'
  },
  dateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15
  },
  dateText: {
    color: '#3282f6',
    fontWeight: 'bold',
    fontSize: 14
  },
  headerSub: {
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#888',
    marginBottom: 20
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  riskBanner: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#ff4b4b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8
  },
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  riskIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  riskInfo: {
    flex: 1
  },
  riskLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1
  },
  riskTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 2
  },
  riskDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12
  },
  riskValueBox: {
    alignItems: 'flex-end'
  },
  riskValueBig: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold'
  },
  riskValueSmall: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  gridCard: {
    width: '47.5%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  trendText: {
    fontSize: 10,
    fontWeight: 'bold'
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#222',
  },
  cardUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#888'
  },
  cardLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 5
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginTop: 5,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120
  },
  barWrap: {
    alignItems: 'center'
  },
  bar: {
    width: 25,
    borderRadius: 6,
    marginBottom: 10
  },
  barLabel: {
    fontSize: 11,
    color: '#aaa'
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  actionCard: {
    width: '47.5%',
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2
  },
  actionTextWrap: {
    marginLeft: 10
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333'
  },
  actionSub: {
    fontSize: 11,
    color: '#888'
  }
});

export default DashboardScreen;
