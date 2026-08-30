import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Platform, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';

const API_BASE_URL = 'http://localhost:5000/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'books' | 'activities'>('profile');

  // بيانات الأدمن الشخصية
  const adminProfile = {
    name: 'وداد عبدالمجيد دلالة',
    email: 'wedad@zentan.edu.ly',
    role: 'مدير النظام والمكتبة الرقمية',
    department: 'قسم الحاسب الآلي - كلية العلوم',
    avatar: require('../../assets/images/مكتبة .png'),
  };

  // بيانات الكتب والأنشطة
  const [books, setBooks] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  // مدخلات نموذج إضافة كتاب
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookCategory, setBookCategory] = useState('');

  // مدخلات نموذج إضافة نشاط
  const [actTitle, setActTitle] = useState('');
  const [actDesc, setActDesc] = useState('');

  // جلب البيانات من السيرفر
  const fetchData = async () => {
    try {
      const resBooks = await fetch(`${API_BASE_URL}/books`);
      const dataBooks = await resBooks.json();
      setBooks(dataBooks);

      const resAct = await fetch(`${API_BASE_URL}/activities`);
      const dataAct = await resAct.json();
      setActivities(dataAct);
    } catch (err) {
      console.log('خطأ الاتصال بالسيرفر:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // إضافة كتاب
  const handleAddBook = async () => {
    if (!bookTitle || !bookAuthor) return alert('الرجاء تعبئة العنوان والمؤلف');
    await fetch(`${API_BASE_URL}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: bookTitle, author: bookAuthor, category: bookCategory || 'عام' }),
    });
    setBookTitle(''); setBookAuthor(''); setBookCategory('');
    fetchData();
  };

  // حذف كتاب
  const handleDeleteBook = async (id: number) => {
    await fetch(`${API_BASE_URL}/books/${id}`, { method: 'DELETE' });
    fetchData();
  };

  // إضافة نشاط
  const handleAddActivity = async () => {
    if (!actTitle || !actDesc) return alert('الرجاء تعبئة جميع حقول النشاط');
    await fetch(`${API_BASE_URL}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: actTitle, description: actDesc }),
    });
    setActTitle(''); setActDesc('');
    fetchData();
  };

  // حذف نشاط
  const handleDeleteActivity = async (id: number) => {
    await fetch(`${API_BASE_URL}/activities/${id}`, { method: 'DELETE' });
    fetchData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* الترويسة العلوية للأدمن */}
        <View style={styles.glassHeader}>
          <View style={styles.headerRight}>
            <Image source={adminProfile.avatar} style={styles.headerAvatar} />
            <View>
              <Text style={styles.adminNameText}>{adminProfile.name}</Text>
              <Text style={styles.adminRoleText}>{adminProfile.role}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => router.push('/')}>
            <Text style={styles.logoutBtnText}>تسجيل الخروج 🚪</Text>
          </TouchableOpacity>
        </View>

        {/* الإحصائيات السريعة (Widgets) */}
        <View style={styles.statsGrid}>
          <View style={styles.statGlassCard}>
            <Text style={styles.statIcon}>📚</Text>
            <Text style={styles.statNumber}>{books.length}</Text>
            <Text style={styles.statLabel}>إجمالي الكتب</Text>
          </View>
          <View style={styles.statGlassCard}>
            <Text style={styles.statIcon}>🎨</Text>
            <Text style={styles.statNumber}>{activities.length}</Text>
            <Text style={styles.statLabel}>الأنشطة المضافة</Text>
          </View>
          <View style={styles.statGlassCard}>
            <Text style={styles.statIcon}>🎓</Text>
            <Text style={styles.statNumber}>120+</Text>
            <Text style={styles.statLabel}>الطلاب المسجلين</Text>
          </View>
        </View>

        {/* أزرار التبويب */}
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'profile' && styles.activeTabBtn]} 
            onPress={() => setActiveTab('profile')}
          >
            <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>الملف الشخصي</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'books' && styles.activeTabBtn]} 
            onPress={() => setActiveTab('books')}
          >
            <Text style={[styles.tabText, activeTab === 'books' && styles.activeTabText]}>إدارة الكتب</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'activities' && styles.activeTabBtn]} 
            onPress={() => setActiveTab('activities')}
          >
            <Text style={[styles.tabText, activeTab === 'activities' && styles.activeTabText]}>إدارة الأنشطة</Text>
          </TouchableOpacity>
        </View>

        {/* 1. قسم الملف الشخصي */}
        {activeTab === 'profile' && (
          <View style={styles.glassContentCard}>
            <Text style={styles.cardTitle}>بيانات الحساب الشخصي</Text>
            <View style={styles.profileDetailRow}>
              <Text style={styles.profileLabel}>الاسم الكامل:</Text>
              <Text style={styles.profileVal}>{adminProfile.name}</Text>
            </View>
            <View style={styles.profileDetailRow}>
              <Text style={styles.profileLabel}>البريد الإلكتروني:</Text>
              <Text style={styles.profileVal}>{adminProfile.email}</Text>
            </View>
            <View style={styles.profileDetailRow}>
              <Text style={styles.profileLabel}>الجهة الأكاديمية:</Text>
              <Text style={styles.profileVal}>{adminProfile.department}</Text>
            </View>
          </View>
        )}

        {/* 2. قسم إدارة الكتب */}
        {activeTab === 'books' && (
          <View style={styles.glassContentCard}>
            <Text style={styles.cardTitle}>إضافة كتاب جديد</Text>
            <View style={styles.formRow}>
              <TextInput style={styles.glassInput} placeholder="عنوان الكتاب" value={bookTitle} onChangeText={setBookTitle} />
              <TextInput style={styles.glassInput} placeholder="اسم المؤلف" value={bookAuthor} onChangeText={setBookAuthor} />
              <TextInput style={styles.glassInput} placeholder="التصنيف" value={bookCategory} onChangeText={setBookCategory} />
            </View>
            <TouchableOpacity style={styles.actionAddBtn} onPress={handleAddBook}>
              <Text style={styles.actionBtnText}>+ حفظ الكتاب</Text>
            </TouchableOpacity>

            <Text style={[styles.cardTitle, { marginTop: 25 }]}>قائمة الكتب الحالية</Text>
            {books.map((b) => (
              <View key={b.id} style={styles.listItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{b.title}</Text>
                  <Text style={styles.itemSub}>{b.author} | {b.category}</Text>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteBook(b.id)}>
                  <Text style={styles.deleteBtnText}>حذف 🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* 3. قسم إدارة الأنشطة */}
        {activeTab === 'activities' && (
          <View style={styles.glassContentCard}>
            <Text style={styles.cardTitle}>إضافة نشاط / فعالية</Text>
            <TextInput style={styles.glassInput} placeholder="عنوان الفعالية" value={actTitle} onChangeText={setActTitle} />
            <TextInput style={[styles.glassInput, { height: 80 }]} multiline placeholder="تفاصيل الفعالية" value={actDesc} onChangeText={setActDesc} />
            <TouchableOpacity style={styles.actionAddBtn} onPress={handleAddActivity}>
              <Text style={styles.actionBtnText}>+ نشر الفعالية</Text>
            </TouchableOpacity>

            <Text style={[styles.cardTitle, { marginTop: 25 }]}>الفعاليات المعروضة</Text>
            {activities.map((a) => (
              <View key={a.id} style={styles.listItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{a.title}</Text>
                  <Text style={styles.itemSub}>{a.description}</Text>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteActivity(a.id)}>
                  <Text style={styles.deleteBtnText}>حذف 🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

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
  container: { flex: 1, backgroundColor: '#F4F0E8' },
  scrollContainer: { padding: 20, alignItems: 'center', gap: 20 },
  glassHeader: {
    width: '100%', maxWidth: 1000, backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center'
  },
  headerRight: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  headerAvatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 1.5, borderColor: '#B89047' },
  adminNameText: { fontSize: 16, fontWeight: 'bold', color: '#6E5230', fontFamily: fontFamilyStyle, textAlign: 'right' },
  adminRoleText: { fontSize: 12, color: '#8C6D46', fontFamily: fontFamilyStyle, textAlign: 'right' },
  logoutBtn: { backgroundColor: 'rgba(184, 144, 71, 0.15)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 },
  logoutBtnText: { color: '#6E5230', fontWeight: 'bold', fontSize: 12 },
  
  statsGrid: { width: '100%', maxWidth: 1000, flexDirection: 'row-reverse', gap: 15, flexWrap: 'wrap' },
  statGlassCard: {
    flex: 1, minWidth: 150, backgroundColor: 'rgba(255, 255, 255, 0.65)', borderRadius: 20,
    padding: 16, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)', alignItems: 'center'
  },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statNumber: { fontSize: 22, fontWeight: '900', color: '#6E5230' },
  statLabel: { fontSize: 12, color: '#8C6D46', fontWeight: '600' },

  tabBar: { width: '100%', maxWidth: 1000, flexDirection: 'row-reverse', gap: 10 },
  tabBtn: { flex: 1, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 14, alignItems: 'center' },
  activeTabBtn: { backgroundColor: '#6E5230' },
  tabText: { fontWeight: 'bold', color: '#6E5230' },
  activeTabText: { color: '#FFF' },

  glassContentCard: {
    width: '100%', maxWidth: 1000, backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.9)'
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#6E5230', marginBottom: 15, textAlign: 'right' },
  profileDetailRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  profileLabel: { fontWeight: 'bold', color: '#8C6D46' },
  profileVal: { color: '#554433', fontWeight: '600' },

  formRow: { gap: 10, marginBottom: 10 },
  glassInput: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.4)', borderRadius: 12, padding: 10, textAlign: 'right', marginBottom: 8 },
  actionAddBtn: { backgroundColor: '#B89047', padding: 12, borderRadius: 12, alignItems: 'center' },
  actionBtnText: { color: '#FFF', fontWeight: 'bold' },

  listItem: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.5)', padding: 12, borderRadius: 12, marginBottom: 8 },
  itemTitle: { fontWeight: 'bold', color: '#6E5230', textAlign: 'right' },
  itemSub: { fontSize: 12, color: '#8C6D46', textAlign: 'right' },
  deleteBtn: { backgroundColor: 'rgba(217, 83, 79, 0.15)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  deleteBtnText: { color: '#D9534F', fontWeight: 'bold', fontSize: 12 },
});