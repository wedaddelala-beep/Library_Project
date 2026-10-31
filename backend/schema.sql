-- ============================================================================
-- Academic Library Management System (Enterprise Grade with Barcode Support)
-- Database Engine: MySQL 8.0+
-- Security & Integrity Standard: High-Security Prepared Schema
-- Character Set: utf8mb4 (Full Unicode Support)
-- ============================================================================

DROP DATABASE IF EXISTS AcademicLibrary;
CREATE DATABASE AcademicLibrary
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE AcademicLibrary;

-- ============================================================================
-- 1. CORE ROLES & PERMISSIONS (RBAC)
-- ============================================================================
CREATE TABLE Roles (
    RoleID INT AUTO_INCREMENT PRIMARY KEY,
    RoleName VARCHAR(50) NOT NULL UNIQUE,
    Description VARCHAR(255)
) ENGINE=InnoDB;

-- ============================================================================
-- 2. USERS & SECURITY AUTHENTICATION
-- ============================================================================
CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE,
    RoleID INT NOT NULL,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    FailedLoginAttempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
    AccountLockedUntil DATETIME NULL,
    CONSTRAINT fk_users_roles
        FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================================
-- 3. USER PROFILE TABLES (1:1 Relationships)
-- ============================================================================
CREATE TABLE Students (
    StudentID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL UNIQUE,
    StudentCardNo VARCHAR(50) NOT NULL UNIQUE,
    Faculty VARCHAR(150),
    AcademicYear VARCHAR(30),
    CONSTRAINT fk_students_users
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Employees (
    EmployeeID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL UNIQUE,
    Department VARCHAR(100),
    HireDate DATE,
    CONSTRAINT fk_employees_users
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 4. CATALOG MANAGEMENT (Authors, Categories, Books with Barcode/ISBN support)
-- ============================================================================
CREATE TABLE Authors (
    AuthorID INT AUTO_INCREMENT PRIMARY KEY,
    AuthorName VARCHAR(200) NOT NULL,
    Biography TEXT
) ENGINE=InnoDB;

CREATE TABLE Categories (
    CategoryID INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(100) NOT NULL UNIQUE,
    ShelfLocation VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE Books (
    BookID INT AUTO_INCREMENT PRIMARY KEY,
    ISBN VARCHAR(50) UNIQUE, -- يدعم الباركود والـ ISBN المعياري
    Title VARCHAR(255) NOT NULL,
    PublicationYear SMALLINT,
    CategoryID INT,
    TotalCopies INT NOT NULL DEFAULT 0,
    AvailableCopies INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_books_categories
        FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_books_copies
        CHECK (
            TotalCopies >= 0
            AND AvailableCopies >= 0
            AND AvailableCopies <= TotalCopies
        ),
    CONSTRAINT chk_books_year
        CHECK (PublicationYear IS NULL OR PublicationYear BETWEEN 1000 AND 9999)
) ENGINE=InnoDB;

CREATE TABLE Book_Authors (
    BookID INT NOT NULL,
    AuthorID INT NOT NULL,
    PRIMARY KEY (BookID, AuthorID),
    CONSTRAINT fk_bookauthors_books
        FOREIGN KEY (BookID) REFERENCES Books(BookID)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_bookauthors_authors
        FOREIGN KEY (AuthorID) REFERENCES Authors(AuthorID)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 5. TRANSACTIONAL TABLES (Borrowings, Reservations, Fines)
-- ============================================================================
CREATE TABLE Borrowings (
    BorrowID INT AUTO_INCREMENT PRIMARY KEY,
    BookID INT NOT NULL,
    UserID INT NOT NULL,
    EmployeeID INT NOT NULL,
    BorrowDate DATE NOT NULL,
    DueDate DATE NOT NULL,
    ReturnDate DATE,
    Status VARCHAR(20) NOT NULL DEFAULT 'Borrowed',
    CONSTRAINT fk_borrowings_books
        FOREIGN KEY (BookID) REFERENCES Books(BookID)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_borrowings_borrower
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_borrowings_issuer
        FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeID)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_borrowing_dates
        CHECK (
            DueDate >= BorrowDate
            AND (ReturnDate IS NULL OR ReturnDate >= BorrowDate)
        ),
    CONSTRAINT chk_borrowing_status
        CHECK (Status IN ('Borrowed', 'Returned', 'Overdue'))
) ENGINE=InnoDB;

CREATE TABLE Reservations (
    ReservationID INT AUTO_INCREMENT PRIMARY KEY,
    BookID INT NOT NULL,
    UserID INT NOT NULL,
    ReservationDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    CONSTRAINT fk_reservations_books
        FOREIGN KEY (BookID) REFERENCES Books(BookID)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_reservations_users
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_reservation_status
        CHECK (Status IN ('Pending', 'Approved', 'Cancelled', 'Fulfilled'))
) ENGINE=InnoDB;

CREATE TABLE Fines (
    FineID INT AUTO_INCREMENT PRIMARY KEY,
    BorrowID INT NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'Unpaid',
    PaymentDate DATE,
    CONSTRAINT fk_fines_borrowings
        FOREIGN KEY (BorrowID) REFERENCES Borrowings(BorrowID)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_fine_amount
        CHECK (Amount >= 0),
    CONSTRAINT chk_fine_status
        CHECK (Status IN ('Unpaid', 'Paid', 'Waived'))
) ENGINE=InnoDB;

-- ============================================================================
-- 6. SYSTEM AUDIT & SECURITY LOGGING
-- ============================================================================
CREATE TABLE Audit_Logs (
    LogID BIGINT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NULL,
    ActionType VARCHAR(50) NOT NULL,
    TableName VARCHAR(100) NOT NULL,
    RecordID INT NULL,
    OldValues JSON NULL,
    NewValues JSON NULL,
    Description TEXT,
    IPAddress VARCHAR(45) NULL,
    `Timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_auditlogs_users
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================================
-- 7. PERFORMANCE & SEARCH OPTIMIZATION INDEXES
-- ============================================================================
CREATE INDEX idx_books_title ON Books(Title);
CREATE INDEX idx_books_isbn ON Books(ISBN);
CREATE INDEX idx_books_category ON Books(CategoryID);
CREATE INDEX idx_borrowings_user ON Borrowings(UserID);
CREATE INDEX idx_borrowings_book ON Borrowings(BookID);
CREATE INDEX idx_borrowings_status_due ON Borrowings(Status, DueDate);
CREATE INDEX idx_reservations_user ON Reservations(UserID);
CREATE INDEX idx_reservations_book_status ON Reservations(BookID, Status);
CREATE INDEX idx_fines_status ON Fines(Status);
CREATE INDEX idx_auditlogs_user_time ON Audit_Logs(UserID, `Timestamp`);
CREATE INDEX idx_auditlogs_action ON Audit_Logs(ActionType, TableName);

-- ============================================================================
-- 8. AUTOMATIC AUDIT TRIGGERS
-- ============================================================================
DELIMITER $$

CREATE TRIGGER trg_audit_users_update
AFTER UPDATE ON Users
FOR EACH ROW
BEGIN
    INSERT INTO Audit_Logs (
        UserID, ActionType, TableName, RecordID, OldValues, NewValues, Description
    )
    VALUES (
        NEW.UserID, 'UPDATE', 'Users', NEW.UserID,
        JSON_OBJECT('Username', OLD.Username, 'Email', OLD.Email, 'RoleID', OLD.RoleID, 'IsActive', OLD.IsActive),
        JSON_OBJECT('Username', NEW.Username, 'Email', NEW.Email, 'RoleID', NEW.RoleID, 'IsActive', NEW.IsActive),
        'User profile updated'
    );
END$$

CREATE TRIGGER trg_audit_books_update
AFTER UPDATE ON Books
FOR EACH ROW
BEGIN
    IF OLD.AvailableCopies <> NEW.AvailableCopies OR OLD.TotalCopies <> NEW.TotalCopies THEN
        INSERT INTO Audit_Logs (
            UserID, ActionType, TableName, RecordID, OldValues, NewValues, Description
        )
        VALUES (
            NULL, 'UPDATE', 'Books', NEW.BookID,
            JSON_OBJECT('TotalCopies', OLD.TotalCopies, 'AvailableCopies', OLD.AvailableCopies),
            JSON_OBJECT('TotalCopies', NEW.TotalCopies, 'AvailableCopies', NEW.AvailableCopies),
            CONCAT('Inventory updated for book: ', NEW.Title)
        );
    END IF;
END$$

DELIMITER ;

-- ============================================================================
-- 9. INITIAL SEED DATA
-- ============================================================================
INSERT INTO Roles (RoleName, Description) VALUES
('Admin', 'Administrator with full privileges'),
('Librarian', 'Staff managing inventory and loans'),
('Student', 'Academic library customer');

INSERT INTO Users (Username, PasswordHash, Email, RoleID) VALUES
('admin_user', '$2y$10$e.g.samplehashforbcrypt1234567890abcdefghijklmnopqrstuv', 'admin@library.edu', 1),
('librarian_1', '$2y$10$e.g.samplehashforbcrypt1234567890abcdefghijklmnopqrstuv', 'staff1@library.edu', 2),
('student_101', '$2y$10$e.g.samplehashforbcrypt1234567890abcdefghijklmnopqrstuv', 'student101@student.edu', 3);

INSERT INTO Students (UserID, StudentCardNo, Faculty, AcademicYear) VALUES
(3, 'CARD-99081', 'Faculty of Engineering', 'Year 3');

INSERT INTO Employees (UserID, Department, HireDate) VALUES
(2, 'Library Circulation Desk', '2024-01-15');

INSERT INTO Categories (CategoryName, ShelfLocation) VALUES
('Computer Science', 'Shelf A-1'),
('Database Architecture', 'Shelf A-2');

INSERT INTO Books (ISBN, Title, PublicationYear, CategoryID, TotalCopies, AvailableCopies) VALUES
('978-0131103627', 'The C Programming Language', 1988, 1, 5, 5),
('978-0132145374', 'Fundamentals of Database Systems', 2015, 2, 3, 3);