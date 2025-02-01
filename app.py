import os
import sys
import openai
from dotenv import load_dotenv
from flask import Flask, render_template, redirect, url_for, flash, request, jsonify
from flask_mail import Mail, Message
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_socketio import SocketIO
from werkzeug.security import generate_password_hash, check_password_hash

# ✅ Ensure correct path for imports
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

# ✅ Load environment variables
load_dotenv()

# ✅ Initialize Flask App
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "your-secret-key")
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.getcwd(), 'instance', 'app.db')}"
app.config['MAIL_SERVER'] = "smtp.gmail.com"
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME", "your-email@gmail.com")
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD", "your-email-password")
app.config['MAIL_DEFAULT_SENDER'] = os.getenv("MAIL_DEFAULT_SENDER", "your-email@gmail.com")

# ✅ Initialize Extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
mail = Mail(app)
socketio = SocketIO(app)

# ✅ Secure OpenAI API Key using environment variables
openai.api_key = os.getenv("OPENAI_API_KEY")

# ✅ Import models after initializing db
from models.models import User, Contact

# ✅ Initialize Login Manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# ✅ Homepage Route
@app.route("/")
def home():
    return render_template("index.html", current_user=current_user)

# ✅ About Page Route
@app.route("/about")
def about():
    return render_template("about.html")

# ✅ Contact Page Route
@app.route("/contact", methods=["GET", "POST"])
def contact():
    form = ContactForm()
    if form.validate_on_submit():
        new_contact = Contact(
            name=form.name.data,
            email=form.email.data,
            message=form.message.data
        )
        db.session.add(new_contact)
        db.session.commit()
        try:
            msg = Message(
                "New Contact Form Submission",
                recipients=[app.config['MAIL_USERNAME']]
            )
            msg.body = f"Name: {form.name.data}\nEmail: {form.email.data}\nMessage: {form.message.data}"
            mail.send(msg)
            flash("Your message has been sent successfully!", "success")
        except Exception as e:
            flash(f"Failed to send email: {e}", "danger")
        return redirect(url_for("contact"))
    return render_template("contact.html", form=form)

# ✅ Calculator Page Route
@app.route("/calculator")
def calculator():
    return render_template("calculator.html")

# ✅ Login Route
@app.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("home"))

    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and check_password_hash(user.password, form.password.data):
            login_user(user)
            flash("Login successful!", "success")
            return redirect(url_for("home"))
        flash("Invalid username or password.", "danger")
    return render_template("login.html", form=form)

# ✅ Register Route
@app.route("/register", methods=["GET", "POST"])
def register():
    if current_user.is_authenticated:
        return redirect(url_for("home"))

    form = RegistrationForm()
    if form.validate_on_submit():
        if User.query.filter_by(username=form.username.data).first():
            flash("Username already exists. Please choose a different one.", "danger")
            return redirect(url_for("register"))

        new_user = User(username=form.username.data)
        new_user.password = generate_password_hash(form.password.data, method="pbkdf2:sha256")
        db.session.add(new_user)
        db.session.commit()

        flash("Registration successful! Please log in.", "success")
        return redirect(url_for("login"))
    return render_template("register.html", form=form)

# ✅ Logout Route
@app.route("/logout")
@login_required
def logout():
    logout_user()
    flash("You have been logged out.", "info")
    return redirect(url_for("home"))

# ✅ AI Chatbot Route
@app.route("/chat")
def chat():
    return render_template("chat.html")

@socketio.on("message")
def handle_message(message):
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": message}]
    )
    bot_reply = response["choices"][0]["message"]["content"]
    socketio.send(bot_reply)

# ✅ Accounting Dashboard Route
@app.route("/dashboard")
@login_required
def dashboard():
    return render_template("dashboard.html")

# ✅ Run App with WebSocket Support
if __name__ == "__main__":
    socketio.run(app, debug=True)