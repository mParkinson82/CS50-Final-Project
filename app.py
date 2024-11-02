from flask import Flask, render_template, request, session, redirect, url_for, jsonify
import sqlite3
from functools import wraps  # for login_required decorator
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'


# Custom login_required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Database helper functions
def get_db():
    db = sqlite3.connect('users.db')
    db.row_factory = sqlite3.Row  # This lets us access columns by name
    return db

# Create tables (run this once)
def init_db():
    db = get_db()
    db.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            balance REAL DEFAULT 0.0
        )
    ''')
    db.commit()
    db.close()

# Routes

@app.route('/')
@login_required  # This will automatically redirect to login if not logged in
def index():
    if 'user_id' in session:
        db = get_db()
        user = db.execute('SELECT * FROM users WHERE id = ?', 
                        [session['user_id']]).fetchone()
        db.close()
        
        username = user['username']
        balance = "{:.2f}".format(user['balance'])
        
        return render_template('calculator.html', username=username, balance=balance)
    return redirect(url_for('login'))


def create_user(username, password, initial_balance=0.0):
    db = get_db()
    try:
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        db.execute(
            'INSERT INTO users (username, password_hash, balance) VALUES (?, ?, ?)',
            [username, hashed_password, initial_balance]
        )
        db.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        db.close()
        

@app.route('/register', methods=['GET', 'POST'])
def register():
    if 'user_id' in session:
        return redirect(url_for('index'))
        
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        # Basic validation
        if not username or not password or not confirm_password:
            return render_template('register.html', 
                error="All fields are required")
        
        if password != confirm_password:
            return render_template('register.html', 
                error="Passwords do not match")
            
        if len(password) < 6:
            return render_template('register.html', 
                error="Password must be at least 6 characters long")
            
        # Check if username exists
        db = get_db()
        existing_user = db.execute(
            'SELECT id FROM users WHERE username = ?', 
            [username]
        ).fetchone()
        
        if existing_user:
            db.close()
            return render_template('register.html', 
                error="Username already exists")
        
        try:
            # Create new user
            hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
            db.execute(
                'INSERT INTO users (username, password_hash, balance) VALUES (?, ?, ?)',
                [username, hashed_password, 0.00]  # New users start with 0 balance
            )
            db.commit()
            
            # Get the new user's id
            user = db.execute(
                'SELECT id FROM users WHERE username = ?', 
                [username]
            ).fetchone()
            
            # Log them in
            session['user_id'] = user['id']
            db.close()
            
            return redirect(url_for('index'))
            
        except Exception as e:
            db.close()
            return render_template('register.html', 
                error="Registration failed. Please try again.")
            
    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'user_id' in session:  # If already logged in
        return redirect(url_for('index'))
        
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')  # Hash this
        
        db = get_db()
        user = db.execute('SELECT * FROM users WHERE username = ?', 
                         [username]).fetchone()
        db.close()
        
        if user and check_password_hash(user['password_hash'], password):  # In real app, check password here too
            session['user_id'] = user['id']
            return redirect(url_for('index'))
        else:
            error = "Invalid username or password"
            return render_template('login.html', error=error)
            
    # If GET request, just show login page
    return render_template('login.html')

@app.route('/logout', methods=['POST'])
@login_required
def logout():
    session.clear()
    return redirect(url_for('login'))


@app.route('/add-funds', methods=['POST'])
@login_required
def add_funds():
    amount = float(request.form.get('amount', 0))
    
    if amount <= 0:
        return "Invalid amount", 400
    
    db = get_db()
    try:
        user = db.execute('SELECT balance FROM users WHERE id = ?', 
                         [session['user_id']]).fetchone()
        new_balance = user['balance'] + amount
        
        db.execute('UPDATE users SET balance = ? WHERE id = ?', 
                  [new_balance, session['user_id']])
        db.commit()
        
        return str(new_balance)
    except Exception as e:
        db.rollback()
        return "Error adding funds", 400
    finally:
        db.close()


@app.route('/purchase', methods=['POST'])
@login_required
def purchase():
    # Get the purchase amount from the request
    amount = float(request.form.get('amount', 0))
    
    if amount <= 0:
        return "Invalid amount", 400
    
    db = get_db()
    try:
        # Get current balance
        user = db.execute('SELECT balance FROM users WHERE id = ?', 
                          [session['user_id']]).fetchone()
        
        # Check if balance is sufficient
        if user['balance'] < amount:
            return "Insufficient funds", 400
        
        # Deduct the amount and update balance
        new_balance = user['balance'] - amount
        db.execute('UPDATE users SET balance = ? WHERE id = ?', 
                   [new_balance, session['user_id']])
        db.commit()
        
        return str(new_balance)
    except Exception as e:
        db.rollback()
        return "Error processing purchase", 400
    finally:
        db.close()


def create_test_user():
    db = get_db()
    try:
        db.execute('INSERT INTO users (username, password_hash, balance) VALUES (?, ?, ?)', 
                  ['testuser', 'hashed_password', 100.00])
        db.commit()
        print("Test user created!")
    except sqlite3.IntegrityError:
        print("Test user already exists!")
    finally:
        db.close()







if __name__ == '__main__':
    init_db()  # Create tables if they don't exist
    create_test_user()
    app.run(debug=True)