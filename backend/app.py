import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # السماح بالاتصال من واجهة React Native / Expo

DB_NAME = "library.db"

# ---------------------------------------------------------
# إنشاء وتحديث قاعدة البيانات بالجداول الافتراضية
# ---------------------------------------------------------
def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # جدول المستخدمين
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'student'
        )
    ''')

    # جدول الكتب
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            category TEXT,
            status TEXT DEFAULT 'available',
            cover_image TEXT,
            pdf_file TEXT
        )
    ''')
    
    # التحقق من وجود الأعمدة بالكامل في حال كانت القاعدة قديمة
    cursor.execute("PRAGMA table_info(books)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'status' not in columns:
        cursor.execute("ALTER TABLE books ADD COLUMN status TEXT DEFAULT 'available'")
    if 'cover_image' not in columns:
        cursor.execute("ALTER TABLE books ADD COLUMN cover_image TEXT")
    if 'pdf_file' not in columns:
        cursor.execute("ALTER TABLE books ADD COLUMN pdf_file TEXT")

    # جدول الأنشطة والفعاليات
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL
        )
    ''')

    # جدول مشاريع التخرج
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            department TEXT NOT NULL,
            students TEXT NOT NULL,
            supervisor TEXT NOT NULL,
            year TEXT DEFAULT '2026'
        )
    ''')

    # إضافة حساب الأدمن الافتراضي (تم التوحيد والضبط)
    cursor.execute("SELECT * FROM users WHERE email = 'wedad@zentan.edu.ly'")
    if not cursor.fetchone():
        cursor.execute('''
            INSERT INTO users (name, email, password, role)
            VALUES ('وداد عبدالمجيد دلالة', 'wedad@zentan.edu.ly', 'admin123', 'admin')
        ''')

    conn.commit()
    conn.close()

init_db()

# ---------------------------------------------------------
# المسارات (API Endpoints)
# ---------------------------------------------------------

@app.route('/api/register', methods=['POST'])
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "لم يتم إرسال بيانات"}), 400

    name = data.get('name', 'مستخدم جديد')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'student')

    if not email or not password:
        return jsonify({"error": "يرجى إدخال البريد الإلكتروني وكلمة المرور"}), 400

    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({"error": "البريد الإلكتروني مسجل بالفعل"}), 400

        cursor.execute('''
            INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, ?)
        ''', (name, email, password, role))
        
        conn.commit()
        conn.close()
        return jsonify({"message": "تم إنشاء الحساب بنجاح"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/login', methods=['POST'])
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "لم يتم إرسال بيانات"}), 400

    email = data.get('email')
    password = data.get('password')

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, role FROM users WHERE email = ? AND password = ?", (email, password))
    user = cursor.fetchone()
    conn.close()

    if user:
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user[0],
                "name": user[1],
                "email": user[2],
                "role": user[3]
            }
        }), 200
    else:
        return jsonify({"error": "البريد الإلكتروني أو كلمة المرور غير صحيحة"}), 401


# --- إدارة الكتب ---
@app.route('/api/books', methods=['GET', 'POST'])
def manage_books():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    if request.method == 'POST':
        data = request.get_json()
        title = data.get('title')
        author = data.get('author')
        category = data.get('category', 'عام')
        cover_image = data.get('cover_image', '')
        pdf_file = data.get('pdf_file', '')

        if not title or not author:
            conn.close()
            return jsonify({"error": "عنوان الكتاب والمؤلف مطلوبان"}), 400

        cursor.execute('''
            INSERT INTO books (title, author, category, status, cover_image, pdf_file)
            VALUES (?, ?, ?, 'available', ?, ?)
        ''', (title, author, category, cover_image, pdf_file))
        conn.commit()
        
        new_id = cursor.lastrowid
        conn.close()
        return jsonify({
            "id": new_id, 
            "title": title, 
            "author": author, 
            "category": category, 
            "status": "available",
            "cover_image": cover_image,
            "pdf_file": pdf_file
        }), 201

    cursor.execute("SELECT id, title, author, category, status, cover_image, pdf_file FROM books")
    books = cursor.fetchall()
    conn.close()

    books_list = []
    for book in books:
        books_list.append({
            "id": book[0],
            "title": book[1],
            "author": book[2],
            "category": book[3],
            "status": book[4] if len(book) > 4 and book[4] else 'available',
            "cover_image": book[5] or '',
            "pdf_file": book[6] or ''
        })

    return jsonify(books_list), 200


@app.route('/api/books/<int:id>', methods=['PUT', 'DELETE'])
def modify_book(id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    if request.method == 'PUT':
        data = request.get_json()
        title = data.get('title')
        author = data.get('author')
        category = data.get('category')
        cover_image = data.get('cover_image', '')
        pdf_file = data.get('pdf_file', '')

        cursor.execute('''
            UPDATE books SET title = ?, author = ?, category = ?, cover_image = ?, pdf_file = ? WHERE id = ?
        ''', (title, author, category, cover_image, pdf_file, id))
        conn.commit()
        conn.close()
        return jsonify({"message": "تم تحديث الكتاب بنجاح"}), 200

    elif request.method == 'DELETE':
        cursor.execute("DELETE FROM books WHERE id = ?", (id,))
        conn.commit()
        conn.close()
        return jsonify({"message": "تم حذف الكتاب بنجاح"}), 200


# --- إدارة الأنشطة ---
@app.route('/api/activities', methods=['GET', 'POST'])
def manage_activities():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    if request.method == 'POST':
        data = request.get_json()
        title = data.get('title')
        description = data.get('description')

        if not title or not description:
            conn.close()
            return jsonify({"error": "عنوان النشاط والتفاصيل مطلوبان"}), 400

        cursor.execute('''
            INSERT INTO activities (title, description)
            VALUES (?, ?)
        ''', (title, description))
        conn.commit()
        
        new_id = cursor.lastrowid
        conn.close()
        return jsonify({"id": new_id, "title": title, "description": description}), 201

    cursor.execute("SELECT id, title, description FROM activities")
    activities = cursor.fetchall()
    conn.close()

    act_list = []
    for act in activities:
        act_list.append({
            "id": act[0],
            "title": act[1],
            "description": act[2]
        })

    return jsonify(act_list), 200


@app.route('/api/activities/<int:id>', methods=['PUT', 'DELETE'])
def modify_activity(id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    if request.method == 'PUT':
        data = request.get_json()
        title = data.get('title')
        description = data.get('description')

        cursor.execute('''
            UPDATE activities SET title = ?, description = ? WHERE id = ?
        ''', (title, description, id))
        conn.commit()
        conn.close()
        return jsonify({"message": "تم تحديث النشاط بنجاح"}), 200

    elif request.method == 'DELETE':
        cursor.execute("DELETE FROM activities WHERE id = ?", (id,))
        conn.commit()
        conn.close()
        return jsonify({"message": "تم حذف النشاط بنجاح"}), 200


# --- إدارة مشاريع التخرج ---
@app.route('/api/projects', methods=['GET', 'POST'])
def manage_projects():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    if request.method == 'POST':
        data = request.get_json()
        title = data.get('title')
        department = data.get('department')
        students = data.get('students')
        supervisor = data.get('supervisor')
        year = data.get('year', '2026')

        if not title or not department or not students or not supervisor:
            conn.close()
            return jsonify({"error": "جميع حقول المشروع أساسية ومطلوبة"}), 400

        cursor.execute('''
            INSERT INTO projects (title, department, students, supervisor, year)
            VALUES (?, ?, ?, ?, ?)
        ''', (title, department, students, supervisor, year))
        conn.commit()
        
        new_id = cursor.lastrowid
        conn.close()
        return jsonify({
            "id": new_id,
            "title": title,
            "department": department,
            "students": students,
            "supervisor": supervisor,
            "year": year
        }), 201

    cursor.execute("SELECT id, title, department, students, supervisor, year FROM projects")
    projects = cursor.fetchall()
    conn.close()

    projects_list = []
    for proj in projects:
        projects_list.append({
            "id": proj[0],
            "title": proj[1],
            "department": proj[2],
            "students": proj[3],
            "supervisor": proj[4],
            "year": proj[5]
        })

    return jsonify(projects_list), 200


@app.route('/api/projects/<int:id>', methods=['PUT', 'DELETE'])
def modify_project(id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    if request.method == 'PUT':
        data = request.get_json()
        title = data.get('title')
        department = data.get('department')
        students = data.get('students')
        supervisor = data.get('supervisor')
        year = data.get('year', '2026')

        cursor.execute('''
            UPDATE projects SET title = ?, department = ?, students = ?, supervisor = ?, year = ? WHERE id = ?
        ''', (title, department, students, supervisor, year, id))
        conn.commit()
        conn.close()
        return jsonify({"message": "تم تحديث مشروع التخرج بنجاح"}), 200

    elif request.method == 'DELETE':
        cursor.execute("DELETE FROM projects WHERE id = ?", (id,))
        conn.commit()
        conn.close()
        return jsonify({"message": "تم حذف مشروع التخرج بنجاح"}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)