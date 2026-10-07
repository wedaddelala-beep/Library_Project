import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, SafeAreaView, useWindowDimensions, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🌐 رابط الخادم المحلي للاتصال المباشر من الهاتف أو المتصفح
const API_BASE_URL = 'http://172.20.10.3:5000';

export default function App() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const router = useRouter();

  // حالة اللغة والمدخلات
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // حالات التحميل والأخطاء
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // نصوص الواجهة باللغتين
  const t = {
    welcomeAr: lang === 'ar' ? 'مرحباً بكم في موقع مكتبة العلوم 📚✨' : 'Welcome to Science Library System 📚✨',
    welcomeEn: lang === 'ar' ? 'كلية العلوم - جامعة الزنتان' : 'Faculty of Science - Zentan University',
    loginTab: lang === 'ar' ? 'تسجيل الدخول' : 'Sign In',
    userLabel: lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address',
    userPlaceholder: lang === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email',
    passLabel: lang === 'ar' ? 'كلمة المرور' : 'Password',
    passPlaceholder: '••••••••',
    loginBtn: lang === 'ar' ? 'دخول' : 'Login',
    forgotPass: lang === 'ar' ? 'هل نسيت كلمة المرور؟' : 'Forgot Password?',
    libraryTitle: lang === 'ar' ? 'مكتبة كلية العلوم' : 'Faculty of Science Library',
    librarySubTitle: 'ZENTAN UNIVERSITY FACULTY OF SCIENCE LIBRARY',
  };

  // دالة تسجيل الدخول
  const handleLogin = async () => {
    setErrorMessage('');
    
    if (!username.trim() || !password.trim()) {
      setErrorMessage(lang === 'ar' ? 'الرجاء إدخال البريد وكلمة المرور' : 'Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username.trim(), password: password }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));

        if (data.user.role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/home');
        }
      } else {
        setErrorMessage(data.error || (lang === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid login credentials'));
      }
    } catch (error) {
      setErrorMessage(lang === 'ar' ? 'تعذر الاتصال بالخادم' : 'Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* خلفية جمالية */}
      <View style={styles.bgGlowTop} />
      <View style={styles.bgGlowBottom} />

      {/* 1. الترويسة العلوية + زر تحويل اللغة */}
      <View style={[styles.topHeader, lang === 'en' && styles.topHeaderEn]}>
        <View style={[styles.welcomeBox, lang === 'en' && { alignItems: 'flex-start' }]}>
          <Text style={styles.welcomeTextAr}>{t.welcomeAr}</Text>
          <Text style={styles.welcomeTextEn}>{t.welcomeEn}</Text>
        </View>

        <View style={styles.headerRightGroup}>
          <TouchableOpacity 
            style={styles.langToggleBtn} 
            onPress={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          >
            <Text style={styles.langToggleText}>🌐 {lang === 'ar' ? 'English' : 'عربي'}</Text>
          </TouchableOpacity>

          <View style={styles.headerLogos}>
            <Image 
              source={require('../../assets/images/FB_IMG_1776379564764.jpg')}
              style={styles.circleLogo} 
              resizeMode="cover"
            />
            <Image 
              source={require('../../assets/images/Screenshot_20260417-004535_Facebook.jpg')} 
              style={styles.circleLogo} 
              resizeMode="cover"
            />
          </View>
        </View>
      </View>

      {/* 2. جسم الصفحة */}
      <View style={[
        styles.mainWrapper, 
        isDesktop ? (lang === 'ar' ? styles.desktopWrapperAr : styles.desktopWrapperEn) : styles.mobileWrapper
      ]}>
        
        {/* نموذج الدخول */}
        <View style={styles.glassFormCard}>

          {/* عنوان تسجيل الدخول */}
          <View style={styles.titleHeader}>
            <Text style={styles.titleHeaderText}>{t.loginTab}</Text>
          </View>

          {/* رسالة الخطأ إن وجدت */}
          {errorMessage ? (
            <Text style={[styles.errorText, { textAlign: lang === 'ar' ? 'right' : 'left' }]}>
              {errorMessage}
            </Text>
          ) : null}

          {/* حقل البريد الإلكتروني */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { textAlign: lang === 'ar' ? 'right' : 'left' }]}>
              {t.userLabel}
            </Text>
            <TextInput 
              style={[styles.glassInput, { textAlign: lang === 'ar' ? 'right' : 'left' }]} 
              value={username}
              onChangeText={setUsername}
              placeholder={t.userPlaceholder}
              placeholderTextColor="#B0A495"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* حقل كلمة المرور */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { textAlign: lang === 'ar' ? 'right' : 'left' }]}>
              {t.passLabel}
            </Text>
            <TextInput 
              style={[styles.glassInput, { textAlign: lang === 'ar' ? 'right' : 'left' }]} 
              secureTextEntry 
              value={password}
              onChangeText={setPassword}
              placeholder={t.passPlaceholder}
              placeholderTextColor="#B0A495"
            />
          </View>

          {/* سطر الإجراءات */}
          <View style={[styles.actionRow, lang === 'en' && styles.actionRowEn]}>
            <TouchableOpacity 
              style={styles.glassLoginBtn} 
              onPress={handleLogin} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginBtnText}>
                  {t.loginBtn}
                </Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.forgotLink}>
              <Text style={styles.forgotText}>{t.forgotPass}</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* قسم الشعار والعنوان الجانبي */}
        <View style={styles.leftSection}>
          <View style={styles.imageBackdrop}>
            <Image 
              source={require('../../assets/images/مكتبة .png')}
              style={styles.featherImg} 
              resizeMode="contain"
            />
          </View>
          <Text style={styles.libraryTitle}>{t.libraryTitle}</Text>
          <Text style={styles.librarySubTitle}>{t.librarySubTitle}</Text>
        </View>

      </View>

    </SafeAreaView>
  );
}

const fontFamilyStyle = Platform.select({
  ios: 'System',
  android: 'sans-serif-medium',
  default: 'Segoe UI, Roboto, Helvetica, sans-serif',
});

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F7F4EE',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGlowTop: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
  },
  bgGlowBottom: {
    position: 'absolute',
    bottom: -120,
    left: -120,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(184, 144, 71, 0.1)',
  },
  topHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 50,
    paddingTop: 30,
    paddingBottom: 10,
    zIndex: 10,
  },
  topHeaderEn: {
    flexDirection: 'row-reverse',
  },
  welcomeBox: {
    alignItems: 'flex-end',
  },
  welcomeTextAr: {
    fontSize: 24,
    fontWeight: '900',
    color: '#725232',
    fontFamily: fontFamilyStyle,
  },
  welcomeTextEn: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A08564',
    letterSpacing: 1.2,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  langToggleBtn: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  langToggleText: {
    color: '#725232',
    fontWeight: '800',
    fontSize: 12,
    fontFamily: fontFamilyStyle,
  },
  headerLogos: {
    flexDirection: 'row',
    gap: 12,
  },
  circleLogo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
  },
  mainWrapper: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 50,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopWrapperAr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 40,
  },
  desktopWrapperEn: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 40,
  },
  mobileWrapper: {
    flexDirection: 'column-reverse',
    justifyContent: 'center',
    gap: 25,
  },
  leftSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBackdrop: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  featherImg: {
    width: 310,
    height: 210,
  },
  libraryTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#8C6D46',
    marginTop: 15,
    fontFamily: fontFamilyStyle,
  },
  librarySubTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B09673',
    letterSpacing: 1.2,
    marginTop: 4,
  },
  glassFormCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 35,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  titleHeader: {
    backgroundColor: '#B89047',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  titleHeaderText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: fontFamilyStyle,
  },
  errorText: {
    color: '#D9534F',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: fontFamilyStyle,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8C6D46',
    marginBottom: 8,
    fontFamily: fontFamilyStyle,
  },
  glassInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#4A3B2C',
    fontFamily: fontFamilyStyle,
  },
  actionRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 5,
  },
  actionRowEn: {
    flexDirection: 'row',
  },
  glassLoginBtn: {
    backgroundColor: '#B89047',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: fontFamilyStyle,
  },
  forgotLink: {
    paddingVertical: 5,
  },
  forgotText: {
    color: '#B89047',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
    fontFamily: fontFamilyStyle,
  },
});