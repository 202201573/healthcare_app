import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, Vibration } from 'react-native';
import * as Audio from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import api from '../services/api';
import { LanguageContext } from '../context/LanguageContext';

const DashboardScreen = () => {
  const { t } = useContext(LanguageContext);
  const [healthData, setHealthData] = useState(null);
  const [allHistory, setAllHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [entryModalVisible, setEntryModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Analytics State
  const [pulseScore, setPulseScore] = useState(94);
  const [aiInsight, setAiInsight] = useState('Your health is looking great! No major risks detected today.');

  // Form State
  const [formData, setFormData] = useState({
    heart_rate: '80',
    blood_pressure_sys: '120',
    blood_pressure_dia: '80',
    sp02: '98',
    temperature: '36.6'
  });

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    try {
      const response = await api.get('health/data/');
      setAllHistory(response.data);
      if (response.data.length > 0) {
        setHealthData(response.data[0]);
        calculateAnalytics(response.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const calculateAnalytics = (data) => {
    if (data.length === 0) return;

    // Pulse Score Calculation (Start with 100)
    let score = 100;
    const recent = data.slice(0, 10); // Take last 10 readings
    
    recent.forEach(item => {
        if (item.status === 'critical') score -= 12;
        if (item.status === 'warning') score -= 5;
    });

    // Check average heart rate
    const avgHr = recent.reduce((sum, item) => sum + item.heart_rate, 0) / recent.length;
    if (avgHr > 100 || avgHr < 60) score -= 10;

    // Ensure score stays between 0 and 100
    const finalScore = Math.max(0, Math.min(100, score));
    setPulseScore(finalScore);

    // AI Insight Logic
    let insight = "Your vital trends are stable. Keep following your daily routine.";
    if (finalScore < 60) {
        insight = "Attention: Multiple high-risk events detected recently. Consult your doctor.";
    } else if (finalScore < 85) {
        insight = "Slight instability in your heart rate. Try to rest and stay hydrated.";
    } else if (avgHr > 110) {
        insight = "High resting heart rate detected. Avoid caffeine and intense exercise.";
    }
    setAiInsight(insight);
  };

  const handleManualEntry = async () => {
    setIsSubmitting(true);
    try {
      // Basic risk assessment for UI
      const hr = parseInt(formData.heart_rate);
      const spo2 = parseInt(formData.sp02);
      let status = 'normal';
      if (hr > 100 || hr < 60 || spo2 < 95) status = 'warning';
      if (hr > 120 || hr < 50 || spo2 < 90) status = 'critical';

      if (status !== 'normal') {
        // Continuous Alarm Logic
        if (status === 'critical') {
            // Looping Vibration: [wait, vibrate, wait, vibrate...]
            const pattern = [500, 500, 500, 500]; 
            Vibration.vibrate(pattern, true); // true = LOOP
        } else {
            // Single Warning Vibration
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }

        Alert.alert(
          status === 'critical' ? "🚨 CRITICAL RISK DETECTED!" : "Health Warning",
          `Your heart rate (${hr} bpm) is outside the healthy range. Please rest and monitor your condition closely.`,
          [{ 
            text: "I Understand", 
            style: "destructive",
            onPress: () => {
                Vibration.cancel(); // STOPS the looping alarm
            }
          }],
          { cancelable: false } // Force user to click button
        );
      }

      await api.post('health/data/', {
        ...formData,
        heart_rate: parseInt(formData.heart_rate),
        blood_pressure_sys: parseInt(formData.blood_pressure_sys),
        blood_pressure_dia: parseInt(formData.blood_pressure_dia),
        sp02: parseInt(formData.sp02),
        temperature: parseFloat(formData.temperature),
        status: status
      });
      
      Alert.alert("Success", "Health record saved!");
      setEntryModalVisible(false);
      fetchHealthData();
    } catch (e) {
      Alert.alert("Error", "Could not save record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const riskHistory = allHistory.filter(item => item.status !== 'normal');

  return (
    <View style={styles.container}>
      {/* Small Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('dashboard')}</Text>
        <LinearGradient colors={['#e6f0ff', '#e6f0ff']} style={styles.dateBadge}>
          <Text style={styles.dateText}>{dateStr}</Text>
        </LinearGradient>
      </View>
      <Text style={styles.headerSub}>{t('health_overview')}</Text>

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
              <Text style={styles.riskLabel}>{t('risk_level')}</Text>
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

        {/* Smart AI Analytics Section */}
        <View style={styles.analyticsTitleCard}>
          <Ionicons name="analytics" size={20} color="#3282f6" />
          <Text style={styles.analyticsTitleText}>Smart Health Analytics</Text>
        </View>

        <LinearGradient
            colors={['#fff', '#f8fbff']}
            style={styles.analyticsCard}
        >
            <View style={styles.scoreRow}>
                <View style={styles.scoreLeft}>
                   <Text style={styles.scoreSubTitle}>{t('pulse_score')}</Text>
                   <Text style={[styles.scoreValueBig, {color: pulseScore > 80 ? '#28c46c' : (pulseScore > 50 ? '#f59f00' : '#ff4b4b')}]}>
                       {pulseScore}
                   </Text>
                   <Text style={styles.scoreOutOf}>/100 points</Text>
                </View>
                <View style={styles.scoreRight}>
                    <View style={[styles.pulseCircle, {borderColor: pulseScore > 80 ? '#e5f8ed' : (pulseScore > 50 ? '#fff9db' : '#ffebeb')}]}>
                        <Ionicons name="shield-checkmark" size={32} color={pulseScore > 80 ? '#28c46c' : (pulseScore > 50 ? '#f59f00' : '#ff4b4b')} />
                    </View>
                </View>
            </View>

            <View style={styles.insightBox}>
                <View style={styles.insightHeader}>
                    <Ionicons name="sparkles" size={16} color="#3282f6" />
                    <Text style={styles.insightHeaderText}>AI INSIGHT</Text>
                </View>
                <Text style={styles.insightText}>{aiInsight}</Text>
            </View>
        </LinearGradient>

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
          <TouchableOpacity style={styles.actionCard} onPress={() => setEntryModalVisible(true)}>
            <View style={[styles.iconWrap, {backgroundColor: '#fff7e6'}]}>
              <Ionicons name="document-text" size={24} color="#ffa94d" />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>Fill Records</Text>
              <Text style={styles.actionSub}>Update info</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => setHistoryModalVisible(true)}>
            <View style={[styles.iconWrap, {backgroundColor: '#ebfbee'}]}>
              <Ionicons name="time" size={24} color="#40c057" />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>History</Text>
              <Text style={styles.actionSub}>All data</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* History Modal */}
        <Modal visible={historyModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.historyBox}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Risk History</Text>
                    <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                        <Ionicons name="close-circle" size={28} color="#ccc" />
                    </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={{paddingBottom: 20}}>
                    {riskHistory.length > 0 ? riskHistory.map((item, idx) => (
                        <View key={idx} style={styles.historyItem}>
                           <View style={[styles.historyIcon, {backgroundColor: item.status === 'critical' ? '#ffebeb' : '#fff9db'}]}>
                               <Ionicons name="warning" size={20} color={item.status === 'critical' ? '#ff4b4b' : '#f59f00'} />
                           </View>
                           <View style={{flex: 1}}>
                               <Text style={styles.historyTitleText}>{item.status.toUpperCase()} ALERT</Text>
                               <Text style={styles.historySubText}>{new Date(item.timestamp).toLocaleString()}</Text>
                               <Text style={styles.historyDetail}>Heat Rate: {item.heart_rate} bpm | SpO2: {item.sp02}%</Text>
                           </View>
                        </View>
                    )) : (
                        <View style={{alignItems: 'center', marginTop: 40}}>
                           <Ionicons name="shield-checkmark" size={60} color="#e5f8ed" />
                           <Text style={{color: '#888', marginTop: 10}}>No high risk records found.</Text>
                        </View>
                    )}
                </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Data Entry Modal */}
        <Modal visible={entryModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.entryBox}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>New Health Record</Text>
                    <TouchableOpacity onPress={() => setEntryModalVisible(false)}>
                        <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
                
                <ScrollView>
                    <View style={styles.formItem}>
                        <Text style={styles.inputLabel}>Heart Rate (bpm)</Text>
                        <TextInput 
                            style={styles.input} 
                            keyboardType="numeric" 
                            value={formData.heart_rate} 
                            onChangeText={t => setFormData({...formData, heart_rate: t})}
                        />
                    </View>
                    <View style={styles.formRow}>
                        <View style={[styles.formItem, {width: '48%'}]}>
                            <Text style={styles.inputLabel}>BP Systolic</Text>
                            <TextInput 
                                style={styles.input} 
                                keyboardType="numeric" 
                                value={formData.blood_pressure_sys} 
                                onChangeText={t => setFormData({...formData, blood_pressure_sys: t})}
                            />
                        </View>
                        <View style={[styles.formItem, {width: '48%'}]}>
                            <Text style={styles.inputLabel}>BP Diastolic</Text>
                            <TextInput 
                                style={styles.input} 
                                keyboardType="numeric" 
                                value={formData.blood_pressure_dia} 
                                onChangeText={t => setFormData({...formData, blood_pressure_dia: t})}
                            />
                        </View>
                    </View>
                    <View style={styles.formItem}>
                        <Text style={styles.inputLabel}>SpO2 (%)</Text>
                        <TextInput 
                            style={styles.input} 
                            keyboardType="numeric" 
                            value={formData.sp02} 
                            onChangeText={t => setFormData({...formData, sp02: t})}
                        />
                    </View>
                    <View style={styles.formItem}>
                        <Text style={styles.inputLabel}>Temperature (°C)</Text>
                        <TextInput 
                            style={styles.input} 
                            keyboardType="numeric" 
                            value={formData.temperature} 
                            onChangeText={t => setFormData({...formData, temperature: t})}
                        />
                    </View>

                    <TouchableOpacity 
                        style={styles.saveBtn} 
                        onPress={handleManualEntry}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Records</Text>}
                    </TouchableOpacity>
                </ScrollView>
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
  analyticsTitleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5
  },
  analyticsTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333'
  },
  analyticsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eef3f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  scoreLeft: {
    flex: 1
  },
  scoreSubTitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
    fontWeight: '600'
  },
  scoreValueBig: {
    fontSize: 42,
    fontWeight: '900'
  },
  scoreOutOf: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 2
  },
  scoreRight: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pulseCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 8,
      justifyContent: 'center',
      alignItems: 'center'
  },
  insightBox: {
      backgroundColor: '#f0f7ff',
      borderRadius: 15,
      padding: 15,
      borderWidth: 1,
      borderColor: '#d0e5ff'
  },
  insightHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5
  },
  insightHeaderText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#3282f6',
      marginLeft: 5,
      letterSpacing: 1
  },
  insightText: {
      fontSize: 13,
      color: '#444',
      lineHeight: 18
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  historyBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '70%',
    padding: 25
  },
  entryBox: {
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222'
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  historyTitleText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#666'
  },
  historySubText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 2
  },
  historyDetail: {
    fontSize: 12,
    color: '#888'
  },
  formItem: {
    marginBottom: 15
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    fontSize: 16
  },
  saveBtn: {
    backgroundColor: '#3282f6',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#3282f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default DashboardScreen;
