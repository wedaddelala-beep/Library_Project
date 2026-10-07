import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TextInput, ScrollView, TouchableOpacity, SafeAreaView, useWindowDimensions, Platform, Modal } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🌐 رابط السيرفر الموحد
const API_BASE_URL = 'http://172.20.10.3:5000/api';

// أقسام كلية العلوم - جامعة الزنتان الرسمية
const SCIENCE_DEPARTMENTS = [
  'قسم علم التقنية الحيوية',
  'قسم علم النبات',
  'قسم الكيمياء',
  'قسم علم الحاسوب',
  'قسم علم البيئة',
  'قسم الجيولوجيا',
  'قسم الرياضيات',
  'قسم الأحياء الدقيقة',
  'قسم الفيزياء',
  'قسم الإحصاء',
  'قسم علم الحيوان'
];

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  // حالة اللغة: 'ar' للعربية و 'en' للإنجليزية
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  // حالات البيانات الديناميكية
  const [books, setBooks] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]); 
  const [borrowedBooksList, setBorrowedBooksList] = useState<any[]>([]); 
  const [searchQuery, setSearchQuery] = useState('');

  // حالات النوافذ المنخفضة (Modals) للعرض والتفاعل
  const [modalType, setModalType] = useState<string | null>(null); 
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [borrowMessage, setBorrowMessage] = useState<string | null>(null);

  // دالة جلب البيانات من الباك إند
  const fetchLibraryData = async () => {
    try {
      const resBooks = await fetch(`${API_BASE_URL}/books`);
      if (resBooks.ok) {
        const booksData = await resBooks.json();
        setBooks(booksData);
      }

      const resActs = await fetch(`${API_BASE_URL}/activities`);
      if (resActs.ok) {
        const actsData = await resActs.json();
        setActivities(actsData);
      }

      const resProj = await fetch(`${API_BASE_URL}/projects`);
      if (resProj.ok) {
        const projData = await resProj.json();
        setProjects(projData);
      }
    } catch (error) {
      console.log('خطأ أثناء جلب بيانات المكتبة:', error);
    }
  };

  // جلب الكتب المستعارة المحفوظة محلياً للمستخدم
  const loadBorrowedBooks = async () => {
    try {
      const storedBorrowed = await AsyncStorage.getItem('@user_borrowed_books');
      if (storedBorrowed) {
        setBorrowedBooksList(JSON.parse(storedBorrowed));
      }
    } catch (error) {
      console.log('خطأ في استرجاع الكتب المستعارة:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLibraryData();
      loadBorrowedBooks();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      router.replace('/login');
    } catch (error) {
      console.error('خطأ أثناء تسجيل الخروج:', error);
    }
  };

  // 📝 تنفيذ طلب الاستعارة وحفظ التواريخ بالتفصيل
  const handleBorrowBook = async (book: any) => {
    const today = new Date();
    const returnDate = new Date();
    returnDate.setDate(today.getDate() + 14); // مدة الإستعارة أسبوعين (14 يوم)

    const borrowRecord = {
      id: book.id || Math.random().toString(),
      title: book.title,
      author: book.author,
      category: book.category || 'عام',
      borrowDate: today.toLocaleDateString('ar-LY'),
      returnDate: returnDate.toLocaleDateString('ar-LY'),
      status: 'مستعار حالياً'
    };

    const exists = borrowedBooksList.some(b => b.title === book.title);
    if (exists) {
      setBorrowMessage(`⚠️ الكتاب "${book.title}" مستعار مسبقاً لديك!`);
      return;
    }

    const updatedList = [...borrowedBooksList, borrowRecord];
    setBorrowedBooksList(updatedList);
    
    try {
      await AsyncStorage.setItem('@user_borrowed_books', JSON.stringify(updatedList));
      setBorrowMessage(`✅ تم إستعارة الكتاب بنجاح! موعد الاسترجاع: ${borrowRecord.returnDate}`);
    } catch (error) {
      setBorrowMessage('❌ حدث خطأ أثناء حفظ تفاصيل الإستعارة.');
    }
  };

  // تصفية الكتب حسب البحث
  const filteredBooks = books.filter(b => 
    b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedBooks = selectedDept 
    ? filteredBooks.filter(b => b.category === selectedDept)
    : filteredBooks;

  const t = {
    home: lang === 'ar' ? 'الرئيسية' : 'Home',
    services: lang === 'ar' ? 'الخدمات' : 'Services',
    about: lang === 'ar' ? 'حولنا' : 'About',
    contact: lang === 'ar' ? 'تواصل معنا' : 'Contact',
    logout: lang === 'ar' ? 'تسجيل الخروج 🚪' : 'Logout 🚪',
    title: lang === 'ar' ? 'مكتبة كلية العلوم' : 'Faculty of Science Library',
    subTitle: 'ZENTAN UNIVERSITY FACULTY OF SCIENCE LIBRARY',
    searchPlaceholder: lang === 'ar' ? 'ابحث عن كتاب، مؤلف، أو تخصص...' : 'Search for books, authors, or category...',
    
    userAccount: lang === 'ar' ? '👤 حساب المستخدم' : '👤 User Profile',
    borrowedBooksSide: lang === 'ar' ? '📚 الكتب المستعارة' : '📚 Borrowed Books',
    returnDates: lang === 'ar' ? '🔄 مواعيد الاسترجاع' : '🔄 Return Dates',

    reqBorrow: lang === 'ar' ? '📝 طلب إستعارة' : '📝 Request Borrow',
    borrowedBooks: lang === 'ar' ? '📖 الكتب المستعارة' : '📖 Borrowed Books',
    availBooks: lang === 'ar' ? '📚 الكتب المتوفرة والأقسام' : '📚 Available Books & Depts',
    categories: lang === 'ar' ? '🗂️ أقسام الكتب' : '🗂️ Categories',
    openHours: lang === 'ar' ? '⏰ مواعيد الفتح' : '⏰ Opening Hours',
    gradProjects: lang === 'ar' ? '🎓 مشاريع التخرج' : '🎓 Grad Projects',

    mostRead: lang === 'ar' ? '⭐ الكتب الأكثر قراءة' : '⭐ Most Read Books',
    libraryActivities: lang === 'ar' ? '📅 نشاطات المكتبة' : '📅 Library Activities',
    close: lang === 'ar' ? 'إغلاق ✕' : 'Close ✕',
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.bgGlowTop} />
      <View style={styles.bgGlowBottom} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.mainCard}>

          {/* الشريط العلوي */}
          <View style={[styles.navbar, lang === 'en' && styles.navbarEn]}>
            <View style={styles.navLinks}>
              <TouchableOpacity style={styles.navBtnActive}><Text style={styles.navTextActive}>{t.home}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.navBtn}><Text style={styles.navText}>{t.services}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.navBtn}><Text style={styles.navText}>{t.about}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.navBtn}><Text style={styles.navText}>{t.contact}</Text></TouchableOpacity>
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

          {/* الترويسة والشعارات */}
          <View style={[styles.headerRow, lang === 'en' && styles.headerRowEn]}>
            <View style={styles.headerTitleBox}>
              <Text style={styles.headerTitleText}>{t.title}</Text>
              <Text style={styles.headerSubTitleText}>{t.subTitle}</Text>
            </View>

            <View style={styles.logoGroup}>
              <Image source={require('../../assets/images/مكتبة .png')} style={styles.circleLogo} resizeMode="cover" />
              <Image source={require('../../assets/images/FB_IMG_1776379564764.jpg')} style={styles.circleLogo} resizeMode="cover" />
              <Image source={require('../../assets/images/Screenshot_20260417-004535_Facebook.jpg')} style={styles.circleLogo} resizeMode="cover" />
            </View>
          </View>

          {/* شريط البحث */}
          <View style={styles.searchContainer}>
            <TextInput 
              style={[styles.searchInput, { textAlign: lang === 'ar' ? 'right' : 'left' }]} 
              placeholder={t.searchPlaceholder}
              placeholderTextColor="#B0A495"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Text style={[styles.searchIcon, lang === 'ar' ? { left: 15 } : { right: 15 }]}>🔍</Text>
          </View>

          {/* محتوى الصفحة */}
          <View style={[
            styles.contentLayout, 
            isDesktop ? (lang === 'ar' ? styles.desktopLayoutAr : styles.desktopLayoutEn) : styles.mobileLayout
          ]}>

            <View style={styles.sidebar}>
              <TouchableOpacity style={styles.sidebarBtn} onPress={() => setModalType('profile')}><Text style={styles.sidebarBtnText}>{t.userAccount}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.sidebarBtn} onPress={() => setModalType('borrowed')}><Text style={styles.sidebarBtnText}>{t.borrowedBooksSide}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.sidebarBtn} onPress={() => setModalType('returnDates')}><Text style={styles.sidebarBtnText}>{t.returnDates}</Text></TouchableOpacity>
            </View>

            <View style={styles.mainGridArea}>
              <View style={styles.gridContainer}>
                <TouchableOpacity style={styles.gridCard} onPress={() => { setBorrowMessage(null); setModalType('borrow'); }}><Text style={styles.gridCardText}>{t.reqBorrow}</Text></TouchableOpacity>
                <TouchableOpacity style={styles.gridCard} onPress={() => setModalType('borrowed')}><Text style={styles.gridCardText}>{t.borrowedBooks}</Text></TouchableOpacity>
                <TouchableOpacity style={styles.gridCard} onPress={() => setModalType('available')}><Text style={styles.gridCardText}>{t.availBooks}</Text></TouchableOpacity>
                <TouchableOpacity style={styles.gridCard} onPress={() => setModalType('categories')}><Text style={styles.gridCardText}>{t.categories}</Text></TouchableOpacity>
                <TouchableOpacity style={styles.gridCard} onPress={() => setModalType('hours')}><Text style={styles.gridCardText}>{t.openHours}</Text></TouchableOpacity>
                <TouchableOpacity style={styles.gridCard} onPress={() => setModalType('projects')}><Text style={styles.gridCardText}>{t.gradProjects}</Text></TouchableOpacity>
              </View>

              {/* الجداول السفليّة */}
              <View style={[styles.bottomTablesRow, isDesktop ? styles.desktopTables : styles.mobileTables]}>
                
                {/* الكتب الأكثر قراءة */}
                <View style={styles.tableCard}>
                  <View style={styles.tableHeader}><Text style={styles.tableTitle}>{t.mostRead}</Text></View>
                  <View style={styles.tableBody}>
                    {displayedBooks.length > 0 ? (
                      displayedBooks.slice(0, 4).map((b, index) => (
                        <View key={b.id || index} style={styles.bookItemRow}>
                          <Text style={[styles.tableRowText, { textAlign: lang === 'ar' ? 'right' : 'left' }]}>
                            • {b.title} ({b.author}) - <Text style={{color: '#B89047'}}>{b.category || 'عام'}</Text>
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={[styles.tableRowText, { textAlign: 'center', color: '#999' }]}>لا توجد كتب مطابقة للبحث</Text>
                    )}
                  </View>
                </View>

                {/* نشاطات المكتبة */}
                <View style={styles.tableCard}>
                  <View style={styles.tableHeader}><Text style={styles.tableTitle}>{t.libraryActivities}</Text></View>
                  <View style={styles.tableBody}>
                    {activities.length > 0 ? (
                      activities.slice(0, 3).map((act, index) => (
                        <View key={act.id || index} style={[styles.activityRow, lang === 'en' && styles.activityRowEn]}>
                          <Text style={styles.actCellText}>{act.title}</Text>
                          <Text style={styles.actCellDate}>{act.description}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={[styles.tableRowText, { textAlign: 'center', color: '#999' }]}>لا توجد فعاليات معلنة حالياً</Text>
                    )}
                  </View>
                </View>

              </View>

            </View>

          </View>

        </View>
      </ScrollView>

      {/* نافذة عرض التفاصيل المنبثقة (Modals) */}
      <Modal visible={modalType !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => { setModalType(null); setSelectedDept(null); setBorrowMessage(null); }}>
              <Text style={styles.closeModalText}>{t.close}</Text>
            </TouchableOpacity>

            {/* نافذة الكتب المتوفرة والأقسام (محدثة لتشمل الأقسام والكتب ومشاريع التخرج الخاصة بكل قسم) */}
            {modalType === 'available' && (
              <View>
                <Text style={styles.modalTitle}>📚 أقسام كلية العلوم - الكتب ومشاريع التخرج</Text>
                <Text style={styles.modalSubText}>اضغط على أي قسم لعرض الكتب ومشاريع التخرج التابعة له:</Text>
                
                <ScrollView style={{maxHeight: 320, marginTop: 5}}>
                  {SCIENCE_DEPARTMENTS.map((dept, idx) => {
                    const deptBooks = books.filter(b => b.category?.trim() === dept.trim());
                    const deptProjects = projects.filter(p => p.department?.trim() === dept.trim());
                    const isSelected = selectedDept === dept;

                    return (
                      <View key={idx} style={styles.departmentCardContainer}>
                        <TouchableOpacity 
                          style={[styles.deptHeaderToggle, isSelected && styles.deptHeaderToggleActive]}
                          onPress={() => setSelectedDept(isSelected ? null : dept)}
                        >
                          <Text style={[styles.deptHeaderTitle, isSelected && styles.deptHeaderTitleActive]}>
                            {dept} <Text style={{fontSize: 11}}>({deptBooks.length} كتب | {deptProjects.length} مشاريع)</Text>
                          </Text>
                          <Text style={[styles.deptToggleIcon, isSelected && {color: '#FFF'}]}>{isSelected ? '▲' : '▼'}</Text>
                        </TouchableOpacity>

                        {isSelected && (
                          <View style={styles.deptContentBox}>
                            {/* قسم الكتب */}
                            <Text style={styles.sectionSubtitle}>📖 الكتب المتاحة في القسم:</Text>
                            {deptBooks.length > 0 ? (
                              deptBooks.map((bk, bIdx) => (
                                <View key={bIdx} style={styles.subItemRow}>
                                  <Text style={styles.itemTitleText}>• {bk.title}</Text>
                                  <Text style={styles.itemDescText}>المؤلف: {bk.author}</Text>
                                </View>
                              ))
                            ) : (
                              <Text style={styles.emptyText}>لا توجد كتب مسجلة في هذا القسم حالياً.</Text>
                            )}

                            {/* قسم مشاريع التخرج */}
                            <Text style={[styles.sectionSubtitle, {marginTop: 10}]}>🎓 مشاريع التخرج للقسم:</Text>
                            {deptProjects.length > 0 ? (
                              deptProjects.map((proj, pIdx) => (
                                <View key={pIdx} style={styles.subItemRowProj}>
                                  <Text style={styles.itemTitleText}>🎓 {proj.title}</Text>
                                  <Text style={styles.itemDescText}>الطلاب: {proj.students} | المشرف: {proj.supervisor}</Text>
                                </View>
                              ))
                            ) : (
                              <Text style={styles.emptyText}>لا توجد مشاريع تخرج مسجلة في هذا القسم حالياً.</Text>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* أقسام الكتب السريعة */}
            {modalType === 'categories' && (
              <View>
                <Text style={styles.modalTitle}>🗂️ أقسام كلية العلوم</Text>
                <ScrollView style={{maxHeight: 300, marginTop: 10}}>
                  {SCIENCE_DEPARTMENTS.map((dept, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={[styles.deptItem, selectedDept === dept && styles.deptItemActive]}
                      onPress={() => setSelectedDept(selectedDept === dept ? null : dept)}
                    >
                      <Text style={[styles.deptText, selectedDept === dept && styles.deptTextActive]}>{dept}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {selectedDept && (
                  <View style={{marginTop: 15}}>
                    <Text style={{fontWeight: 'bold', color: '#725232', marginBottom: 5}}>كتب قسم: {selectedDept}</Text>
                    {books.filter(b => b.category === selectedDept).length > 0 ? (
                      books.filter(b => b.category === selectedDept).map((bk, i) => (
                        <Text key={i} style={{fontSize: 12, color: '#554433', marginBottom: 3}}>• {bk.title} للمؤلف: {bk.author}</Text>
                      ))
                    ) : (
                      <Text style={{fontSize: 12, color: '#999'}}>لا توجد كتب مضافة لهذا القسم حالياً.</Text>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* طلب الإستعارة */}
            {modalType === 'borrow' && (
              <View>
                <Text style={styles.modalTitle}>📝 طلب إستعارة كتاب</Text>
                <Text style={styles.modalSubText}>انقر على الكتاب أدناه لإتمام طلب الاستعارة وتثبيته في سجلك:</Text>
                {borrowMessage && <Text style={{color: borrowMessage.includes('❌') || borrowMessage.includes('⚠️') ? 'red' : 'green', marginTop: 5, marginBottom: 10, textAlign: 'center', fontWeight: 'bold', fontSize: 12}}>{borrowMessage}</Text>}
                <ScrollView style={{maxHeight: 230, marginTop: 5}}>
                  {books.map((b, i) => (
                    <TouchableOpacity key={i} style={styles.borrowBookCard} onPress={() => handleBorrowBook(b)}>
                      <Text style={{fontWeight: 'bold', color: '#725232'}}>📖 {b.title}</Text>
                      <Text style={{fontSize: 11, color: '#8C6D46'}}>المؤلف: {b.author} | القسم: {b.category || 'عام'}</Text>
                      <Text style={{fontSize: 10, color: '#007A55', marginTop: 2, fontWeight: '700'}}>اضغط هنا للإستعارة 👈</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* الكتب المستعارة */}
            {modalType === 'borrowed' && (
              <View>
                <Text style={styles.modalTitle}>📖 سجل الكتب المستعارة</Text>
                <ScrollView style={{maxHeight: 300, marginTop: 10}}>
                  {borrowedBooksList.length > 0 ? (
                    borrowedBooksList.map((item, i) => (
                      <View key={item.id || i} style={styles.detailsCardBox}>
                        <Text style={{fontWeight: 'bold', color: '#725232', fontSize: 13}}>📚 {item.title}</Text>
                        <Text style={{fontSize: 11, color: '#554433', marginTop: 2}}>المؤلف: {item.author} | التخصص: {item.category}</Text>
                        <View style={styles.dateBadgeRow}>
                          <Text style={styles.dateBadgeText}>📥 الاستلام: {item.borrowDate}</Text>
                          <Text style={[styles.dateBadgeText, {color: '#B85047'}]}>📤 الاسترجاع: {item.returnDate}</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={{textAlign: 'center', color: '#777', marginTop: 25}}>ليس لديك أي كتب مستعارة حالياً. قم بطلب إستعارة من القائمة الرئيسية.</Text>
                  )}
                </ScrollView>
              </View>
            )}

            {/* مواعيد الاسترجاع */}
            {modalType === 'returnDates' && (
              <View>
                <Text style={styles.modalTitle}>🔄 جدول مواعيد الاسترجاع التفصيلية</Text>
                <ScrollView style={{maxHeight: 300, marginTop: 10}}>
                  {borrowedBooksList.length > 0 ? (
                    borrowedBooksList.map((item, i) => (
                      <View key={i} style={styles.returnScheduleCard}>
                        <Text style={{fontWeight: 'bold', color: '#554433', fontSize: 13}}>📖 الكتاب: {item.title}</Text>
                        <Text style={{fontSize: 11, color: '#725232', marginTop: 3}}>📅 تاريخ الاستلام الفعلي: <Text style={{fontWeight: 'bold'}}>{item.borrowDate}</Text></Text>
                        <Text style={{fontSize: 11, color: '#D9534F', marginTop: 2}}>⏳ آخر موعد للإرجاع: <Text style={{fontWeight: 'bold'}}>{item.returnDate}</Text></Text>
                        <Text style={{fontSize: 10, color: '#666', marginTop: 4, fontStyle: 'italic'}}>* يرجى تسليم الكتاب في المكتبة قبل تاريخ الاسترجاع المحدد لتجنب الغرامات.</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={{textAlign: 'center', color: '#777', marginTop: 25}}>لا توجد مواعيد استرجاع مستحقة لعدم وجود كتب مستعارة.</Text>
                  )}
                </ScrollView>
              </View>
            )}

            {/* مواعيد الفتح */}
            {modalType === 'hours' && (
              <View>
                <Text style={styles.modalTitle}>⏰ مواعيد العمل والفتح بالمكتبة</Text>
                <View style={{marginTop: 15, gap: 10}}>
                  <Text style={styles.hourText}>🔹 الأيام: من الأحد إلى الخميس</Text>
                  <Text style={styles.hourText}>🔹 الفترة الصباحية: 08:30 صباحاً - 02:00 ظهراً</Text>
                  <Text style={styles.hourText}>🔹 أيام الإجازات: الجمعة والسبت (مغلق)</Text>
                </View>
              </View>
            )}

            {/* مشاريع التخرج العامة */}
            {modalType === 'projects' && (
              <View>
                <Text style={styles.modalTitle}>🎓 مشاريع التخرج - كلية العلوم</Text>
                <ScrollView style={{maxHeight: 250, marginTop: 10}}>
                  {projects.length > 0 ? (
                    projects.map((proj, i) => (
                      <View key={proj.id || i} style={{padding: 10, borderBottomWidth: 0.5, borderBottomColor: '#eee', marginBottom: 5}}>
                        <Text style={{fontWeight: 'bold', color: '#725232', fontSize: 13}}>🎓 {proj.title}</Text>
                        <Text style={{fontSize: 11, color: '#554433', marginTop: 2}}>القسم: {proj.department}</Text>
                        <Text style={{fontSize: 11, color: '#666'}}>الطلاب: {proj.students} | المشرف: {proj.supervisor}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={{textAlign: 'center', color: '#777', marginTop: 20}}>لا توجد مشاريع تخرج مسجلة حالياً.</Text>
                  )}
                </ScrollView>
              </View>
            )}

            {/* حساب المستخدم */}
            {modalType === 'profile' && (
              <View>
                <Text style={styles.modalTitle}>👤 معلومات الحساب</Text>
                <Text style={{marginTop: 15, color: '#554433', fontSize: 13}}>الدور: طالب / مستخدم أكاديمي</Text>
                <Text style={{marginTop: 5, color: '#554433', fontSize: 13}}>الكلية: كلية العلوم - جامعة الزنتان</Text>
              </View>
            )}

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const fontFamilyStyle = Platform.select({
  ios: 'System',
  android: 'sans-serif-medium',
  default: 'Segoe UI, Roboto, Helvetica, sans-serif',
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F4EE' },
  bgGlowTop: { position: 'absolute', top: -100, right: -100, width: 350, height: 350, borderRadius: 175, backgroundColor: 'rgba(212, 175, 55, 0.12)' },
  bgGlowBottom: { position: 'absolute', bottom: -120, left: -120, width: 400, height: 400, borderRadius: 200, backgroundColor: 'rgba(184, 144, 71, 0.1)' },
  scrollContainer: { paddingVertical: 30, paddingHorizontal: 20, alignItems: 'center' },
  mainCard: {
    width: '100%', maxWidth: 980, backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24, borderWidth: 1.5, borderColor: 'rgba(212, 175, 55, 0.3)', padding: 25,
    shadowColor: '#8C6D46', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20,
  },
  navbar: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  navbarEn: { flexDirection: 'row' },
  navLinks: { flexDirection: 'row-reverse', gap: 8 },
  navBtnActive: { backgroundColor: '#B89047', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 8 },
  navTextActive: { color: '#FFF', fontWeight: 'bold', fontSize: 13, fontFamily: fontFamilyStyle },
  navBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  navText: { color: '#8C6D46', fontWeight: '600', fontSize: 13, fontFamily: fontFamilyStyle },
  langToggleBtn: { backgroundColor: 'rgba(212, 175, 55, 0.15)', borderWidth: 1, borderColor: '#D4AF37', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 },
  langToggleText: { color: '#725232', fontWeight: '800', fontSize: 12, fontFamily: fontFamilyStyle },
  logoutBtn: { backgroundColor: 'rgba(217, 83, 79, 0.15)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  logoutBtnText: { color: '#D9534F', fontWeight: '800', fontSize: 12, fontFamily: fontFamilyStyle },
  headerRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerRowEn: { flexDirection: 'row' },
  headerTitleBox: { alignItems: 'flex-start' },
  headerTitleText: { fontSize: 23, fontWeight: '900', color: '#725232', fontFamily: fontFamilyStyle, letterSpacing: 0.3 },
  headerSubTitleText: { fontSize: 9, fontWeight: '700', color: '#A08564', letterSpacing: 1, marginTop: 2 },
  logoGroup: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  circleLogo: { width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, borderColor: '#D4AF37', backgroundColor: '#FFF' },
  searchContainer: { position: 'relative', marginBottom: 25, justifyContent: 'center' },
  searchInput: { backgroundColor: 'rgba(247, 244, 238, 0.95)', borderWidth: 1.5, borderColor: 'rgba(212, 175, 55, 0.4)', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 11, fontSize: 14, color: '#4A3B2C', fontFamily: fontFamilyStyle },
  searchIcon: { position: 'absolute', fontSize: 16 },
  contentLayout: { gap: 20 },
  desktopLayoutAr: { flexDirection: 'row-reverse' },
  desktopLayoutEn: { flexDirection: 'row' },
  mobileLayout: { flexDirection: 'column-reverse' },
  sidebar: { width: 200, gap: 10 },
  sidebarBtn: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderWidth: 1.5, borderColor: 'rgba(184, 144, 71, 0.35)', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center' },
  sidebarBtnText: { color: '#6E5230', fontWeight: '700', fontSize: 13, fontFamily: fontFamilyStyle },
  mainGridArea: { flex: 1, gap: 20 },
  gridContainer: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  gridCard: { width: '31%', backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#D4AF37', borderRadius: 12, paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  gridCardText: { color: '#725232', fontWeight: '800', fontSize: 13, fontFamily: fontFamilyStyle },
  bottomTablesRow: { gap: 15, marginTop: 10 },
  desktopTables: { flexDirection: 'row' },
  mobileTables: { flexDirection: 'column' },
  tableCard: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderWidth: 1.5, borderColor: 'rgba(212, 175, 55, 0.35)', borderRadius: 12, overflow: 'hidden' },
  tableHeader: { backgroundColor: 'rgba(212, 175, 55, 0.2)', paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center' },
  tableTitle: { color: '#725232', fontWeight: 'bold', fontSize: 13, fontFamily: fontFamilyStyle },
  tableBody: { padding: 12, gap: 8 },
  bookItemRow: { borderBottomWidth: 0.5, borderBottomColor: '#F0E6D8', paddingBottom: 4 },
  tableRowText: { color: '#554433', fontSize: 12, fontWeight: '600', fontFamily: fontFamilyStyle },
  activityRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingBottom: 4, borderBottomWidth: 0.5, borderBottomColor: '#EAE0D0' },
  activityRowEn: { flexDirection: 'row' },
  actCellText: { color: '#554433', fontSize: 12, fontWeight: '600', fontFamily: fontFamilyStyle },
  actCellDate: { color: '#8C6D46', fontSize: 12, fontWeight: '500', fontFamily: fontFamilyStyle },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 520, backgroundColor: '#FFF', borderRadius: 16, padding: 20, borderWidth: 1.5, borderColor: '#D4AF37' },
  closeModalBtn: { alignSelf: 'flex-end', backgroundColor: '#F0E6D8', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  closeModalText: { color: '#725232', fontWeight: 'bold', fontSize: 12 },
  modalTitle: { fontSize: 15, fontWeight: 'bold', color: '#725232', textAlign: 'right', marginBottom: 5 },
  modalSubText: { fontSize: 11, color: '#777', textAlign: 'right', marginBottom: 12 },
  
  departmentCardContainer: { marginBottom: 8, borderWidth: 1, borderColor: '#E5DCCB', borderRadius: 8, overflow: 'hidden', backgroundColor: '#FAF7F2' },
  deptHeaderToggle: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: '#F4EFE6' },
  deptHeaderToggleActive: { backgroundColor: '#B89047' },
  deptHeaderTitle: { fontSize: 12, fontWeight: 'bold', color: '#554433', textAlign: 'right' },
  deptHeaderTitleActive: { color: '#FFF' },
  deptToggleIcon: { fontSize: 11, color: '#725232', fontWeight: 'bold' },
  deptContentBox: { padding: 10, backgroundColor: '#FFF' },
  sectionSubtitle: { fontSize: 11, fontWeight: 'bold', color: '#725232', textAlign: 'right', marginBottom: 4 },
  subItemRow: { paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: '#F5F0E6' },
  subItemRowProj: { paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: '#F5F0E6', backgroundColor: '#FDFBF7', paddingHorizontal: 4, borderRadius: 4 },
  itemTitleText: { fontSize: 11, fontWeight: 'bold', color: '#4A3B2C', textAlign: 'right' },
  itemDescText: { fontSize: 10, color: '#777', textAlign: 'right' },
  emptyText: { fontSize: 10, color: '#999', textAlign: 'right', fontStyle: 'italic', marginBottom: 4 },

  deptItem: { padding: 10, backgroundColor: '#F7F4EE', borderRadius: 8, marginBottom: 6, borderWidth: 1, borderColor: '#E5DCCB' },
  deptItemActive: { backgroundColor: '#B89047' },
  deptText: { fontSize: 13, color: '#554433', fontWeight: '600', textAlign: 'right' },
  deptTextActive: { color: '#FFF' },
  borrowBookCard: { padding: 10, backgroundColor: '#FAF7F2', borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#D4AF37' },
  detailsCardBox: { padding: 12, backgroundColor: '#FAF7F2', borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#E5DCCB' },
  dateBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, borderTopWidth: 0.5, borderTopColor: '#E5DCCB', paddingTop: 6 },
  dateBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#554433' },
  returnScheduleCard: { padding: 12, backgroundColor: '#FFF5F5', borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#E5DCCB' },
  hourText: { fontSize: 14, color: '#554433', fontWeight: '600', textAlign: 'right' }
});