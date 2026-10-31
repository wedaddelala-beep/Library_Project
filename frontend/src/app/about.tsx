import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, SafeAreaView, Platform, Modal, useWindowDimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';

// معرض الصور بالمسارات الصحيحة
const LIBRARY_IMAGES = [
  {
    id: '1',
    title: 'أرفف المراجع والكتب العلمية المركزية',
    category: 'المكتبة المركزية',
    source: require('../../assets/images/tabIcons/6.jpg'),
  },
  {
    id: '2',
    title: 'قاعات المطالعة المجهزة للطلاب',
    category: 'المكتبة المركزية',
    source: require('../../assets/images/tabIcons/5.jpg'),
  },
  {
    id: '3',
    title: 'أقسام الكتب والمراجع التخصصية',
    category: 'المكتبة المركزية',
    source: require('../../assets/images/tabIcons/7.jpg'),
  },
  {
    id: '4',
    title: 'المعرض العلمي السنوي لابتكارات الكلية',
    category: 'فعاليات المعرض العلمي',
    source: require('../../assets/images/tabIcons/10.jpg'),
  },
  {
    id: '5',
    title: 'جناح قسم علم الحاسوب والتقنية',
    category: 'مشاريع الأقسام العلمية',
    source: require('../../assets/images/tabIcons/9.jpg'),
  },
  {
    id: '6',
    title: 'استقبال المعرض العلمي العام للكلية',
    category: 'فعاليات المعرض العلمي',
    source: require('../../assets/images/tabIcons/15.jpg'),
  },
];

const DEPARTMENTS = [
  'التقنية الحيوية', 'علم النبات', 'علم الحيوان', 'الأحياء الدقيقة',
  'الكيمياء', 'الفيزياء', 'الجيولوجيا', 'علم البيئة',
  'الرياضيات', 'الإحصاء', 'علم الحاسوب'
];

export default function AboutLibraryScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [selectedImage, setSelectedImage] = useState<any>(null);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.mainCard}>

          {/* شريط الترويسة الشفاف العلوي */}
          <View style={styles.headerRow}>
            <View style={styles.headerRightGroup}>
              <Image source={require('../../assets/images/مكتبة .png')} style={styles.logoImage} />
              <View>
                <Text style={styles.headerTitleText}>مكتبة كلية العلوم - جامعة الزنتان</Text>
                <Text style={styles.headerSubTitleText}>FACULTY OF SCIENCE LIBRARY - UNIVERSITY OF ZINTAN</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backBtnText}>العودة للرئيسية ↩</Text>
            </TouchableOpacity>
          </View>

          {/* 1. كارت النبذة التاريخية والتأسيس */}
          <View style={styles.glassContentCard}>
            <Text style={styles.sectionTitle}>📖 نبذة عن الكلية والمكتبة الأكاديمية</Text>
            <Text style={styles.bodyText}>
              تعتبر <Text style={styles.boldHighlight}>كلية العلوم النواة الأولى والأساسية</Text> لتأسيس جامعة الزنتان (جامعة الجبل الغربي سابقاً)، حيث تأسست الكلية عام <Text style={styles.goldBadgeText}>1991م</Text> بموجب القرار رقم 745[cite: 1, 2, 3].
            </Text>
            <Text style={styles.bodyText}>
              ومنذ ذلك الحين، واكبت مكتبة الكلية وقاعاتها مسيرة البحث العلمي لتوفير المراجع المتخصصة للأقسام العلمية المختلفة، وصولاً إلى إطلاق مشروع التجهيز للمكتبة الرقمية وتطبيق الأنظمة الإلكترونية لتسهيل الوصول للمصادر العلمية ومشاريع التخرج[cite: 1, 2].
            </Text>
          </View>

          {/* 2. كارت الأقسام العلمية الـ 11 التي تخدمها المكتبة */}
          <View style={styles.glassContentCard}>
            <Text style={styles.sectionTitle}>🔬 الأقسام العلمية التخصصية (11 قسم)</Text>
            <View style={styles.departmentsGrid}>
              {DEPARTMENTS.map((dept, index) => (
                <View key={index} style={styles.deptChip}>
                  <Text style={styles.deptChipText}>• {dept}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 3. كارت الفعاليات والأنشطة المقامة بالمكتبة والقاعات */}
          <View style={styles.glassContentCard}>
            <Text style={styles.sectionTitle}>🏛️ الفعاليات والأنشطة المقامة بالمكتبة والقاعات</Text>

            <View style={styles.eventItem}>
              <Text style={styles.eventTitle}>🎯 المعرض العلمي السنوي لابتكارات الطلبة</Text>
              <Text style={styles.eventDesc}>
                يُقام المعرض العلمي السنوي بشكل دوري داخل قاعة المكتبة والساحات الملحقة على مستوى جميع الأقسام العلمية في الكلية، بحضور رئيس الجامعة وعميد الكلية وأعضاء المجلس البلدي بالزنتان، حيث يعرض فيه الطلاب ابتكاراتهم ومشاريعهم العلمية والريادية[cite: 1, 2].
              </Text>
            </View>

            <View style={styles.eventItem}>
              <Text style={styles.eventTitle}>💡 الورش التدريبية والمحاضرات التوعوية</Text>
              <Text style={styles.eventDesc}>
                تتضمن محاضرات التحليل الإحصائي (SPSS)، ورش السلامة والأمن الكيميائي داخل المختبرات والمكتبات العلمية، بالإضافة للورش البيئية الميدانية بالتعاون مع قسم علم البيئة[cite: 1, 2].
              </Text>
            </View>
          </View>

          {/* 4. معرض الصور الميداني للمكتبة والفعاليات */}
          <View style={styles.glassContentCard}>
            <Text style={styles.sectionTitle}>🖼️ المعرض العلمي والتوثيق الميداني للفعاليات</Text>
            <View style={styles.galleryGrid}>
              {LIBRARY_IMAGES.map((img) => (
                <TouchableOpacity key={img.id} style={styles.galleryCard} onPress={() => setSelectedImage(img)}>
                  <Image source={img.source} style={styles.galleryImg} resizeMode="contain" />
                  <View style={styles.galleryInfoContainer}>
                    <Text style={styles.galleryImgCategory}>{img.category}</Text>
                    <Text style={styles.galleryImgTitle}>{img.title}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </View>
      </ScrollView>

      {/* نافذة تكبير الصورة المنبثقة (LightBox Modal) */}
      <Modal visible={selectedImage !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedImage && (
              <>
                <Image source={selectedImage.source} style={styles.modalFullImg} resizeMode="contain" />
                <Text style={styles.modalImgTitle}>{selectedImage.title}</Text>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSelectedImage(null)}>
                  <Text style={styles.modalCloseText}>إغلاق الصورة ✕</Text>
                </TouchableOpacity>
              </>
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
  container: { flex: 1, backgroundColor: '#F4F0E8' },
  scrollContainer: { paddingVertical: 25, paddingHorizontal: 15, alignItems: 'center' },
  mainCard: { width: '100%', maxWidth: 1000, gap: 18 },
  
  headerRow: { 
    width: '100%', 
    backgroundColor: 'rgba(255, 255, 255, 0.85)', 
    borderRadius: 20, 
    padding: 16, 
    borderWidth: 1.5, 
    borderColor: 'rgba(255, 255, 255, 0.9)', 
    flexDirection: 'row-reverse', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  headerRightGroup: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  logoImage: { width: 50, height: 50, borderRadius: 25, borderWidth: 1.5, borderColor: '#B89047' },
  headerTitleText: { fontSize: 16, fontWeight: '900', color: '#6E5230', fontFamily: fontFamilyStyle, textAlign: 'right' },
  headerSubTitleText: { fontSize: 9, color: '#8C6D46', fontWeight: 'bold', textAlign: 'right' },
  backBtn: { backgroundColor: 'rgba(184, 144, 71, 0.15)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 },
  backBtnText: { color: '#6E5230', fontWeight: 'bold', fontSize: 12 },

  glassContentCard: { 
    width: '100%', 
    backgroundColor: 'rgba(255, 255, 255, 0.75)', 
    borderRadius: 22, 
    padding: 22, 
    borderWidth: 1.5, 
    borderColor: 'rgba(255, 255, 255, 0.9)' 
  },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#6E5230', marginBottom: 14, textAlign: 'right' },
  bodyText: { fontSize: 13, color: '#554433', lineHeight: 22, textAlign: 'right', marginBottom: 10, fontFamily: fontFamilyStyle },
  boldHighlight: { fontWeight: 'bold', color: '#6E5230' },
  goldBadgeText: { fontWeight: 'bold', color: '#B89047', backgroundColor: 'rgba(184, 144, 71, 0.15)', paddingHorizontal: 6, borderRadius: 4 },

  departmentsGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  deptChip: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D4AF37', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 12 },
  deptChipText: { color: '#725232', fontWeight: 'bold', fontSize: 12 },

  eventItem: { backgroundColor: 'rgba(250, 247, 242, 0.8)', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)' },
  eventTitle: { fontWeight: 'bold', color: '#6E5230', textAlign: 'right', marginBottom: 4, fontSize: 14 },
  eventDesc: { color: '#554433', fontSize: 12, textAlign: 'right', lineHeight: 20 },

  // تعديل أبعاد وأطوال الصور لتعرض بشكل متناسق ومضبوط
  galleryGrid: { gap: 16, marginTop: 10 },
  galleryCard: { width: '100%', backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1.2, borderColor: 'rgba(212, 175, 55, 0.4)', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  galleryImg: { width: '100%', height: 380, backgroundColor: '#FAF7F2' }, // ضبط الارتفاع ليتوافق مع أبعاد الصور الأصلية
  galleryInfoContainer: { padding: 14, backgroundColor: '#FFF' },
  galleryImgCategory: { fontSize: 11, color: '#B89047', fontWeight: 'bold', textAlign: 'right' },
  galleryImgTitle: { fontSize: 14, fontWeight: 'bold', color: '#6E5230', textAlign: 'right', marginTop: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 900, backgroundColor: '#FFF', borderRadius: 20, padding: 20, alignItems: 'center' },
  modalFullImg: { width: '100%', height: 520 },
  modalImgTitle: { fontSize: 16, fontWeight: 'bold', color: '#6E5230', marginVertical: 12, textAlign: 'center' },
  modalCloseBtn: { backgroundColor: '#D9534F', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 10 },
  modalCloseText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 }
});