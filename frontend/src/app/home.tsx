import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, Image, TextInput, ScrollView, TouchableOpacity, SafeAreaView, useWindowDimensions, Platform, Modal, Alert, Linking } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [books, setBooks] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]); 
  const [borrowedBooksList, setBorrowedBooksList] = useState<any[]>([]); 
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState<any>(null);

  const [modalType, setModalType] = useState<string | null>(null); 
  const [borrowMessage, setBorrowMessage] = useState<string | null>(null);

  const fetchLibraryData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedUser) setUserData(JSON.parse(storedUser));

      const resBooks = await fetch(`${API_BASE_URL}/books`);
      if (resBooks.ok) setBooks(await resBooks.json());

      const resActs = await fetch(`${API_BASE_URL}/activities`);
      if (resActs.ok) setActivities(await resActs.json());

      const resProj = await fetch(`${API_BASE_URL}/projects`);
      if (resProj.ok) setProjects(await resProj.json());
    } catch (error) {
      console.log('خطأ أثناء جلب بيانات المكتبة:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLibraryData();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      router.replace('/index');
    } catch (error) {
      console.error('خطأ أثناء تسجيل الخروج:', error);
    }
  };

  const handleBorrowBook = async (book: any) => {
    try {
      if (!userData) {
        Alert.alert('خطأ', 'يرجى تسجيل الدخول أولاً');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/borrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: book.id,
          user_id: userData.id,
          loan_days: 14
        })
      });

      const resData = await response.json();

      if (response.ok) {
        setBorrowMessage(`✅ تم طلب استعارة الكتاب بنجاح!`);
        fetchLibraryData();
      } else {
        setBorrowMessage(`⚠️ ${resData.error || 'فشلت عملية الاستعارة'}`);
      }
    } catch (error) {
      setBorrowMessage('❌ خطأ في الاتصال بالخادم.');
    }
  };

  const openPdfFile = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(() => Alert.alert('خطأ', 'تعذر فتح ملف الـ PDF'));
    } else {
      Alert.alert('تنبيه', 'لا يتوفر ملف PDF رقمي لهذا العنصر حالياً');
    }
  };

  const filteredBooks = books.filter(b => 
    b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.isbn?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const t = {
    home: lang === 'ar' ? 'الرئيسية' : 'Home',
    services: lang === 'ar' ? 'الخدمات الرقمية' : 'Digital Services',
    logout: lang === 'ar' ? 'تسجيل الخروج 🚪' : 'Logout 🚪',
    title: lang === 'ar' ? 'نظام المكتبة الأكاديمية' : 'Academic Library System',
    subTitle: 'SECURE ENTERPRISE LIBRARY SOLUTION - UNIVERSITY OF ZENTAN',
    searchPlaceholder: lang === 'ar' ? 'ابحث عن عنوان الكتاب، أو رقم المعيار (ISBN)...' : 'Search by book title or ISBN...',
    userAccount: lang === 'ar' ? '👤 الملف الشخصي للطالب' : '👤 Student Profile',
    aboutLibrary: lang === 'ar' ? '🏛️ عن الكلية والمكتبة' : '🏛️ About Library',
    reqBorrow: lang === 'ar' ? '📝 طلب استعارة كتاب' : '📝 Request Book Loan',
    availBooks: lang === 'ar' ? '📚 تصفح الكتب المتوفرة' : '📚 Available Books Catalog',
    gradProjects: lang === 'ar' ? '🎓 مشاريع التخرج الرقمية' : '🎓 Digital Graduation Projects',
    libraryActivities: lang === 'ar' ? '📅 الفعاليات والأنشطة' : '📅 Library Activities',
    mostRead: lang === 'ar' ? '⭐ أحدث الكتب المتاحة في النظام' : '⭐ Latest Available Books',
    close: lang === 'ar' ? 'إغلاق ✕' : 'Close ✕',
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.mainCard}>
          
          {/* شريط التنقل العلوي */}
          <View style={[styles.navbar, lang === 'en' && styles.navbarEn]}>
            <View style={styles.navLinks}>
              <TouchableOpacity style={styles.navBtnActive}><Text style={styles.navTextActive}>{t.home}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.navBtn}><Text style={styles.navText}>{t.services}</Text></TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <TouchableOpacity style={styles.langToggleBtn} onPress={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
                <Text style={styles.langToggleText}>🌐 {lang === 'ar' ? 'English' : 'عربي'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutBtnText}>{t.logout}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ترويسة العنوان */}
          <View style={[styles.headerRow, lang === 'en' && styles.headerRowEn]}>
            <View style={styles.headerTitleBox}>
              <Text style={styles.headerTitleText}>{t.title}</Text>
              <Text style={styles.headerSubTitleText}>{t.subTitle}</Text>
            </View>
          </View>

          {/* شريط البحث المتقدم */}
          <View style={styles.searchContainer}>
            <TextInput 
              style={[styles.searchInput, { textAlign: lang === 'ar' ? 'right' : 'left' }]} 
              placeholder={t.searchPlaceholder}
              placeholderTextColor="#B0A495"
              value={searchQuery}
              onChangeText={searchQuery => setSearchQuery(searchQuery)}
            />
          </View>

          {/* جسم الصفحة الرئيسي (الشريط الجانبي والأزرار) */}
          <View style={[styles.contentLayout, isDesktop ? styles.desktopLayoutAr : styles.mobileLayout]}>
            
            {/* الشريط الجانبي */}
            <View style={styles.sidebar}>
              <TouchableOpacity style={styles.sidebarBtn} onPress={() => setModalType('profile')}>
                <Text style={styles.sidebarBtnText}>{t.userAccount}</Text>
              </TouchableOpacity>
              
              {/* زر الانتقال لصفحة التعريف بالمكتبة والكلية */}
              <TouchableOpacity style={styles.sidebarBtn} onPress={() => router.push('/about')}>
                <Text style={styles.sidebarBtnText}>{t.aboutLibrary}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarBtn} onPress={() => setModalType('activities')}>
                <Text style={styles.sidebarBtnText}>{t.libraryActivities}</Text>
              </TouchableOpacity>
            </View>

            {/* الأزرار التفاعلية الرئيسية */}
            <View style={styles.mainGridArea}>
              <View style={styles.gridContainer}>
                <TouchableOpacity style={styles.gridCard} onPress={() => setModalType('borrow')}>
                  <Text style={styles.gridCardIcon}>📝</Text>
                  <Text style={styles.gridCardText}>{t.reqBorrow}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridCard} onPress={() => setModalType('available')}>
                  <Text style={styles.gridCardIcon}>📚</Text>
                  <Text style={styles.gridCardText}>{t.availBooks}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridCard} onPress={() => setModalType('projects')}>
                  <Text style={styles.gridCardIcon}>🎓</Text>
                  <Text style={styles.gridCardText}>{t.gradProjects}</Text>
                </TouchableOpacity>
              </View>

              {/* الجدول السفلي لعرض عينة من أحدث الكتب */}
              <View style={styles.tableCard}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableTitle}>{t.mostRead}</Text>
                </View>
                <View style={styles.tableBody}>
                  {filteredBooks.slice(0, 5).map((b, index) => (
                    <View key={b.id || index} style={styles.bookItemRow}>
                      <Text style={styles.tableRowText}>📖 {b.title} (النسخ المتاحة: {b.AvailableCopies ?? b.total_copies ?? 1})</Text>
                      {b.pdf_url ? (
                        <TouchableOpacity onPress={() => openPdfFile(b.pdf_url)}>
                          <Text style={{ color: '#27AE60', fontWeight: 'bold', fontSize: 11 }}>تحميل PDF 📄</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  ))}
                  {filteredBooks.length === 0 && (
                    <Text style={{ textAlign: 'center', color: '#8C6D46', padding: 10 }}>لا توجد كتب مطابقة للبحث</Text>
                  )}
                </View>
              </View>

            </View>
          </View>

        </View>
      </ScrollView>

      {/* النوافذ المنبثقة (Modals) للخدمات التفاعلية */}
      <Modal visible={modalType !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => { setModalType(null); setBorrowMessage(null); }}>
              <Text style={styles.closeModalText}>{t.close}</Text>
            </TouchableOpacity>

            {/* 1. نافذة الملف الشخصي للطالب */}
            {modalType === 'profile' && userData && (
              <View>
                <Text style={styles.modalTitle}>👤 معلومات الحساب الأكاديمي</Text>
                <View style={styles.modalDetailRow}><Text style={styles.modalLabel}>اسم الطالب:</Text><Text style={styles.modalVal}>{userData.name}</Text></View>
                <View style={styles.modalDetailRow}><Text style={styles.modalLabel}>البريد الإلكتروني:</Text><Text style={styles.modalVal}>{userData.email}</Text></View>
                <View style={styles.modalDetailRow}><Text style={styles.modalLabel}>الصلاحية:</Text><Text style={styles.modalVal}>{userData.role}</Text></View>
                <View style={styles.modalDetailRow}><Text style={styles.modalLabel}>الجامعة:</Text><Text style={styles.modalVal}>جامعة الزنتان - كلية العلوم</Text></View>
              </View>
            )}

            {/* 2. نافذة طلب الاستعارة */}
            {modalType === 'borrow' && (
              <View>
                <Text style={styles.modalTitle}>📝 استعارة الكتب المتاحة</Text>
                {borrowMessage && <Text style={{ textAlign: 'center', marginVertical: 8, fontWeight: 'bold', color: borrowMessage.includes('✅') ? '#27AE60' : '#D9534F' }}>{borrowMessage}</Text>}
                <ScrollView style={{ maxHeight: 280, marginTop: 10 }}>
                  {books.map((b, i) => (
                    <View key={i} style={styles.borrowBookCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: 'bold', color: '#6E5230' }}>📖 {b.title}</Text>
                        <Text style={{ fontSize: 11, color: '#8C6D46' }}>النسخ المتاحة: {b.AvailableCopies ?? 1}</Text>
                      </View>
                      <TouchableOpacity style={styles.borrowActionBtn} onPress={() => handleBorrowBook(b)}>
                        <Text style={styles.borrowActionText}>استعارة</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* 3. نافذة تصفح الكتب المتوفرة وقراءة الـ PDF */}
            {modalType === 'available' && (
              <View>
                <Text style={styles.modalTitle}>📚 قائمة الكتب الرقمية والورقية</Text>
                <ScrollView style={{ maxHeight: 300, marginTop: 10 }}>
                  {books.map((b, i) => (
                    <View key={i} style={styles.borrowBookCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: 'bold', color: '#6E5230' }}>{b.title}</Text>
                        <Text style={{ fontSize: 11, color: '#8C6D46' }}>ISBN: {b.isbn || 'غير متوفر'} | سنة النشر: {b.publication_year || 'غير محدد'}</Text>
                      </View>
                      {b.pdf_url ? (
                        <TouchableOpacity style={styles.pdfOpenBtn} onPress={() => openPdfFile(b.pdf_url)}>
                          <Text style={styles.pdfOpenText}>فتح PDF 📄</Text>
                        </TouchableOpacity>
                      ) : (
                        <Text style={{ fontSize: 11, color: '#999' }}>ورقي فقط</Text>
                      )}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* 4. نافذة مشاريع التخرج الرقمية مع الـ PDF */}
            {modalType === 'projects' && (
              <View>
                <Text style={styles.modalTitle}>🎓 مشاريع التخرج الأكاديمية</Text>
                <ScrollView style={{ maxHeight: 300, marginTop: 10 }}>
                  {projects.map((p, i) => (
                    <View key={i} style={styles.borrowBookCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: 'bold', color: '#6E5230' }}>🎓 {p.title}</Text>
                        <Text style={{ fontSize: 11, color: '#8C6D46' }}>القسم: {p.department} | السنة: {p.year}</Text>
                        <Text style={{ fontSize: 11, color: '#554433' }}>الطلبة: {p.students} | المشرف: {p.supervisor}</Text>
                      </View>
                      {p.pdf_url ? (
                        <TouchableOpacity style={styles.pdfOpenBtn} onPress={() => openPdfFile(p.pdf_url)}>
                          <Text style={styles.pdfOpenText}>مشروع PDF 📄</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  ))}
                  {projects.length === 0 && (
                    <Text style={{ textAlign: 'center', color: '#8C6D46', padding: 20 }}>لا توجد مشاريع تخرج مرفوعة حالياً</Text>
                  )}
                </ScrollView>
              </View>
            )}

            {/* 5. نافذة أنشطة وفعاليات المكتبة */}
            {modalType === 'activities' && (
              <View>
                <Text style={styles.modalTitle}>📅 آخر أنشطة وفعاليات المكتبة</Text>
                <ScrollView style={{ maxHeight: 300, marginTop: 10 }}>
                  {activities.map((a, i) => (
                    <View key={i} style={styles.borrowBookCard}>
                      <Text style={{ fontWeight: 'bold', color: '#6E5230', marginBottom: 4 }}>📌 {a.title}</Text>
                      <Text style={{ fontSize: 12, color: '#554433' }}>{a.description}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F4EE' },
  scrollContainer: { paddingVertical: 30, paddingHorizontal: 20, alignItems: 'center' },
  mainCard: { width: '100%', maxWidth: 1000, backgroundColor: 'rgba(255, 255, 255, 0.85)', borderRadius: 24, padding: 25, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.9)' },
  navbar: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  navbarEn: { flexDirection: 'row' },
  navLinks: { flexDirection: 'row-reverse', gap: 8 },
  navBtnActive: { backgroundColor: '#B89047', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 8 },
  navTextActive: { color: '#FFF', fontWeight: 'bold' },
  navBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  navText: { color: '#8C6D46', fontWeight: '600' },
  langToggleBtn: { backgroundColor: 'rgba(212, 175, 55, 0.15)', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#D4AF37' },
  langToggleText: { color: '#725232', fontWeight: '800', fontSize: 12 },
  logoutBtn: { backgroundColor: 'rgba(217, 83, 79, 0.15)', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 },
  logoutBtnText: { color: '#D9534F', fontWeight: '800', fontSize: 12 },
  headerRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 20 },
  headerRowEn: { flexDirection: 'row' },
  headerTitleBox: { alignItems: 'flex-start' },
  headerTitleText: { fontSize: 24, fontWeight: '900', color: '#725232' },
  headerSubTitleText: { fontSize: 10, fontWeight: '600', color: '#A08564', letterSpacing: 1 },
  searchContainer: { marginBottom: 25 },
  searchInput: { backgroundColor: '#FFF', borderWidth: 1.2, borderColor: '#D4AF37', borderRadius: 12, padding: 12, fontSize: 14, color: '#333' },
  contentLayout: { gap: 20 },
  desktopLayoutAr: { flexDirection: 'row-reverse' },
  mobileLayout: { flexDirection: 'column-reverse' },
  sidebar: { width: 220, gap: 10 },
  sidebarBtn: { backgroundColor: '#FFF', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.4)', padding: 14, borderRadius: 12, alignItems: 'center' },
  sidebarBtnText: { color: '#6E5230', fontWeight: '700', fontSize: 13 },
  mainGridArea: { flex: 1, gap: 20 },
  gridContainer: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12 },
  gridCard: { flex: 1, minWidth: 150, backgroundColor: '#FFF', borderWidth: 1.2, borderColor: '#D4AF37', borderRadius: 14, paddingVertical: 20, paddingHorizontal: 10, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  gridCardIcon: { fontSize: 26, marginBottom: 6 },
  gridCardText: { color: '#725232', fontWeight: '800', fontSize: 13, textAlign: 'center' },
  tableCard: { backgroundColor: '#FFF', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)', overflow: 'hidden' },
  tableHeader: { backgroundColor: 'rgba(212, 175, 55, 0.2)', padding: 12, alignItems: 'center' },
  tableTitle: { color: '#725232', fontWeight: 'bold', fontSize: 14 },
  tableBody: { padding: 12 },
  bookItemRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 0.6, borderColor: '#EEE', paddingVertical: 8 },
  tableRowText: { color: '#554433', fontSize: 13, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 550, backgroundColor: '#FFF', borderRadius: 20, padding: 25, borderWidth: 1, borderColor: '#D4AF37' },
  closeModalBtn: { alignSelf: 'flex-end', backgroundColor: '#F0E6D8', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  closeModalText: { color: '#725232', fontWeight: 'bold', fontSize: 12 },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: '#725232', textAlign: 'right', marginBottom: 15 },
  modalDetailRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#F4F0E8' },
  modalLabel: { fontWeight: 'bold', color: '#8C6D46' },
  modalVal: { color: '#554433', fontWeight: '600' },
  borrowBookCard: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#FAF7F2', borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)' },
  borrowActionBtn: { backgroundColor: '#B89047', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  borrowActionText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  pdfOpenBtn: { backgroundColor: 'rgba(39, 174, 96, 0.15)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  pdfOpenText: { color: '#27AE60', fontWeight: 'bold', fontSize: 11 }
});