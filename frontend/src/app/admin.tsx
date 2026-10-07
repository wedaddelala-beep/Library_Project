import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Platform, Alert, Modal } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api';

// أقسام كلية العلوم - جامعة الزنتان
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
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [pdfFile, setPdfFile] = useState('');
  const [isBookDeptOpen, setIsBookDeptOpen] = useState(false);

  // حقول إضافة النشاط
  const [actTitle, setActTitle] = useState('');
  const [actDesc, setActDesc] = useState('');

  // حقول إضافة مشروع التخرج (محدثة لضمان الاستقرار)
  const [projTitle, setProjTitle] = useState('');
  const [projDept, setProjDept] = useState('');
  const [projStudents, setProjStudents] = useState('');
  const [projSupervisor, setProjSupervisor] = useState('');
  const [projYear, setProjYear] = useState('');
  const [isProjDeptOpen, setIsProjDeptOpen] = useState(false);

  const [isEditBookModalVisible, setIsEditBookModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [isEditBookDeptOpen, setIsEditBookDeptOpen] = useState(false);

  const [isEditActModalVisible, setIsEditActModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  const [isEditProjModalVisible, setIsEditProjModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isEditProjDeptOpen, setIsEditProjDeptOpen] = useState(false);

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
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      router.replace('/login');
    } catch (error) {
      console.error('خطأ أثناء تسجيل الخروج:', error);
    }
  };

  const addNewBookDirectly = async () => {
    if (!title.trim() || !author.trim()) {
      Alert.alert('تنبيه هام', 'الرجاء كتابة عنوان الكتاب واسم المؤلف!');
      return;
    }
    if (!category) {
      Alert.alert('تنبيه هام', 'الرجاء اختيار القسم الأكاديمي!');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          category: category,
          cover_image: coverImage.trim() || '',
          pdf_file: pdfFile.trim() || ''
        })
      });

      if (response.ok) {
        Alert.alert('نجاح 🌟', 'تمت إضافة الكتاب بنجاح!');
        setTitle(''); setAuthor(''); setCategory(''); setCoverImage(''); setPdfFile('');
        fetchData();
      } else {
        Alert.alert('خطأ', 'فشل في إضافة الكتاب');
      }
    } catch (error) {
      console.log('خطأ:', error);
    }
  };

  const handleUpdateBook = async () => {
    if (!selectedBook?.title || !selectedBook?.author) return;
    try {
      const response = await fetch(`${API_BASE_URL}/books/${selectedBook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedBook.title.trim(),
          author: selectedBook.author.trim(),
          category: selectedBook.category || SCIENCE_DEPARTMENTS[0],
          cover_image: selectedBook.cover_image || '',
          pdf_file: selectedBook.pdf_file || ''
        }),
      });
      if (response.ok) {
        Alert.alert('نجاح', 'تم تحديث الكتاب بنجاح');
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

  const handleUpdateActivity = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/activities/${selectedActivity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: selectedActivity.title.trim(), description: selectedActivity.description.trim() }),
      });
      if (response.ok) {
        setIsEditActModalVisible(false);
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

  // دالة إضافة مشروع تخرج مع فحص دقيق واستجابة تفصيلية للأخطاء
  const handleAddProject = async () => {
    if (!projTitle.trim()) {
      Alert.alert('تنبيه', 'الرجاء إدخال عنوان مشروع التخرج!');
      return;
    }
    if (!projDept) {
      Alert.alert('تنبيه', 'الرجاء اختيار القسم الأكاديمي للمشروع!');
      return;
    }
    if (!projStudents.trim()) {
      Alert.alert('تنبيه', 'الرجاء إدخال أسماء الطلبة المنفذين للمشروع!');
      return;
    }
    if (!projSupervisor.trim()) {
      Alert.alert('تنبيه', 'الرجاء إدخال اسم الأستاذ المشرف!');
      return;
    }

    try {
      const payload = {
        title: projTitle.trim(),
        department: projDept,
        students: projStudents.trim(),
        supervisor: projSupervisor.trim(),
        year: projYear.trim() || '2026'
      };

      console.log('جاري إرسال بيانات المشروع:', payload);

      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json' 
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        Alert.alert('نجاح 🎓', 'تمت إضافة مشروع التخرج بنجاح وتحديث القائمة!');
        setProjTitle(''); 
        setProjDept(''); 
        setProjStudents(''); 
        setProjSupervisor(''); 
        setProjYear('');
        fetchData(); // تحديث القائمة فوراً
      } else {
        console.error('خطأ مرفوض من السيرفر:', responseData);
        Alert.alert('فشل الإضافة', responseData.message || 'تعذر حفظ المشروع في السيرفر، تأكد من تشغيل الخیر (Backend).');
      }
    } catch (error) {
      console.error('خطأ شبكة أو اتصال:', error);
      Alert.alert('خطأ اتصال', 'لا يمكن الاتصال بخادم السيرفر (Backend)، تأكد من أن السيرفر يعمل على منفذ 5000.');
    }
  };

  const handleUpdateProject = async () => {
    if (!selectedProject?.title || !selectedProject?.students) return;
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${selectedProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedProject.title.trim(),
          department: selectedProject.department || SCIENCE_DEPARTMENTS[0],
          students: selectedProject.students.trim(),
          supervisor: selectedProject.supervisor.trim(),
          year: selectedProject.year.trim() || '2026'
        }),
      });
      if (response.ok) {
        Alert.alert('نجاح', 'تم تحديث مشروع التخرج بنجاح');
        setIsEditProjModalVisible(false);
        fetchData();
      }
    } catch (error) { console.log(error); }
  };

  const handleDeleteProject = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, { method: 'DELETE' });
      if (response.ok) fetchData();
    } catch (error) { console.log(error); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
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

        <View style={styles.statsGrid}>
          <TouchableOpacity style={styles.statGlassCard} onPress={() => setActiveTab('books')}>
            <Text style={styles.statIcon}>📚</Text>
            <Text style={styles.statNumber}>{books.length}</Text>
            <Text style={styles.statLabel}>إدارة الكتب</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statGlassCard} onPress={() => setActiveTab('activities')}>
            <Text style={styles.statIcon}>🎨</Text>
            <Text style={styles.statNumber}>{activities.length}</Text>
            <Text style={styles.statLabel}>إدارة الأنشطة</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statGlassCard} onPress={() => setActiveTab('projects')}>
            <Text style={styles.statIcon}>🎓</Text>
            <Text style={styles.statNumber}>{projects.length}</Text>
            <Text style={styles.statLabel}>مشاريع التخرج</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'profile' && styles.activeTabBtn]} onPress={() => setActiveTab('profile')}>
            <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>الملف الشخصي</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'books' && styles.activeTabBtn]} onPress={() => setActiveTab('books')}>
            <Text style={[styles.tabText, activeTab === 'books' && styles.activeTabText]}>إدارة الكتب</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'activities' && styles.activeTabBtn]} onPress={() => setActiveTab('activities')}>
            <Text style={[styles.tabText, activeTab === 'activities' && styles.activeTabText]}>الأنشطة</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'projects' && styles.activeTabBtn]} onPress={() => setActiveTab('projects')}>
            <Text style={[styles.tabText, activeTab === 'projects' && styles.activeTabText]}>مشاريع التخرج</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'profile' && (
          <View style={styles.glassContentCard}>
            <Text style={styles.cardTitle}>بيانات الحساب الشخصي</Text>
            <View style={styles.profileDetailRow}><Text style={styles.profileLabel}>الاسم الكامل:</Text><Text style={styles.profileVal}>{adminProfile.name}</Text></View>
            <View style={styles.profileDetailRow}><Text style={styles.profileLabel}>البريد الإلكتروني:</Text><Text style={styles.profileVal}>{adminProfile.email}</Text></View>
            <View style={styles.profileDetailRow}><Text style={styles.profileLabel}>الجهة الأكاديمية:</Text><Text style={styles.profileVal}>{adminProfile.department}</Text></View>
          </View>
        )}

        {/* إدارة الكتب */}
        {activeTab === 'books' && (
          <View style={styles.glassContentCard}>
            <Text style={styles.cardTitle}>إضافة كتاب جديد وتحديد القسم الأكاديمي</Text>
            <TextInput style={styles.glassInput} placeholder="عنوان الكتاب" value={title} onChangeText={setTitle} />
            <TextInput style={styles.glassInput} placeholder="اسم المؤلف" value={author} onChangeText={setAuthor} />

            <Text style={styles.sectionLabelTitle}>القسم الأكاديمي:</Text>
            <TouchableOpacity style={styles.dropdownSelector} onPress={() => setIsBookDeptOpen(!isBookDeptOpen)}>
              <Text style={[styles.dropdownSelectorText, !category && { color: '#999' }]}>
                {category || 'اختر القسم'}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>

            {isBookDeptOpen && (
              <View style={styles.dropdownListContainer}>
                <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled={true}>
                  {SCIENCE_DEPARTMENTS.map((dept, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[styles.dropdownItem, category === dept && styles.dropdownItemSelected]} 
                      onPress={() => { setCategory(dept); setIsBookDeptOpen(false); }}
                    >
                      <Text style={[styles.dropdownItemText, category === dept && styles.dropdownItemTextSelected]}>{dept}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <TextInput style={[styles.glassInput, { marginTop: 10 }]} placeholder="رابط صورة الغلاف" value={coverImage} onChangeText={setCoverImage} />
            <TextInput style={styles.glassInput} placeholder="رابط ملف الـ PDF" value={pdfFile} onChangeText={setPdfFile} />

            <TouchableOpacity style={styles.actionAddBtn} onPress={addNewBookDirectly}>
              <Text style={styles.actionBtnText}>+ حفظ الكتاب وقاعدة البيانات</Text>
            </TouchableOpacity>

            <Text style={[styles.cardTitle, { marginTop: 25 }]}>قائمة الكتب الحالية ({books.length})</Text>
            {books.map((b) => (
              <View key={b.id} style={styles.listItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{b.title}</Text>
                  <Text style={styles.itemSub}>{b.author} | القسم: <Text style={{color: '#B89047', fontWeight: 'bold'}}>{b.category || 'عام'}</Text></Text>
                </View>
                <View style={styles.rowActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => { setSelectedBook(b); setIsEditBookModalVisible(true); }}><Text style={styles.editBtnText}>تعديل ✏️</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteBook(b.id)}><Text style={styles.deleteBtnText}>حذف 🗑️</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* إدارة الأنشطة */}
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
                  <TouchableOpacity style={styles.editBtn} onPress={() => { setSelectedActivity(a); setIsEditActModalVisible(true); }}><Text style={styles.editBtnText}>تعديل ✏️</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteActivity(a.id)}><Text style={styles.deleteBtnText}>حذف 🗑️</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* إدارة مشاريع التخرج */}
        {activeTab === 'projects' && (
          <View style={styles.glassContentCard}>
            <Text style={styles.cardTitle}>🎓 إضافة مشروع تخرج جديد</Text>
            
            <TextInput style={styles.glassInput} placeholder="عنوان مشروع التخرج" value={projTitle} onChangeText={setProjTitle} />

            <Text style={styles.sectionLabelTitle}>القسم الأكاديمي للمشروع:</Text>
            <TouchableOpacity style={styles.dropdownSelector} onPress={() => setIsProjDeptOpen(!isProjDeptOpen)}>
              <Text style={[styles.dropdownSelectorText, !projDept && { color: '#999' }]}>
                {projDept || 'اختر القسم'}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>

            {isProjDeptOpen && (
              <View style={styles.dropdownListContainer}>
                <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled={true}>
                  {SCIENCE_DEPARTMENTS.map((dept, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[styles.dropdownItem, projDept === dept && styles.dropdownItemSelected]} 
                      onPress={() => { setProjDept(dept); setIsProjDeptOpen(false); }}
                    >
                      <Text style={[styles.dropdownItemText, projDept === dept && styles.dropdownItemTextSelected]}>{dept}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <TextInput style={[styles.glassInput, { marginTop: 10 }]} placeholder="أسماء الطلبة" value={projStudents} onChangeText={setProjStudents} />
            <TextInput style={styles.glassInput} placeholder="الأستاذ المشرف" value={projSupervisor} onChangeText={setProjSupervisor} />
            <TextInput style={styles.glassInput} placeholder="سنة النشر (مثال: 2026)" value={projYear} onChangeText={setProjYear} />

            <TouchableOpacity style={styles.actionAddBtn} onPress={handleAddProject}>
              <Text style={styles.actionBtnText}>+ حفظ ونشر مشروع التخرج</Text>
            </TouchableOpacity>

            <Text style={[styles.cardTitle, { marginTop: 25 }]}>قائمة مشاريع التخرج المسجلة ({projects.length})</Text>
            {projects.length > 0 ? (
              projects.map((p) => (
                <View key={p.id} style={styles.listItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>🎓 {p.title}</Text>
                    <Text style={styles.itemSub}>القسم: <Text style={{color: '#B89047', fontWeight: 'bold'}}>{p.department}</Text> | السنة: {p.year}</Text>
                    <Text style={{ fontSize: 11, color: '#554433', marginTop: 2 }}>👥 الطلبة: {p.students}</Text>
                    <Text style={{ fontSize: 11, color: '#554433' }}>👨‍🏫 المشرف: {p.supervisor}</Text>
                  </View>
                  <View style={styles.rowActions}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => { setSelectedProject(p); setIsEditProjModalVisible(true); }}><Text style={styles.editBtnText}>تعديل ✏️</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteProject(p.id)}><Text style={styles.deleteBtnText}>حذف 🗑️</Text></TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={{ textAlign: 'center', color: '#888', marginTop: 10 }}>لا توجد مشاريع تخرج مضافة حالياً.</Text>
            )}
          </View>
        )}

      </ScrollView>

      {/* نافذة تعديل الكتاب */}
      <Modal visible={isEditBookModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.cardTitle}>تعديل بيانات الكتاب</Text>
            <TextInput style={styles.glassInput} placeholder="عنوان الكتاب" value={selectedBook?.title || ''} onChangeText={(text) => setSelectedBook({ ...selectedBook, title: text })} />
            <TextInput style={styles.glassInput} placeholder="اسم المؤلف" value={selectedBook?.author || ''} onChangeText={(text) => setSelectedBook({ ...selectedBook, author: text })} />
            
            <Text style={styles.sectionLabelTitle}>القسم الأكاديمي:</Text>
            <TouchableOpacity style={styles.dropdownSelector} onPress={() => setIsEditBookDeptOpen(!isEditBookDeptOpen)}>
              <Text style={styles.dropdownSelectorText}>{selectedBook?.category || 'اختر القسم'}</Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>

            {isEditBookDeptOpen && (
              <View style={styles.dropdownListContainer}>
                <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled={true}>
                  {SCIENCE_DEPARTMENTS.map((dept, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[styles.dropdownItem, selectedBook?.category === dept && styles.dropdownItemSelected]} 
                      onPress={() => { setSelectedBook({ ...selectedBook, category: dept }); setIsEditBookDeptOpen(false); }}
                    >
                      <Text style={[styles.dropdownItemText, selectedBook?.category === dept && styles.dropdownItemTextSelected]}>{dept}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <TextInput style={[styles.glassInput, { marginTop: 10 }]} placeholder="رابط صورة الغلاف" value={selectedBook?.cover_image || ''} onChangeText={(text) => setSelectedBook({ ...selectedBook, cover_image: text })} />
            <TextInput style={styles.glassInput} placeholder="رابط ملف الـ PDF" value={selectedBook?.pdf_file || ''} onChangeText={(text) => setSelectedBook({ ...selectedBook, pdf_file: text })} />
            
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity style={[styles.actionAddBtn, { flex: 1, backgroundColor: '#6E5230', marginTop: 0 }]} onPress={() => setIsEditBookModalVisible(false)}><Text style={styles.actionBtnText}>إلغاء</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.actionAddBtn, { flex: 1, marginTop: 0 }]} onPress={handleUpdateBook}><Text style={styles.actionBtnText}>حفظ</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* نافذة تعديل مشروع التخرج */}
      <Modal visible={isEditProjModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.cardTitle}>🎓 تعديل مشروع التخرج</Text>
            
            <TextInput style={styles.glassInput} placeholder="عنوان المشروع" value={selectedProject?.title || ''} onChangeText={(text) => setSelectedProject({ ...selectedProject, title: text })} />

            <Text style={styles.sectionLabelTitle}>القسم الأكاديمي:</Text>
            <TouchableOpacity style={styles.dropdownSelector} onPress={() => setIsEditProjDeptOpen(!isEditProjDeptOpen)}>
              <Text style={styles.dropdownSelectorText}>{selectedProject?.department || 'اختر القسم'}</Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>

            {isEditProjDeptOpen && (
              <View style={styles.dropdownListContainer}>
                <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled={true}>
                  {SCIENCE_DEPARTMENTS.map((dept, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[styles.dropdownItem, selectedProject?.department === dept && styles.dropdownItemSelected]} 
                      onPress={() => { setSelectedProject({ ...selectedProject, department: dept }); setIsEditProjDeptOpen(false); }}
                    >
                      <Text style={[styles.dropdownItemText, selectedProject?.department === dept && styles.dropdownItemTextSelected]}>{dept}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <TextInput style={[styles.glassInput, { marginTop: 10 }]} placeholder="أسماء الطلبة" value={selectedProject?.students || ''} onChangeText={(text) => setSelectedProject({ ...selectedProject, students: text })} />
            <TextInput style={styles.glassInput} placeholder="الأستاذ المشرف" value={selectedProject?.supervisor || ''} onChangeText={(text) => setSelectedProject({ ...selectedProject, supervisor: text })} />
            <TextInput style={styles.glassInput} placeholder="سنة النشر" value={selectedProject?.year || ''} onChangeText={(text) => setSelectedProject({ ...selectedProject, year: text })} />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity style={[styles.actionAddBtn, { flex: 1, backgroundColor: '#6E5230', marginTop: 0 }]} onPress={() => setIsEditProjModalVisible(false)}>
                <Text style={styles.actionBtnText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionAddBtn, { flex: 1, marginTop: 0 }]} onPress={handleUpdateProject}>
                <Text style={styles.actionBtnText}>حفظ التعديلات</Text>
              </TouchableOpacity>
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
    flex: 1, minWidth: 140, backgroundColor: 'rgba(255, 255, 255, 0.65)', borderRadius: 20,
    padding: 16, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)', alignItems: 'center'
  },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statNumber: { fontSize: 22, fontWeight: '900', color: '#6E5230' },
  statLabel: { fontSize: 12, color: '#8C6D46', fontWeight: '600', textAlign: 'center' },

  tabBar: { width: '100%', maxWidth: 1000, flexDirection: 'row-reverse', gap: 8, flexWrap: 'wrap' },
  tabBtn: { flex: 1, minWidth: 110, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 14, alignItems: 'center' },
  activeTabBtn: { backgroundColor: '#6E5230' },
  tabText: { fontWeight: 'bold', color: '#6E5230', fontSize: 12 },
  activeTabText: { color: '#FFF' },

  glassContentCard: {
    width: '100%', maxWidth: 1000, backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.9)'
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#6E5230', marginBottom: 15, textAlign: 'right' },
  profileDetailRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  profileLabel: { fontWeight: 'bold', color: '#8C6D46' },
  profileVal: { color: '#554433', fontWeight: '600' },

  glassInput: { backgroundColor: '#FFFFFF', borderWidth: 1.2, borderColor: 'rgba(212, 175, 55, 0.6)', borderRadius: 12, padding: 12, textAlign: 'right', marginBottom: 8, color: '#333' },
  
  sectionLabelTitle: { fontSize: 13, fontWeight: 'bold', color: '#725232', textAlign: 'right', marginBottom: 6, marginTop: 4 },
  
  dropdownSelector: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.6)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  dropdownSelectorText: { fontSize: 14, color: '#333', textAlign: 'right', fontWeight: '500' },
  dropdownIcon: { fontSize: 12, color: '#8C6D46' },
  dropdownListContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.6)',
    borderRadius: 12,
    marginTop: 2,
    marginBottom: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F0E8',
    alignItems: 'flex-end'
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(184, 144, 71, 0.15)',
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#554433',
    textAlign: 'right'
  },
  dropdownItemTextSelected: {
    color: '#6E5230',
    fontWeight: 'bold'
  },

  actionAddBtn: { backgroundColor: '#B89047', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  actionBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },

  listItem: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.5)', padding: 12, borderRadius: 12, marginBottom: 8 },
  itemTitle: { fontWeight: 'bold', color: '#6E5230', textAlign: 'right' },
  itemSub: { fontSize: 12, color: '#8C6D46', textAlign: 'right' },
  rowActions: { flexDirection: 'row-reverse', gap: 6 },
  editBtn: { backgroundColor: 'rgba(184, 144, 71, 0.2)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  editBtnText: { color: '#8C6D46', fontWeight: 'bold', fontSize: 11 },
  deleteBtn: { backgroundColor: 'rgba(217, 83, 79, 0.15)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  deleteBtnText: { color: '#D9534F', fontWeight: 'bold', fontSize: 11 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 500, backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#D4AF37' }
});