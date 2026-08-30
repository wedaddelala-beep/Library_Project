import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # السماح بالاتصال من واجهة React Native / Expo

DB_NAME = "library.db"

# ---------------------------------------------------------
# إنشاء وتحديث قاعدة البيانات بالجدول الافتراضية
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
            status TEXT DEFAULT 'available'
        )
    ''')

    # إضافة حساب الأدمن الافتراضي (wedad@gmail.com) إن لم يكن موجوداً
    cursor.execute("SELECT * FROM users WHERE email = 'wedad@gmail.com'")
    if not cursor.fetchone():
        cursor.execute('''
            INSERT INTO users (name, email, password, role)
            VALUES ('وداد عبدالمجيد دلالة', 'wedad@gmail.com', '123456', 'admin')
        ''')

    conn.commit()
    conn.close()

init_db()

# ---------------------------------------------------------
# المسارات (API Endpoints)
# ---------------------------------------------------------

# API تسجيل حساب جديد من المتصفح تلقائياً
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
        
        # التحقق من عدم وجود الإيميل مسبقاً
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({"error": "البريد الإلكتروني مسجل بالفعل"}), 400

        # إنشاء الحساب الجديد
        cursor.execute('''
            INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, ?)
        ''', (name, email, password, role))
        
        conn.commit()
        conn.close()
        return jsonify({"message": "تم إنشاء الحساب بنجاح"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# API تسجيل الدخول
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


# API جلب قائمة الكتب
@app.route('/api/books', methods=['GET'])
def get_books():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM books")
    books = cursor.fetchall()
    conn.close()

    books_list = []
    for book in books:
        books_list.append({
            "id": book[0],
            "title": book[1],
            "author": book[2],
            "category": book[3],
            "status": book[4]
        })

    return jsonify(books_list), 200


# ---------------------------------------------------------
# تشغيل خادم Flask
# ---------------------------------------------------------
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)