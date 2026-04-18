import { Alert } from 'react-native';

const Notifications = null;


export const HardwareService = {

  async requestNotificationPermissions() {
    if (!Notifications) {
      console.log("Hardware modules not available.");
      return true;
    }
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  async sendImmediateTestNotification() {
    if (!Notifications) {
      Alert.alert('Notifications', 'Push Notifications are enabled (Mock Mode).');
      return;
    }
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Medical PulseGuard AI 🏥",
          body: "Notifications are active! Your health alerts will appear here.",
          sound: true,
          priority: 'high',
        },
        trigger: null,
      });
    } catch (e) {
      console.error(e);
    }
  },

  async scheduleDailyReport() {
    if (!Notifications) {
      Alert.alert('Notifications', 'Daily Health Report scheduled (Mock Mode).');
      return;
    }
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Daily Health Summary 📊",
          body: "Your daily health report is ready. Tap to view your trend.",
          sound: true,
        },
        trigger: {
          hour: 20,
          minute: 0,
          repeats: true,
        },
      });
      Alert.alert('Success', 'Daily Health Report scheduled for 8:00 PM.');
    } catch (e) {
      console.error(e);
    }
  },

  async cancelAllNotifications() {
    if (Notifications) {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  }
};
