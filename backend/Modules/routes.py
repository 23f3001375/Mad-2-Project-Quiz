import os
from flask import current_app as app,jsonify, render_template, request, send_from_directory
from flask_security import auth_required,roles_required,current_user,roles_accepted,hash_password
from Modules.models import db
from werkzeug.security import generate_password_hash,check_password_hash
from flask_login import login_user,logout_user
from celery.result import AsyncResult
from Modules.tasks import csv_report

@app.route('/')
def home_webpage():
    return render_template('index.html')

@app.post('/api/register')
def user_creation():
    data=request.get_json()
    if not app.security.datastore.find_user(email=data['email']):
        app.security.datastore.create_user(username=data['username'],email=data['email'],dob=data['dob'],
                                           password=generate_password_hash(data['password']),roles=['user'])
        db.session.commit()
        return jsonify({
            "message":"Account created successfully"
        }),201
    return jsonify({
        "message":"User already exists"
    }),400

@app.post('/api/login')
def user_login():
    data=request.get_json()
    email=data["email"]
    password=data["password"]
    if not email:
        return jsonify({
            "message":"Email is required"
        }),400
    if not password:
        return jsonify({
            "message":"Password is required"
        }),400
    user=app.security.datastore.find_user(email=email)
    if not user:
        return jsonify({
            "message":"User Not Found"
        }),403        
    if not user.active:
        return jsonify({
            "message":"You are blocked from using this website"
        }),403
    if user:
        if check_password_hash(user.password,password):
            logout_user()
            if current_user.is_authenticated:
                return jsonify({
                "message":"User already logged in"
                }),400
            login_user(user)
            role=user.roles[0].name if user.roles else "user"
            return jsonify({
                "message":"Login successful",
                "id":user.id,
                "username":user.username,
                "email":user.email,
                "role":role,
                "token":user.get_auth_token()
            }),200
        return jsonify({
            "message":"Invalid password"
        }),400
    else:
        return jsonify({
            "message":"User not found"
        }),404

@app.route('/api/admin')
@auth_required('token')
@roles_required('admin')
def admin_dashboard():
    return {
        "message":"Welcome to the Admin Dashboard"
    }

@app.route('/api/user')
@auth_required('token')
@roles_accepted('admin','user')
def user_dashboard():
    user=current_user
    return jsonify({
        "username":user.username,
        "email":user.email,
    })

@app.route('/api/logout',methods=['POST'])
@auth_required('token')
@roles_accepted('admin','user')
def logout():
    logout_user()
    return jsonify({
        "message":"User Logout"
    }),200

@app.route('/api/export')
def export_csv():
    result=csv_report.delay()
    return jsonify({
        "id": result.id,
        "result": result.result,
    })

@app.route('/api/csv_result/<id>')
def csv_result(id):
    res = AsyncResult(id)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    static_dir = os.path.join(current_dir, '..', '..', 'frontend', 'static')
    return send_from_directory(static_dir, res.result)