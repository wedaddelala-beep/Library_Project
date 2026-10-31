import mysql.connector
from mysql.connector import Error
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)  # السماح بالاتصال من واجهة React Native / Expo / React

DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'root',         
    'password': '',         
    'database': 'AcademicLibrary',
    'charset': 'utf8mb4'
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"خطأ في الاتصال بقاعدة البيانات MySQL: {e}")
        return None

def init_db():
    conn = get_db_connection()
    if not conn:
        print("تعذر الاتصال بقاعدة البيانات. تأكد من تشغيل خادم MySQL.")
        return

    cursor = conn.cursor(dictionary=True)
    try:
        roles = [('Admin', 'مدير النظام'), ('Librarian', 'موظف المكتبة'), ('Student', 'طالب')]
        for role_name, desc in roles:
            cursor.execute("SELECT RoleID FROM Roles WHERE RoleName = %s", (role_name,))
            if not cursor.fetchone():
                cursor.execute("INSERT INTO Roles (RoleName, Description) VALUES (%s, %s)", (role_name, desc))

        admin_email = 'wedad@zentan.edu.ly'
        cursor.execute("SELECT UserID FROM Users WHERE Email = %s", (admin_email,))
        if not cursor.fetchone():
            cursor.execute("SELECT RoleID FROM Roles WHERE RoleName = 'Admin'")
            admin_role = cursor.fetchone()
            admin_role_id = admin_role['RoleID'] if admin_role else 1

            hashed_password = generate_password_hash('admin123')
            cursor.execute('''
                INSERT INTO Users (Username, PasswordHash, Email, RoleID)
                VALUES (%s, %s, %s, %s)
            ''', ('وداد عبدالمجيد دلالة', hashed_password, admin_email, admin_role_id))

        conn.commit()
    except Error as e:
        print(f"حدث خطأ أثناء تهيئة قاعدة البيانات: {e}")
    finally:
        cursor.close()
        conn.close()

init_db()

# --- المصادقة وحسابات الطلاب ---
@app.route('/api/register', methods=['POST'])
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "لم يتم إرسال بيانات"}), 400

    username = data.get('name') or data.get('username', 'مستخدم جديد')
    email = data.get('email')
    password = data.get('password')
    role_name = data.get('role', 'Student')

    if not email or not password:
        return jsonify({"error": "يرجى إدخال البريد الإلكتروني وكلمة المرور"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "خطأ في الاتصال بقاعدة البيانات"}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT UserID FROM Users WHERE Email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"error": "البريد الإلكتروني مسجل بالفعل"}), 400

        cursor.execute("SELECT RoleID FROM Roles WHERE RoleName = %s", (role_name,))
        role_res = cursor.fetchone()
        role_id = role_res['RoleID'] if role_res else 3

        hashed_password = generate_password_hash(password)

        cursor.execute('''
            INSERT INTO Users (Username, PasswordHash, Email, RoleID)
            VALUES (%s, %s, %s, %s)
        ''', (username, hashed_password, email, role_id))
        
        conn.commit()
        return jsonify({"message": "تم إنشاء الحساب بنجاح"}), 201

    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/login', methods=['POST'])
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "لم يتم إرسال بيانات"}), 400

    email = data.get('email')
    password = data.get('password')

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "خطأ في الاتصال بقاعدة البيانات"}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute('''
            SELECT u.UserID, u.Username, u.Email, u.PasswordHash, u.IsActive, r.RoleName 
            FROM Users u
            JOIN Roles r ON u.RoleID = r.RoleID
            WHERE u.Email = %s
        ''', (email,))
        user = cursor.fetchone()

        if user and check_password_hash(user['PasswordHash'], password):
            if not user['IsActive']:
                return jsonify({"error": "هذا الحساب معطل حالياً"}), 403

            return jsonify({
                "message": "Login successful",
                "user": {
                    "id": user['UserID'],
                    "name": user['Username'],
                    "email": user['Email'],
                    "role": user['RoleName']
                }
            }), 200
        else:
            return jsonify({"error": "البريد الإلكتروني أو كلمة المرور غير صحيحة"}), 401
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# --- إدارة الكتب والباركود ---
@app.route('/api/books', methods=['GET', 'POST'])
def manage_books():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "خطأ في الاتصال بقاعدة البيانات"}), 500

    cursor = conn.cursor(dictionary=True)

    if request.method == 'POST':
        data = request.get_json()
        title = data.get('title')
        isbn = data.get('isbn', None) # استقبال الباركود المدخل عبر الكاميرا
        pub_year = data.get('publication_year') or data.get('year')
        total_copies = data.get('total_copies', 1)

        if not title:
            cursor.close()
            conn.close()
            return jsonify({"error": "عنوان الكتاب مطلوب"}), 400

        try:
            cursor.execute('''
                INSERT INTO Books (ISBN, Title, PublicationYear, TotalCopies, AvailableCopies)
                VALUES (%s, %s, %s, %s, %s)
            ''', (isbn, title, pub_year, total_copies, total_copies))
            conn.commit()
            
            new_id = cursor.lastrowid
            return jsonify({
                "id": new_id, 
                "title": title, 
                "isbn": isbn,
                "total_copies": total_copies,
                "available_copies": total_copies
            }), 201
        except Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            cursor.close()
            conn.close()

    try:
        cursor.execute('''
            SELECT b.BookID AS id, b.ISBN, b.Title AS title, b.PublicationYear,
                   b.TotalCopies, b.AvailableCopies, c.CategoryName AS category
            FROM Books b
            LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
        ''')
        books = cursor.fetchall()
        return jsonify(books), 200
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/books/<int:id>', methods=['PUT', 'DELETE'])
def modify_book(id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "خطأ في الاتصال بقاعدة البيانات"}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        if request.method == 'PUT':
            data = request.get_json()
            title = data.get('title')
            isbn = data.get('isbn')
            pub_year = data.get('publication_year')
            total_copies = data.get('total_copies')

            cursor.execute('''
                UPDATE Books 
                SET Title = %s, ISBN = %s, PublicationYear = %s, TotalCopies = %s 
                WHERE BookID = %s
            ''', (title, isbn, pub_year, total_copies, id))
            conn.commit()
            return jsonify({"message": "تم تحديث الكتاب بنجاح"}), 200

        elif request.method == 'DELETE':
            cursor.execute("DELETE FROM Books WHERE BookID = %s", (id,))
            conn.commit()
            return jsonify({"message": "تم حذف الكتاب بنجاح"}), 200
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)