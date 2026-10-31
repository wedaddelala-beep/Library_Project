import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Platform, Alert, Modal, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, Camera } from 'expo-camera';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'books' | 'activities' | 'projects'>('profile');

  const adminProfile = {
    name: 'وداد عبدالمجيد دلالة',
    email: 'wedad@zentan.edu.ly',
    role: 'مدير النظام والمكتبة الرقمية',
    department: 'قسم الحاسب الآلي - كلية العلوم',
    avatar: require('../../assets/images/مكتبة .png'),
  };

  const [books, setBooks] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  // حقول إضافة الكتاب
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [pubYear, setPubYear] = useState('');
  const [totalCopies, setTotalCopies] = useState('1');
  const [pdfUrl, setPdfUrl] = useState(''); // حقل رابط نسخة الـ PDF للكتب

  // حالات الكاميرا وماسح الباركود
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  // حقول الفعاليات
  const [actTitle, setActTitle] = useState('');
  const [actDesc, setActDesc] = useState('');

  // حقول مشاريع التخرج (مع دعم رابط الـ PDF للمشروع)
  const [projTitle, setProjTitle] = useState('');
  const [projDept, setProjDept] = useState('');
  const [projStudents, setProjStudents] = useState('');
  const [projSupervisor, setProjSupervisor] = useState('');
  const [projYear, setProjYear] = useState('');
  const [projPdfUrl, setProjPdfUrl] = useState(''); // حقل ملف PDF لمشروع التخرج

  const [isEditBookModalVisible, setIsEditBookModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);

  const fetchData = async () => {
    try {
      const resBooks = await fetch(`${API_BASE_URL}/books`);
      if (resBooks.ok) setBooks(await resBooks.json());

      const resAct = await fetch(`${API_BASE_URL}/activities`);
      if (resAct.ok) setActivities(await resAct.json());

      const resProj = await fetch(`${API_BASE_URL}/projects`);
      if (resProj.ok) setProjects(await resProj.json());
    } catch (err) {
      console.log('خطأ الاتصال بالسيرفر:', err);
    }
  };

  useEffect(() => {
    fetchData();
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      router.replace('/index');
    } catch (error) {
      console.error('خطأ أثناء تسجيل الخروج:', error);
    }
  };

  // استقبال الباركود بعد المسح بالكاميرا
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setIsbn(data);
    setIsScannerVisible(false);
    Alert.alert('نجح المسح 📷', `تم التقاط الرقم المعياري الدولي للكتاب: ${data}`);
  };

  const addNewBookDirectly = async () => {
    if (!title.trim()) {
      Alert.alert('تنبيه هام', 'الرجاء كتابة عنوان الكتاب!');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          isbn: isbn.trim() || null,
          publication_year: pubYear.trim() || null,
          total_copies: parseInt(totalCopies) || 1,
          pdf_url: pdfUrl.trim() || null
        })
      });

      if (response.ok) {
        Alert.alert('نجاح 🌟', 'تمت إضافة الكتاب ونسخة PDF بنجاح!');
        setTitle(''); setIsbn(''); setPubYear(''); setTotalCopies('1'); setPdfUrl('');
        fetchData();
      } else {
        Alert.alert('خطأ', 'فشل في إضافة الكتاب');
      }
    } catch (error) {
      console.log('خطأ الشبكة:', error);
    }
  };

  const handleUpdateBook = async () => {
    if (!selectedBook?.title) return;
    try {
      const response = await fetch(`${API_BASE_URL}/books/${selectedBook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedBook.title.trim(),
          isbn: selectedBook.isbn || '',
          publication_year: selectedBook.publication_year || '',
          total_copies: selectedBook.total_copies || 1,
          pdf_url: selectedBook.pdf_url || ''
        }),
      });
      if (response.ok) {
        Alert.alert('نجاح', 'تم تحديث بيانات الكتاب ونسخة PDF بنجاح');
        setIsEditBookModalVisible(false);
        fetchData();
      }
    } catch (error) { console.log(error); }
  };

  const handleDeleteBook = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${id}`, { method: 'DELETE' });
      if (response.ok) fetchData();
    } catch (error) { console.log(error); }
  };

  const handleAddActivity = async () => {
    if (!actTitle.trim() || !actDesc.trim()) {
      Alert.alert('تنبيه', 'الرجاء تعبئة بيانات الفعالية');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: actTitle.trim(), description: actDesc.trim() }),
      });
      if (response.ok) {
        Alert.alert('نجاح', 'تم نشر الفعالية بنجاح');
        setActTitle(''); setActDesc('');
        fetchData();
      }
    } catch (error) { console.log(error); }
  };

  const handleDeleteActivity = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/activities/${id}`, { method: 'DELETE' });
      if (response.ok) fetchData();
    } catch (error) { console.log(error); }
  };

  const handleAddProject = async () => {
    if (!projTitle.trim()) {
      Alert.alert('تنبيه', 'الرجاء إدخال عنوان مشروع التخرج!');
      return;
    }

    try {
      const payload = {
        title: projTitle.trim(),
        department: projDept,
        students: projStudents.trim(),
        supervisor: projSupervisor.trim(),
        year: projYear.trim() || '2026',
        pdf_url: projPdfUrl.trim() || null // إرسال رابط الـ PDF لمشروع التخرج
      };

      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        Alert.alert('نجاح 🎓', 'تمت إضافة مشروع التخرج مع نسخة PDF بنجاح!');
        setProjTitle(''); setProjDept(''); setProjStudents(''); setProjSupervisor(''); setProjYear(''); setProjPdfUrl('');
        fetchData();
      }
    } catch (error) {
      console.error('خطأ شبكة:', error);
    }
  };

  const handleDeleteProject = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, { method: 'DELETE' });
      if (response.ok) fetchData();
    } catch (error) { console.log(error); }
  };

  // فتح رابط ملف الـ PDF لقراءته مباشرة
  const openPdfFile = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(() => Alert.alert('خطأ', 'تعذر فتح رابط الملف'));
    } else {
      Alert.alert('تنبيه', 'لا تتوفر نسخة PDF إلكترونية لهذا العنصر');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* الترويسة العلوية */}
        <View style={styles.glassHeader}>
          <View style={styles.headerRight}>
            <Image source={adminProfile.avatar} style={styles.headerAvatar} />
            <View>
              <Text style={styles.adminNameText}>{adminProfile.name}</Text>
              <Text style={styles.adminRoleText}>{adminProfile.role}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>تسجيل الخروج 🚪</Text>
          </TouchableOpacity>
        </View>

        {/* كروت الإحصائيات السريعة */}
        <View style={styles.statsGrid}>
          <TouchableOpacity style={styles.statGlassCard} onPress={() => setActiveTab('books')}>
            <Text style={styles.statIcon}>📚</Text>
            <Text style={styles.statNumber}>{books.length}</Text>
            <Text style={styles.statLabel}>إدارة الكتب و PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statGlassCard} onPress={() => setActiveTab('activities')}>
            <Text style={styles.statIcon}>🎨</Text>
            <Text style={styles.statNumber}>{activities.length}</Text>
            <Text style={styles.statLabel}>إدارة الأنشطة</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statGlassCard} onPress={() => setActiveTab('projects')}>
            <Text style={styles.statIcon}>🎓</Text>
            <Text style={styles.statNumber}>{projects.length}</Text>
            <Text style={styles.statLabel}>مشاريع التخرج و PDF</Text>
          </TouchableOpacity>
        </View>

        {/* شريط التنقل الرئيسي */}
        <View style={styles.tabBar}>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'profile' && styles.activeTabBtn]} onPress={() => setActiveTab('profile')}>
            <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>الملف الشخصي</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'books' && styles.activeTabBtn]} onPress={() => setActiveTab('books')}>
            <Text style={[styles.tabText, activeTab === 'books' && styles.activeTabText]}>الكتب والنسخ الرقمية</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'activities' && styles.activeTabBtn]} onPress={() => setActiveTab('activities')}>
            <Text style={[styles.tabText, activeTab === 'activities' && styles.activeTabText]}>الأنشطة</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'projects' && styles.activeTabBtn]} onPress={() => setActiveTab('projects')}>
            <Text style={[styles.tabText, activeTab === 'projects' && styles.activeTabText]}>مشاريع التخرج</Text>
          </TouchableOpacity>
        </View>

        {/* تبويب الملف الشخصي */}
        {activeTab === 'profile' && (
          <View style={styles.glassContentCard}>
            <Text style={styles.cardTitle}>بيانات الحساب الشخصي</Text>
            <View style={styles.profileDetailRow}><Text style={styles.profileLabel}>الاسم الكامل:</Text><Text style={styles.profileVal}>{adminProfile.name}</Text></View>
            <View style={styles.profileDetailRow}><Text style={styles.profileLabel}>البريد الإلكتروني:</Text><Text style={styles.profileVal}>{adminProfile.email}</Text></View>
            <View style={styles.profileDetailRow}><Text style={styles.profileLabel}>الجهة الأكاديمية:</Text><Text style={styles.profileVal}>{adminProfile.department}</Text></View>
          </View>
        )}

        {/* تبويب الكتب مع دعم الباركود والـ PDF */}
        {activeTab === 'books' && (
          <View style={styles.glassContentCard}>
            <Text style={styles.cardTitle}>إضافة كتاب جديد ونسخة رقمية (PDF)</Text>
            <TextInput style={styles.glassInput} placeholder="عنوان الكتاب" value={title} onChangeText={setTitle} />
            
            {/* حقل الـ ISBN + زر مسح الباركود */}
            <View style={{ flexDirection: 'row-reverse', gap: 10, alignItems: 'center' }}>
              <TextInput style={[styles.glassInput, { flex: 1, marginBottom: 0 }]} placeholder="رقم المعيار الدولي (ISBN)" value={isbn} onChangeText={setIsbn} />
              <TouchableOpacity style={styles.scanBtn} onPress={() => setIsScannerVisible(true)}>
                <Text style={styles.scanBtnText}>📷 مسح باركود</Text>
              </TouchableOpacity>
            </View>

            <TextInput style={[styles.glassInput, { marginTop: 8 }]} placeholder="سنة النشر (مثال: 2026)" value={pubYear} onChangeText={setPubYear} keyboardType="numeric" />
            <TextInput style={styles.glassInput} placeholder="عدد النسخ الكلية" value={totalCopies} onChangeText={setTotalCopies} keyboardType="numeric" />
            
            {/* حقل إضافة رابط كتاب PDF */}
            <TextInput style={styles.glassInput} placeholder="رابط كتاب PDF الإلكتروني (مثال: http://.../book.pdf)" value={pdfUrl} onChangeText={setPdfUrl} autoCapitalize="none" />

            <TouchableOpacity style={styles.actionAddBtn} onPress={addNewBookDirectly}>
              <Text style={styles.actionBtnText}>+ حفظ الكتاب وقاعدة البيانات</Text>
            </TouchableOpacity>

            <Text style={[styles.cardTitle, { marginTop: 25 }]}>قائمة الكتب المخزنة ({books.length})</Text>
            {books.map((b) => (
              <View key={b.id} style={styles.listItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{b.title}</Text>
                  <Text style={styles.itemSub}>المتاح: {b.AvailableCopies || b.total_copies} | الإجمالي: {b.TotalCopies || b.total_copies}</Text>
                  {b.pdf_url ? (
                    <Text style={styles.pdfBadgeText}>📄 يتوفر نسخة إلكترونية PDF</Text>
                  ) : null}
                </View>
                
                <View style={styles.rowActions}>
                  {b.pdf_url ? (
                    <TouchableOpacity style={styles.pdfBtn} onPress={() => openPdfFile(b.pdf_url)}>
                      <Text style={styles.pdfBtnText}>عرض PDF 📄</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity style={styles.editBtn} onPress={() => { setSelectedBook(b); setIsEditBookModalVisible(true); }}><Text style={styles.editBtnText}>تعديل ✏️</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteBook(b.id)}><Text style={styles.deleteBtnText}>حذف 🗑️</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* تبويب الأنشطة والفعاليات */}
        {activeTab === 'activities' && (
          <View style={styles.glassContentCard}>
            <Text style={styles.cardTitle}>إضافة نشاط / فعالية</Text>
            <TextInput style={styles.glassInput} placeholder="عنوان الفعالية" value={actTitle} onChangeText={setActTitle} />
            <TextInput style={[styles.glassInput, { height: 80 }]} multiline placeholder="تفاصيل الفعالية" value={actDesc} onChangeText={setActDesc} />
            <TouchableOpacity style={styles.actionAddBtn} onPress={handleAddActivity}>
              <Text style={styles.actionBtnText}>+ نشر الفعالية</Text>
            </TouchableOpacity>

            <Text style={[styles.cardTitle, { marginTop: 25 }]}>الفعاليات المعروضة ({activities.length})</Text>
            {activities.map((a) => (
              <View key={a.id} style={styles.listItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{a.title}</Text>
                  <Text style={styles.itemSub}>{a.description}</Text>
                </View>
                <View style={styles.rowActions}>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteActivity(a.id)}><Text style={styles.deleteBtnText}>حذف 🗑️</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* تبويب مشاريع التخرج مع دعم ملفات الـ PDF */}
        {activeTab === 'projects' && (
          <View style={styles.glassContentCard}>
            <Text style={styles.cardTitle}>🎓 إضافة مشروع تخرج جديد مع نسخة PDF</Text>
            <TextInput style={styles.glassInput} placeholder="عنوان مشروع التخرج" value={projTitle} onChangeText={setProjTitle} />
            <TextInput style={styles.glassInput} placeholder="القسم الأكاديمي" value={projDept} onChangeText={setProjDept} />
            <TextInput style={styles.glassInput} placeholder="أسماء الطلبة" value={projStudents} onChangeText={setProjStudents} />
            <TextInput style={styles.glassInput} placeholder="الأستاذ المشرف" value={projSupervisor} onChangeText={setProjSupervisor} />
            <TextInput style={styles.glassInput} placeholder="سنة النشر (2026)" value={projYear} onChangeText={setProjYear} keyboardType="numeric" />
            
            {/* حقل إضافة رابط ملف PDF لمشروع التخرج */}
            <TextInput style={styles.glassInput} placeholder="رابط مشروع التخرج PDF (مثال: http://.../project.pdf)" value={projPdfUrl} onChangeText={setProjPdfUrl} autoCapitalize="none" />

            <TouchableOpacity style={styles.actionAddBtn} onPress={handleAddProject}>
              <Text style={styles.actionBtnText}>+ حفظ مشروع التخرج وPDF</Text>
            </TouchableOpacity>

            <Text style={[styles.cardTitle, { marginTop: 25 }]}>قائمة مشاريع التخرج ({projects.length})</Text>
            {projects.map((p) => (
              <View key={p.id} style={styles.listItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>🎓 {p.title}</Text>
                  <Text style={styles.itemSub}>القسم: {p.department} | السنة: {p.year}</Text>
                  <Text style={styles.itemSub}>الطلبة: {p.students} | المشرف: {p.supervisor}</Text>
                  {p.pdf_url ? (
                    <Text style={styles.pdfBadgeText}>📄 يتوفر ملف المشروع PDF</Text>
                  ) : null}
                </View>

                <View style={styles.rowActions}>
                  {p.pdf_url ? (
                    <TouchableOpacity style={styles.pdfBtn} onPress={() => openPdfFile(p.pdf_url)}>
                      <Text style={styles.pdfBtnText}>عرض PDF 📄</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteProject(p.id)}><Text style={styles.deleteBtnText}>حذف 🗑️</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* نافذة ماسح الباركود للكاميرا */}
      <Modal visible={isScannerVisible} animationType="slide">
        <View style={styles.scannerContainer}>
          {hasCameraPermission === false ? (
            <Text style={{ color: '#fff', fontSize: 16 }}>لا يوجد إذن لتشغيل الكاميرا</Text>
          ) : (
            <CameraView
              onBarcodeScanned={handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["qr", "ean13", "code128", "pdf417"],
              }}
              style={StyleSheet.absoluteFillObject}
            />
          )}
          <View style={styles.scannerCloseWrapper}>
            <TouchableOpacity style={styles.scannerCloseBtn} onPress={() => setIsScannerVisible(false)}>
              <Text style={styles.scannerCloseText}>إغلاق الكاميرا ✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* نافذة تعديل بيانات الكتاب */}
      <Modal visible={isEditBookModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.cardTitle}>تعديل بيانات الكتاب والـ PDF</Text>
            <TextInput style={styles.glassInput} placeholder="عنوان الكتاب" value={selectedBook?.title || ''} onChangeText={(text) => setSelectedBook({ ...selectedBook, title: text })} />
            <TextInput style={styles.glassInput} placeholder="ISBN" value={selectedBook?.isbn || ''} onChangeText={(text) => setSelectedBook({ ...selectedBook, isbn: text })} />
            <TextInput style={styles.glassInput} placeholder="رابط PDF" value={selectedBook?.pdf_url || ''} onChangeText={(text) => setSelectedBook({ ...selectedBook, pdf_url: text })} />
            
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity style={[styles.actionAddBtn, { flex: 1, backgroundColor: '#6E5230', marginTop: 0 }]} onPress={() => setIsEditBookModalVisible(false)}><Text style={styles.actionBtnText}>إلغاء</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.actionAddBtn, { flex: 1, marginTop: 0 }]} onPress={handleUpdateBook}><Text style={styles.actionBtnText}>حفظ</Text></TouchableOpacity>
            </View>
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
  container: { flex: 1, backgroundColor: '#F4F0E8' },
  scrollContainer: { padding: 20, alignItems: 'center', gap: 20 },
  glassHeader: { width: '100%', maxWidth: 1000, backgroundColor: 'rgba(255, 255, 255, 0.75)', borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.9)', padding: 16, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  headerRight: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  headerAvatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 1.5, borderColor: '#B89047' },
  adminNameText: { fontSize: 16, fontWeight: 'bold', color: '#6E5230', fontFamily: fontFamilyStyle, textAlign: 'right' },
  adminRoleText: { fontSize: 12, color: '#8C6D46', fontFamily: fontFamilyStyle, textAlign: 'right' },
  logoutBtn: { backgroundColor: 'rgba(184, 144, 71, 0.15)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 },
  logoutBtnText: { color: '#6E5230', fontWeight: 'bold', fontSize: 12 },
  statsGrid: { width: '100%', maxWidth: 1000, flexDirection: 'row-reverse', gap: 15, flexWrap: 'wrap' },
  statGlassCard: { flex: 1, minWidth: 140, backgroundColor: 'rgba(255, 255, 255, 0.65)', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)', alignItems: 'center' },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statNumber: { fontSize: 22, fontWeight: '900', color: '#6E5230' },
  statLabel: { fontSize: 12, color: '#8C6D46', fontWeight: '600', textAlign: 'center' },
  tabBar: { width: '100%', maxWidth: 1000, flexDirection: 'row-reverse', gap: 8, flexWrap: 'wrap' },
  tabBtn: { flex: 1, minWidth: 110, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 14, alignItems: 'center' },
  activeTabBtn: { backgroundColor: '#6E5230' },
  tabText: { fontWeight: 'bold', color: '#6E5230', fontSize: 12 },
  activeTabText: { color: '#FFF' },
  glassContentCard: { width: '100%', maxWidth: 1000, backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.9)' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#6E5230', marginBottom: 15, textAlign: 'right' },
  profileDetailRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  profileLabel: { fontWeight: 'bold', color: '#8C6D46' },
  profileVal: { color: '#554433', fontWeight: '600' },
  glassInput: { backgroundColor: '#FFFFFF', borderWidth: 1.2, borderColor: 'rgba(212, 175, 55, 0.6)', borderRadius: 12, padding: 12, textAlign: 'right', marginBottom: 8, color: '#333' },
  scanBtn: { backgroundColor: '#8C6D46', justifyContent: 'center', paddingHorizontal: 14, borderRadius: 12, height: 45 },
  scanBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  actionAddBtn: { backgroundColor: '#B89047', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  actionBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  listItem: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.5)', padding: 12, borderRadius: 12, marginBottom: 8 },
  itemTitle: { fontWeight: 'bold', color: '#6E5230', textAlign: 'right' },
  itemSub: { fontSize: 12, color: '#8C6D46', textAlign: 'right' },
  pdfBadgeText: { fontSize: 11, color: '#27AE60', fontWeight: 'bold', marginTop: 4, textAlign: 'right' },
  rowActions: { flexDirection: 'row-reverse', gap: 6 },
  pdfBtn: { backgroundColor: 'rgba(39, 174, 96, 0.15)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  pdfBtnText: { color: '#27AE60', fontWeight: 'bold', fontSize: 11 },
  editBtn: { backgroundColor: 'rgba(184, 144, 71, 0.2)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  editBtnText: { color: '#8C6D46', fontWeight: 'bold', fontSize: 11 },
  deleteBtn: { backgroundColor: 'rgba(217, 83, 79, 0.15)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  deleteBtnText: { color: '#D9534F', fontWeight: 'bold', fontSize: 11 },
  scannerContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'flex-end', alignItems: 'center' },
  scannerCloseWrapper: { padding: 40, width: '100%', alignItems: 'center' },
  scannerCloseBtn: { backgroundColor: '#D9534F', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 12 },
  scannerCloseText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 500, backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#D4AF37' }
});