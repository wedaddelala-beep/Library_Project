import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, SafeAreaView, useWindowDimensions, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';

export default function LandingScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const router = useRouter();

  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  // التعديل هنا: الانتقال إلى صفحة تسجيل الدخول الجديدة
  const goToLogin = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* إضاءات خفيفة متدرجة خلف الزجاج */}
      <View style={styles.bgGlowTop} />
      <View style={styles.bgGlowCenter} />
      <View style={styles.bgGlowBottom} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* 1. الترويسة الزجاجية العلوية Navbar */}
        <View style={[styles.glassNavbar, lang === 'en' && styles.navbarEn]}>
          <View style={styles.navBrand}>
            <Image 
              source={require('../../assets/images/مكتبة .png')} 
              style={styles.brandLogo} 
              resizeMode="contain" 
            />
            <View style={styles.brandTextGroup}>
              <Text style={styles.brandTitleText}>
                {lang === 'ar' ? 'مكتبة كلية العلوم' : 'Faculty of Science Library'}
              </Text>
              <Text style={styles.brandSubTitleText}>ZENTAN UNIVERSITY</Text>
            </View>
          </View>

          <View style={styles.navActions}>
            <TouchableOpacity 
              style={styles.glassLangBtn} 
              onPress={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            >
              <Text style={styles.langBtnText}>🌐 {lang === 'ar' ? 'English' : 'عربي'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.glassLoginNavBtn} onPress={goToLogin}>
              <Text style={styles.loginNavBtnText}>
                {lang === 'ar' ? 'تسجيل الدخول 🔑' : 'Sign In 🔑'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. قسم البطل (Hero Section) المعرض التفاعلي */}
        <View style={styles.glassHeroCard}>
          <Text style={styles.heroBadge}>
            {lang === 'ar' ? '✨ البوابة الرقمية والمعرفية' : '✨ Digital & Knowledge Hub'}
          </Text>
          <Text style={styles.heroTitle}>
            {lang === 'ar' ? 'صرح العلوم والبحث العلمي' : 'Beacon of Science & Research'}
          </Text>
          <Text style={styles.heroSubTitle}>
            {lang === 'ar' 
              ? 'بيئة أكاديمية متكاملة تهدف لدعم الطلاب والباحثين بجمع المراجع والمصادر الرقمية الحديثة.' 
              : 'An integrated academic environment supporting students and researchers with modern digital resources.'}
          </Text>

          {/* المعرض الأفقي الأنيق */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageGallery}>
            <View style={styles.galleryCard}>
              <Image source={require('../../assets/images/مكتبة .png')} style={styles.galleryImage} resizeMode="cover" />
            </View>
            <View style={styles.galleryCard}>
              <Image source={require('../../assets/images/FB_IMG_1776379564764.jpg')} style={styles.galleryImage} resizeMode="cover" />
            </View>
            <View style={styles.galleryCard}>
              <Image source={require('../../assets/images/Screenshot_20260417-004535_Facebook.jpg')} style={styles.galleryImage} resizeMode="cover" />
            </View>
          </ScrollView>
        </View>

        {/* 3. بطاقة نبذة التأسيس الزجاجية */}
        <View style={styles.glassSectionCard}>
          <View style={[styles.sectionHeaderRow, lang === 'en' && styles.rowEn]}>
            <View style={styles.iconCircle}><Text style={styles.iconText}>📜</Text></View>
            <Text style={styles.sectionTitle}>
              {lang === 'ar' ? 'تأسيس الكلية والمكتبة' : 'About Foundation'}
            </Text>
          </View>
          
          <Text style={[styles.glassParagraph, { textAlign: lang === 'ar' ? 'right' : 'left' }]}>
            {lang === 'ar' 
              ? 'تأسست كلية العلوم بالزنتان في 18 سبتمبر 1991، وغالباً ما نشأت المكتبة الخاصة بها بالتزامن مع تأسيس الكلية لتلبية احتياجات الطلاب والباحثين في التخصصات العلمية المختلفة ضمن جامعة الزنتان (جامعة الجبل الغربي سابقاً).'
              : 'The Faculty of Science in Zentan was established on September 18, 1991. Its library was created alongside the college to meet the needs of students and researchers within Zentan University.'}
          </Text>

          {/* البطاقات المصغرة للحقائق الأساسية */}
          <View style={styles.gridInfoCards}>
            <View style={styles.glassMiniCard}>
              <Text style={styles.miniCardIcon}>📅</Text>
              <Text style={styles.miniCardTitle}>{lang === 'ar' ? '18 سبتمبر 1991' : 'Sep 18, 1991'}</Text>
              <Text style={styles.miniCardSub}>{lang === 'ar' ? 'تاريخ التأسيس' : 'Establishment'}</Text>
            </View>

            <View style={styles.glassMiniCard}>
              <Text style={styles.miniCardIcon}>🏛️</Text>
              <Text style={styles.miniCardTitle}>{lang === 'ar' ? 'النواة الأساسية' : 'Core Nucleus'}</Text>
              <Text style={styles.miniCardSub}>{lang === 'ar' ? 'انطلاقة الجامعة بالزنتان' : 'University Foundation'}</Text>
            </View>

            <View style={styles.glassMiniCard}>
              <Text style={styles.miniCardIcon}>📚</Text>
              <Text style={styles.miniCardTitle}>{lang === 'ar' ? 'مصادر متنوعة' : 'Rich Resources'}</Text>
              <Text style={styles.miniCardSub}>{lang === 'ar' ? 'كتب ودوريات علمية' : 'Books & Periodicals'}</Text>
            </View>
          </View>
        </View>

        {/* 4. بطاقة الأنشطة والفعاليات */}
        <View style={styles.glassSectionCard}>
          <View style={[styles.sectionHeaderRow, lang === 'en' && styles.rowEn]}>
            <View style={styles.iconCircle}><Text style={styles.iconText}>🎨</Text></View>
            <Text style={styles.sectionTitle}>
              {lang === 'ar' ? 'النشاطات والفعاليات' : 'Activities & Events'}
            </Text>
          </View>

          <View style={[styles.activityContentRow, isDesktop ? (lang === 'ar' ? styles.desktopRowAr : styles.desktopRowEn) : styles.mobileRow]}>
            <View style={styles.activityTextContent}>
              <View style={styles.activityItem}>
                <Text style={[styles.actItemTitle, { textAlign: lang === 'ar' ? 'right' : 'left' }]}>
                  {lang === 'ar' ? '• المعارض العلمية والثقافية' : '• Scientific & Cultural Fairs'}
                </Text>
                <Text style={[styles.actItemSub, { textAlign: lang === 'ar' ? 'right' : 'left' }]}>
                  {lang === 'ar' ? 'تنظيم المعارض السنوية وورش العمل المتخصصة.' : 'Annual book fairs and scientific workshops.'}
                </Text>
              </View>

              <View style={styles.activityItem}>
                <Text style={[styles.actItemTitle, { textAlign: lang === 'ar' ? 'right' : 'left' }]}>
                  {lang === 'ar' ? '• الملتقيات والمبادرات الطلابية' : '• Student Initiatives'}
                </Text>
                <Text style={[styles.actItemSub, { textAlign: lang === 'ar' ? 'right' : 'left' }]}>
                  {lang === 'ar' ? 'دعم الأنشطة والمشاريع الأكاديمية المتميزة.' : 'Supporting academic initiatives and outstanding projects.'}
                </Text>
              </View>
            </View>

            {/* صور جانبية بإطار زجاجي */}
            <View style={styles.sideImagesStack}>
              <View style={styles.sideGlassImageWrap}>
                <Image source={require('../../assets/images/Screenshot_20260417-004535_Facebook.jpg')} style={styles.sideImg} resizeMode="cover" />
              </View>
              <View style={styles.sideGlassImageWrap}>
                <Image source={require('../../assets/images/FB_IMG_1776379564764.jpg')} style={styles.sideImg} resizeMode="cover" />
              </View>
            </View>
          </View>
        </View>

        {/* 5. زر الدعوة للانتقال لصفحة التسجيل Footer Call to Action */}
        <View style={styles.footerActionBox}>
          <TouchableOpacity style={styles.glassCallToActionButton} onPress={goToLogin}>
            <Text style={styles.callToActionText}>
              {lang === 'ar' ? 'الدخول إلى المنظومة الإلكترونية 🚪' : 'Enter Library Portal 🚪'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
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
    backgroundColor: '#F4F0E8',
  },
  bgGlowTop: {
    position: 'absolute',
    top: -120,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(212, 175, 55, 0.16)',
  },
  bgGlowCenter: {
    position: 'absolute',
    top: '40%',
    left: -150,
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor: 'rgba(184, 144, 71, 0.12)',
  },
  bgGlowBottom: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(212, 175, 55, 0.14)',
  },
  scrollContainer: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 25,
  },
  glassNavbar: {
    width: '100%',
    maxWidth: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row-reverse',
    justify: 'space-between',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#8C6D46',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
  },
  navbarEn: {
    flexDirection: 'row',
  },
  navBrand: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  brandLogo: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  brandTextGroup: {
    alignItems: 'flex-start',
  },
  brandTitleText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#6E5230',
    fontFamily: fontFamilyStyle,
  },
  brandSubTitleText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#A08564',
    letterSpacing: 1.2,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  glassLangBtn: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  langBtnText: {
    color: '#6E5230',
    fontWeight: '800',
    fontSize: 12,
    fontFamily: fontFamilyStyle,
  },
  glassLoginNavBtn: {
    backgroundColor: '#B89047',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  loginNavBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
    fontFamily: fontFamilyStyle,
  },
  glassHeroCard: {
    width: '100%',
    maxWidth: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    padding: 30,
    alignItems: 'center',
    shadowColor: '#8C6D46',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
  },
  heroBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    color: '#725232',
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 12,
    fontFamily: fontFamilyStyle,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#5C4326',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: fontFamilyStyle,
  },
  heroSubTitle: {
    fontSize: 14,
    color: '#7A644C',
    textAlign: 'center',
    maxWidth: 600,
    lineHeight: 22,
    marginBottom: 25,
    fontFamily: fontFamilyStyle,
  },
  imageGallery: {
    gap: 16,
    paddingHorizontal: 5,
  },
  galleryCard: {
    borderRadius: 18,
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  galleryImage: {
    width: 270,
    height: 160,
    borderRadius: 14,
  },
  glassSectionCard: {
    width: '100%',
    maxWidth: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    padding: 25,
    shadowColor: '#8C6D46',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    marginBottom: 15,
  },
  rowEn: {
    flexDirection: 'row',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6E5230',
    fontFamily: fontFamilyStyle,
  },
  glassParagraph: {
    fontSize: 14,
    lineHeight: 24,
    color: '#554433',
    fontWeight: '600',
    marginBottom: 20,
    fontFamily: fontFamilyStyle,
  },
  gridInfoCards: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  glassMiniCard: {
    flex: 1,
    minWidth: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
  },
  miniCardIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  miniCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6E5230',
    marginBottom: 3,
    fontFamily: fontFamilyStyle,
  },
  miniCardSub: {
    fontSize: 12,
    color: '#8C6D46',
    fontFamily: fontFamilyStyle,
  },
  activityContentRow: {
    gap: 20,
    marginTop: 10,
  },
  desktopRowAr: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  desktopRowEn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileRow: {
    flexDirection: 'column',
  },
  activityTextContent: {
    flex: 1,
    gap: 15,
  },
  activityItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  actItemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#6E5230',
    marginBottom: 4,
    fontFamily: fontFamilyStyle,
  },
  actItemSub: {
    fontSize: 13,
    color: '#7A644C',
    fontFamily: fontFamilyStyle,
  },
  sideImagesStack: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  sideGlassImageWrap: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  sideImg: {
    width: 130,
    height: 100,
    borderRadius: 12,
  },
  footerActionBox: {
    marginTop: 10,
    alignItems: 'center',
  },
  glassCallToActionButton: {
    backgroundColor: '#6E5230',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 18,
    shadowColor: '#6E5230',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  callToActionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: fontFamilyStyle,
  },
});