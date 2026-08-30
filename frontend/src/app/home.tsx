import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, ScrollView, TouchableOpacity, SafeAreaView, useWindowDimensions, Platform } from 'react-native';
import { Stack } from 'expo-router';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  // حالة اللغة: 'ar' للعربية و 'en' للإنجليزية
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  // نصوص الواجهة باللغتين
  const t = {
    home: lang === 'ar' ? 'الرئيسية' : 'Home',
    services: lang === 'ar' ? 'الخدمات' : 'Services',
    about: lang === 'ar' ? 'حولنا' : 'About',
    contact: lang === 'ar' ? 'تواصل معنا' : 'Contact',
    title: lang === 'ar' ? 'مكتبة كلية العلوم' : 'Faculty of Science Library',
    subTitle: 'ZENTAN UNIVERSITY FACULTY OF SCIENCE LIBRARY',
    searchPlaceholder: lang === 'ar' ? 'ابحث عن كتاب، مؤلف، أو مشروع...' : 'Search for books, authors, or projects...',
    
    // القائمة الجانبية
    userAccount: lang === 'ar' ? '👤 حساب المستخدم' : '👤 User Profile',
    borrowedBooksSide: lang === 'ar' ? '📚 الكتب المستعارة' : '📚 Borrowed Books',
    returnDates: lang === 'ar' ? '🔄 مواعيد الاسترجاع' : '🔄 Return Dates',
    addDocs: lang === 'ar' ? '➕ إضافة مستندات' : '➕ Add Documents',

    // أزرار الخدمات
    reqBorrow: lang === 'ar' ? '📝 طلب إستعارة' : '📝 Request Borrow',
    borrowedBooks: lang === 'ar' ? '📖 الكتب المستعارة' : '📖 Borrowed Books',
    availBooks: lang === 'ar' ? '📚 الكتب المتوفرة' : '📚 Available Books',
    categories: lang === 'ar' ? '🗂️ أقسام الكتب' : '🗂️ Categories',
    openHours: lang === 'ar' ? '⏰ مواعيد الفتح' : '⏰ Opening Hours',
    gradProjects: lang === 'ar' ? '🎓 مشاريع التخرج' : '🎓 Grad Projects',

    // الجداول
    mostRead: lang === 'ar' ? '⭐ الأكثر قراءة' : '⭐ Most Read',
    activities: lang === 'ar' ? '📅 نشاطات المكتبة' : '📅 Library Activities',
    book1: lang === 'ar' ? '1. كتاب علوم الحاسوب' : '1. Computer Science Book',
    book2: lang === 'ar' ? '2. مشروع تخرج أمن شبكات' : '2. Network Security Thesis',
    book3: lang === 'ar' ? '3. مرجع قواعد البيانات' : '3. Database Reference',
    act1: lang === 'ar' ? 'مسابقة رسم' : 'Art Competition',
    act2: lang === 'ar' ? 'معرض علمي' : 'Science Fair',
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* خلفية الإضاءة البيج */}
      <View style={styles.bgGlowTop} />
      <View style={styles.bgGlowBottom} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.mainCard}>

          {/* 1. الشريط العلوي + زر تحويل اللغة */}
          <View style={[styles.navbar, lang === 'en' && styles.navbarEn]}>
            <View style={styles.navLinks}>
              <TouchableOpacity style={styles.navBtnActive}>
                <Text style={styles.navTextActive}>{t.home}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn}>
                <Text style={styles.navText}>{t.services}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn}>
                <Text style={styles.navText}>{t.about}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn}>
                <Text style={styles.navText}>{t.contact}</Text>
              </TouchableOpacity>
            </View>

            {/* زر التبديل بين العربية والإنجليزية */}
            <TouchableOpacity 
              style={styles.langToggleBtn} 
              onPress={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            >
              <Text style={styles.langToggleText}>🌐 {lang === 'ar' ? 'English' : 'عربي'}</Text>
            </TouchableOpacity>
          </View>

          {/* 2. الترويسة الشعارية Top Header */}
          <View style={[styles.headerRow, lang === 'en' && styles.headerRowEn]}>
            
            {/* عنوان الصفحة */}
            <View style={styles.headerTitleBox}>
              <Text style={styles.headerTitleText}>{t.title}</Text>
              <Text style={styles.headerSubTitleText}>{t.subTitle}</Text>
            </View>

            {/* الشعارات الثلاثة دائرية معاً */}
            <View style={styles.logoGroup}>
              <Image 
                source={require('../../assets/images/مكتبة .png')} 
                style={styles.circleLogo} 
                resizeMode="cover" 
              />
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

          {/* 3. شريط البحث Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput 
              style={[styles.searchInput, { textAlign: lang === 'ar' ? 'right' : 'left' }]} 
              placeholder={t.searchPlaceholder}
              placeholderTextColor="#B0A495"
            />
            <Text style={[styles.searchIcon, lang === 'ar' ? { left: 15 } : { right: 15 }]}>🔍</Text>
          </View>

          {/* 4. محتوى الصفحة الرئيسي Content Area */}
          <View style={[
            styles.contentLayout, 
            isDesktop ? (lang === 'ar' ? styles.desktopLayoutAr : styles.desktopLayoutEn) : styles.mobileLayout
          ]}>

            {/* القائمة الجانبية Sidebar */}
            <View style={styles.sidebar}>
              <TouchableOpacity style={styles.sidebarBtn}>
                <Text style={styles.sidebarBtnText}>{t.userAccount}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sidebarBtn}>
                <Text style={styles.sidebarBtnText}>{t.borrowedBooksSide}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sidebarBtn}>
                <Text style={styles.sidebarBtnText}>{t.returnDates}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sidebarBtn}>
                <Text style={styles.sidebarBtnText}>{t.addDocs}</Text>
              </TouchableOpacity>
            </View>

            {/* الشبكة الرئيسية Main Grid */}
            <View style={styles.mainGridArea}>
              
              {/* شبكة الأزرار 6 عناصر */}
              <View style={styles.gridContainer}>
                <TouchableOpacity style={styles.gridCard}>
                  <Text style={styles.gridCardText}>{t.reqBorrow}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridCard}>
                  <Text style={styles.gridCardText}>{t.borrowedBooks}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridCard}>
                  <Text style={styles.gridCardText}>{t.availBooks}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridCard}>
                  <Text style={styles.gridCardText}>{t.categories}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridCard}>
                  <Text style={styles.gridCardText}>{t.openHours}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridCard}>
                  <Text style={styles.gridCardText}>{t.gradProjects}</Text>
                </TouchableOpacity>
              </View>

              {/* قسم الإحصائيات والنشاطات السفلي Tables Section */}
              <View style={[styles.bottomTablesRow, isDesktop ? styles.desktopTables : styles.mobileTables]}>
                
                {/* الأكثر قراءة */}
                <View style={styles.tableCard}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableTitle}>{t.mostRead}</Text>
                  </View>
                  <View style={styles.tableBody}>
                    <Text style={[styles.tableRowText, { textAlign: lang === 'ar' ? 'right' : 'left' }]}>{t.book1}</Text>
                    <Text style={[styles.tableRowText, { textAlign: lang === 'ar' ? 'right' : 'left' }]}>{t.book2}</Text>
                    <Text style={[styles.tableRowText, { textAlign: lang === 'ar' ? 'right' : 'left' }]}>{t.book3}</Text>
                  </View>
                </View>

                {/* نشاطات المكتبة */}
                <View style={styles.tableCard}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableTitle}>{t.activities}</Text>
                  </View>
                  <View style={styles.tableBody}>
                    <View style={[styles.activityRow, lang === 'en' && styles.activityRowEn]}>
                      <Text style={styles.actCellText}>{t.act1}</Text>
                      <Text style={styles.actCellDate}>2027/2/7</Text>
                    </View>
                    <View style={[styles.activityRow, lang === 'en' && styles.activityRowEn]}>
                      <Text style={styles.actCellText}>{t.act2}</Text>
                      <Text style={styles.actCellDate}>2027/7/5</Text>
                    </View>
                  </View>
                </View>

              </View>

            </View>

          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// أنماط الخطوط والتصميم
const fontFamilyStyle = Platform.select({
  ios: 'System',
  android: 'sans-serif-medium',
  default: 'Segoe UI, Roboto, Helvetica, sans-serif',
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4EE',
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
  scrollContainer: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  mainCard: {
    width: '100%',
    maxWidth: 980,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    padding: 25,
    shadowColor: '#8C6D46',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  navbar: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navbarEn: {
    flexDirection: 'row',
  },
  navLinks: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  navBtnActive: {
    backgroundColor: '#B89047',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  navTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
    fontFamily: fontFamilyStyle,
  },
  navBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  navText: {
    color: '#8C6D46',
    fontWeight: '600',
    fontSize: 13,
    fontFamily: fontFamilyStyle,
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
  headerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerRowEn: {
    flexDirection: 'row',
  },
  headerTitleBox: {
    alignItems: 'flex-start',
  },
  headerTitleText: {
    fontSize: 23,
    fontWeight: '900',
    color: '#725232',
    fontFamily: fontFamilyStyle,
    letterSpacing: 0.3,
  },
  headerSubTitleText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#A08564',
    letterSpacing: 1,
    marginTop: 2,
  },
  logoGroup: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  circleLogo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    backgroundColor: '#FFF',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 25,
    justifyContent: 'center',
  },
  searchInput: {
    backgroundColor: 'rgba(247, 244, 238, 0.95)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 11,
    fontSize: 14,
    color: '#4A3B2C',
    fontFamily: fontFamilyStyle,
  },
  searchIcon: {
    position: 'absolute',
    fontSize: 16,
  },
  contentLayout: {
    gap: 20,
  },
  desktopLayoutAr: {
    flexDirection: 'row-reverse',
  },
  desktopLayoutEn: {
    flexDirection: 'row',
  },
  mobileLayout: {
    flexDirection: 'column-reverse',
  },
  sidebar: {
    width: 200,
    gap: 10,
  },
  sidebarBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(184, 144, 71, 0.35)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  sidebarBtnText: {
    color: '#6E5230',
    fontWeight: '700',
    fontSize: 13,
    fontFamily: fontFamilyStyle,
  },
  mainGridArea: {
    flex: 1,
    gap: 20,
  },
  gridContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '31%',
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCardText: {
    color: '#725232',
    fontWeight: '800',
    fontSize: 13,
    fontFamily: fontFamilyStyle,
  },
  bottomTablesRow: {
    gap: 15,
    marginTop: 10,
  },
  desktopTables: {
    flexDirection: 'row',
  },
  mobileTables: {
    flexDirection: 'column',
  },
  tableCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  tableTitle: {
    color: '#725232',
    fontWeight: 'bold',
    fontSize: 13,
    fontFamily: fontFamilyStyle,
  },
  tableBody: {
    padding: 12,
    gap: 8,
  },
  tableRowText: {
    color: '#554433',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fontFamilyStyle,
  },
  activityRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EAE0D0',
  },
  activityRowEn: {
    flexDirection: 'row',
  },
  actCellText: {
    color: '#554433',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fontFamilyStyle,
  },
  actCellDate: {
    color: '#8C6D46',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: fontFamilyStyle,
  },
});