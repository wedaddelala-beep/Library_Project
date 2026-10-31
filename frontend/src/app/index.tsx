import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, SafeAreaView, useWindowDimensions, Platform, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🌐 رابط الخادم المحلي للاتصال بقاعدة بيانات MySQL عبر Flask
const API_BASE_URL = 'http://127.0.0.1:5000';

export default function App() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const router = useRouter();

  // حالة النمط: 'login' لتسجيل الدخول أو 'register' لإنشاء حساب طالب جديد
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  // حقول المدخلات
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // حالات التحميل والأخطاء والنجاح
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // نصوص الواجهة باللغتين
  const t = {
    welcomeAr: lang === 'ar' ? 'مرحباً بكم في نظام إدارة المكتبة الأكاديمية 📚✨' : 'Welcome to Academic Library System 📚✨',
    welcomeEn: lang === 'ar' ? 'جامعة الزنتان - بوابة النظام الأكاديمي' : 'Zentan University - Academic Portal',
    loginTab: lang === 'ar' ? 'تسجيل الدخول' : 'Sign In',
    registerTab: lang === 'ar' ? 'إنشاء حساب طالب جديد' : 'New Student Registration',
    userLabel: lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address',
    userPlaceholder: lang === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email',
    passLabel: lang === 'ar' ? 'كلمة المرور' : 'Password',
    passPlaceholder: '••••••••',
    nameLabel: lang === 'ar' ? 'اسم الطالب الكامل' : 'Full Name',
    namePlaceholder: lang === 'ar' ? 'أدخل اسمك الثلاثي' : 'Enter your full name',
    loginBtn: lang === 'ar' ? 'دخول' : 'Login',
    registerBtn: lang === 'ar' ? 'تسجيل الحساب' : 'Register Account',
    switchToRegister: lang === 'ar' ? 'ليس لديك حساب؟ سجل الآن كطالب' : "Don't have an account? Register as Student",
    switchToLogin: lang === 'ar' ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'Already have an account? Sign In',
    forgotPass: lang === 'ar' ? 'هل نسيت كلمة المرور؟' : 'Forgot Password?',
    libraryTitle: lang === 'ar' ? 'نظام المكتبة الأكاديمية' : 'Academic Library System',
    librarySubTitle: 'SECURE ENTERPRISE LIBRARY SOLUTION',
  };

  // دالة تسجيل الدخول
  const handleLogin = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    
    if (!email.trim() || !password.trim()) {
      setErrorMessage(lang === 'ar' ? 'الرجاء إدخال البريد وكلمة المرور' : 'Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        const userRole = data.user.role ? data.user.role.toLowerCase() : '';

        if (userRole === 'admin' || userRole === 'librarian') {
          router.replace('/admin');
        } else {
          router.replace('/home');
        }
      } else {
        setErrorMessage(data.error || (lang === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid login credentials'));
      }
    } catch (error) {
      setErrorMessage(lang === 'ar' ? 'تعذر الاتصال بالخادم، تأكد من تشغيل خادم بايثون' : 'Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  // دالة تسجيل حساب طالب جديد وتوجيهه تلقائياً
  const handleRegister = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage(lang === 'ar' ? 'الرجاء تعبئة جميع الحقول المطلوبة' : 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password,
          role: 'Student'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(lang === 'ar' ? 'تم إنشاء الحساب بنجاح! جاري تسجيل الدخول...' : 'Account created successfully! Signing in...');
        
        // تسجيل الدخول التلقائي بعد نجاح إنشاء الحساب
        const loginResponse = await fetch(`${API_BASE_URL}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password: password }),
        });
        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
          await AsyncStorage.setItem('userData', JSON.stringify(loginData.user));
          setTimeout(() => {
            router.replace('/home');
          }, 1000);
        } else {
          setMode('login');
          setSuccessMessage(lang === 'ar' ? 'تم التسجيل بنجاح، يرجى تسجيل الدخول' : 'Registered successfully, please sign in');
        }
      } else {
        setErrorMessage(data.error || (lang === 'ar' ? 'فشل إنشاء الحساب' : 'Registration failed'));
      }
    } catch (error) {
      setErrorMessage(lang === 'ar' ? 'تعذر الاتصال بالخادم، تأكد من تشغيل خادم بايثون' : 'Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* خلفية جمالية تفاعلية */}
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
        </View>
      </View>

      {/* 2. جسم الصفحة المتجاوب */}
      <View style={[
        styles.mainWrapper, 
        isDesktop ? (lang === 'ar' ? styles.desktopWrapperAr : styles.desktopWrapperEn) : styles.mobileWrapper
      ]}>
        
        {/* نموذج تسجيل الدخول أو إنشاء حساب */}
        <View style={styles.glassFormCard}>

          <View style={styles.titleHeader}>
            <Text style={styles.titleHeaderText}>{mode === 'login' ? t.loginTab : t.registerTab}</Text>
          </View>

          {errorMessage ? (
            <Text style={[styles.errorText, { textAlign: lang === 'ar' ? 'right' : 'left' }]}>
              {errorMessage}
            </Text>
          ) : null}

          {successMessage ? (
            <Text style={[styles.successText, { textAlign: lang === 'ar' ? 'right' : 'left' }]}>
              {successMessage}
            </Text>
          ) : null}

          {/* حقل اسم الطالب يظهر فقط في وضع التسجيل */}
          {mode === 'register' && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { textAlign: lang === 'ar' ? 'right' : 'left' }]}>
                {t.nameLabel}
              </Text>
              <TextInput 
                style={[styles.glassInput, { textAlign: lang === 'ar' ? 'right' : 'left' }]} 
                value={name}
                onChangeText={setName}
                placeholder={t.namePlaceholder}
                placeholderTextColor="#B0A495"
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { textAlign: lang === 'ar' ? 'right' : 'left' }]}>
              {t.userLabel}
            </Text>
            <TextInput 
              style={[styles.glassInput, { textAlign: lang === 'ar' ? 'right' : 'left' }]} 
              value={email}
              onChangeText={setEmail}
              placeholder={t.userPlaceholder}
              placeholderTextColor="#B0A495"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

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

          <View style={styles.actionColumn}>
            <TouchableOpacity 
              style={styles.glassLoginBtn} 
              onPress={mode === 'login' ? handleLogin : handleRegister} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginBtnText}>
                  {mode === 'login' ? t.loginBtn : t.registerBtn}
                </Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.linksRow}>
              {mode === 'login' ? (
                <>
                  <TouchableOpacity style={styles.forgotLink}>
                    <Text style={styles.forgotText}>{t.forgotPass}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.switchModeLink}
                    onPress={() => {
                      setMode('register');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                  >
                    <Text style={styles.switchModeText}>{t.switchToRegister}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity 
                  style={styles.switchModeLink}
                  onPress={() => {
                    setMode('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                >
                  <Text style={styles.switchModeText}>{t.switchToLogin}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

        </View>

        {/* قسم الشعار المحلي والعناوين الجانبية */}
        <View style={styles.leftSection}>
          <Image 
            source={require('../../assets/images/مكتبة .png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
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
    fontSize: 22,
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
  logoImage: {
    width: 140,
    height: 140,
    marginBottom: 15,
    borderRadius: 70,
  },
  libraryTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#8C6D46',
    marginTop: 15,
    fontFamily: fontFamilyStyle,
    textAlign: 'center',
  },
  librarySubTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B09673',
    letterSpacing: 1.2,
    marginTop: 4,
    textAlign: 'center',
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
  successText: {
    color: '#28A745',
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
  actionColumn: {
    marginTop: 10,
    gap: 12,
  },
  glassLoginBtn: {
    backgroundColor: '#B89047',
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: fontFamilyStyle,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  forgotLink: {
    paddingVertical: 5,
  },
  forgotText: {
    color: '#B89047',
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
    fontFamily: fontFamilyStyle,
  },
  switchModeLink: {
    paddingVertical: 5,
  },
  switchModeText: {
    color: '#725232',
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
    fontFamily: fontFamilyStyle,
  },
});