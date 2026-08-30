-- 1. جدول الكتب
CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL
);

-- 2. جدول الأنشطة والفعاليات
CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL
);

-- 3. جدول المستخدمين (للطلاب والأدمن)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'student', -- 'admin' أو 'student'
    department TEXT
);

-- 4. جدول إعارات الكتب
CREATE TABLE IF NOT EXISTS borrowings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    book_id INTEGER,
    borrow_date TEXT,
    return_date TEXT,
    status TEXT DEFAULT 'active', -- 'active' أو 'returned'
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
);

-- ---------------------------------------------------------
-- إدخال البيانات البيانات الأساسية الأولية (Initial Seed Data)
-- ---------------------------------------------------------

-- إضافة الأنشطة الافتراضية
INSERT INTO activities (title, description) 
SELECT 'المعارض العلمية والثقافية', 'تنظيم المعارض السنوية وورش العمل المتخصصة.'
WHERE NOT EXISTS (SELECT 1 FROM activities WHERE id = 1);

INSERT INTO activities (title, description) 
SELECT 'الملتقيات والمبادرات الطلابية', 'دعم الأنشطة والمشاريع الأكاديمية المتميزة.'
WHERE NOT EXISTS (SELECT 1 FROM activities WHERE id = 2);

-- إضافة حساب الأدمن الافتراضي
INSERT INTO users (name, email, password, role, department)
SELECT 'وداد عبدالمجيد دلالة', 'wedad@zentan.edu.ly', 'admin123', 'admin', 'قسم الحاسب الآلي'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'wedad@zentan.edu.ly');