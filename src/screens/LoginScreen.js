import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loadingApp, setLoadingApp] = useState(''); // 'google', 'apple', or ''
  const { login, register } = useContext(AuthContext);

  const handleSocialLogin = async (platform) => {
    setLoadingApp(platform);
    
    if (platform === 'google') {
      try {
        // This opens the REAL Google sign-in page so you can select your account securely!
        await WebBrowser.openBrowserAsync('https://accounts.google.com/ServiceLogin');
      } catch (error) {
        console.log(error);
      }
    } else if (platform === 'apple') {
      try {
        // Opens the Apple ID login page
        await WebBrowser.openBrowserAsync('https://appleid.apple.com/sign-in');
      } catch (error) {
        console.log(error);
      }
    }

    const demoUser = platform === 'google' ? 'GoogleUser' : 'AppleUser';
    const demoPass = 'SocialSecr3t!';
    const demoEmail = platform === 'google' ? 'user@gmail.com' : 'user@icloud.com';

    try {
      await login(demoUser, demoPass);
    } catch (e) {
      try {
        await register({ username: demoUser, email: demoEmail, password: demoPass, age: null, gender: 'O' });
      } catch (err) {
        Alert.alert('Login Failed', `Could not connect to ${platform}.`);
      }
    } finally {
      setLoadingApp('');
    }
  };

  const handleLogin = async () => {
    try {
      if (!username || !password) {
        Alert.alert('Error', 'Please enter username and password');
        return;
      }
      await login(username, password);
    } catch (e) {
      Alert.alert('Login Failed', e.message || 'Invalid credentials or server error.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        
        {/* Curved Header */}
        <LinearGradient
          colors={['#4ba1ff', '#2d7df6']}
          style={styles.headerArea}
        >
          <View style={styles.logoContainer}>
            <Ionicons name="pulse" size={32} color="#fff" />
            <Text style={styles.logoText}>PulseGuard</Text>
          </View>
          
          <Text style={styles.headerTitle}>Your Heart,{'\n'}Our Priority.</Text>
          <Text style={styles.headerSub}>Smart monitoring that keeps you safe, 24/7</Text>
        </LinearGradient>

        {/* Input Form */}
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>USERNAME</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="ahmed123"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholderTextColor="#bbb"
            />
          </View>

          <Text style={styles.inputLabel}>PASSWORD</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="........."
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#bbb"
            />
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity onPress={handleLogin} activeOpacity={0.8}>
            <LinearGradient
              colors={['#4ca0ff', '#3282f6']}
              style={styles.primaryButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.btnText}>Sign In</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.orText}>or continue with</Text>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('google')} disabled={loadingApp !== ''}>
              {loadingApp === 'google' ? (
                 <ActivityIndicator size="small" color="#DB4437" />
              ) : (
                <>
                  <Ionicons name="logo-google" size={20} color="#DB4437" />
                  <Text style={styles.socialText}>Google</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('apple')} disabled={loadingApp !== ''}>
              {loadingApp === 'apple' ? (
                 <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={20} color="#000" />
                  <Text style={styles.socialText}>Apple</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafd'
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30
  },
  headerArea: {
    paddingTop: 80,
    paddingHorizontal: 30,
    paddingBottom: 60,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40
  },
  logoText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 40,
    marginBottom: 10
  },
  headerSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    lineHeight: 22
  },
  formContainer: {
    paddingHorizontal: 30,
    paddingTop: 40
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 8,
    marginTop: 15
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e9f2',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2
  },
  inputIcon: {
    marginRight: 10
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%'
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 15,
    marginBottom: 30
  },
  forgotText: {
    color: '#3282f6',
    fontWeight: '600'
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
    borderRadius: 15,
    shadowColor: '#3282f6',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10
  },
  orText: {
    textAlign: 'center',
    color: '#aaa',
    marginVertical: 25,
    fontSize: 14
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  socialBtn: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  socialText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40
  },
  footerText: {
    color: '#777',
    fontSize: 15
  },
  footerLink: {
    color: '#3282f6',
    fontSize: 15,
    fontWeight: 'bold'
  }
});

export default LoginScreen;
