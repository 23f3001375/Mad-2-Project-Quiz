from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from sqlalchemy import Date, DateTime, func
db=SQLAlchemy()

class User(db.Model, UserMixin):
    __tablename__="users"
    id = db.Column(db.Integer, primary_key=True)
    username=db.Column(db.String(50),nullable=False,unique=True)
    password=db.Column(db.String(20),nullable=False)
    email=db.Column(db.String(50),nullable=False,unique=True)
    dob=db.Column(db.String(20),nullable=False)
    fs_uniquifier=db.Column(db.String(50),nullable=False,unique=True)
    active=db.Column(db.Boolean,nullable=False)
    roles=db.relationship("Role",backref="user",secondary="user_roles")
    score=db.relationship("Scores",backref="user")

class Role(db.Model, RoleMixin):
    __tablename__="roles"
    id = db.Column(db.Integer, primary_key=True)
    name=db.Column(db.String(50),nullable=False,unique=True)
    description=db.Column(db.String(255))

class UserRoles(db.Model):
    __tablename__="user_roles"
    id = db.Column(db.Integer, primary_key=True)
    user_id=db.Column(db.Integer,db.ForeignKey("users.id"))
    role_id=db.Column(db.Integer,db.ForeignKey("roles.id"))

class Subjects(db.Model):
    __tablename__="subjects"
    subject_id = db.Column(db.Integer, primary_key=True)
    subject_name=db.Column(db.String(50),nullable=False,unique=True)
    desc=db.Column(db.String(50))
    chapters=db.relationship("Chapters",backref="subject",cascade="all, delete-orphan")

class Chapters(db.Model):
    __tablename__="chapters"
    chapter_id = db.Column(db.Integer, primary_key=True)
    chapter_name=db.Column(db.String(50),nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey("subjects.subject_id"))
    desc=db.Column(db.String(50))
    quizzes=db.relationship("Quiz",backref="chapter",cascade="all, delete-orphan")

class Quiz(db.Model):
    __tablename__="quiz"
    quiz_id = db.Column(db.Integer, primary_key=True)
    quiz_name=db.Column(db.String(50),nullable=False)
    quiz_date=db.Column(db.Date,nullable=False)
    chapter_id = db.Column(db.Integer, db.ForeignKey("chapters.chapter_id"))
    duration=db.Column(db.Integer,nullable=False)
    questions=db.relationship("Questions",backref="quiz",cascade="all, delete-orphan")

class Questions(db.Model):
    __tablename__="questions"
    question_id = db.Column(db.Integer, primary_key=True)
    question=db.Column(db.String(255),nullable=False)
    option1=db.Column(db.String(255),nullable=False)
    option2=db.Column(db.String(255),nullable=False)
    option3=db.Column(db.String(255),nullable=False)
    option4=db.Column(db.String(255),nullable=False)
    correctOption=db.Column(db.Integer,nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quiz.quiz_id"))

#One to many relationship between User and Scores
class Scores(db.Model):
    __tablename__="scores"
    score_id = db.Column(db.Integer, primary_key=True)
    user_id=db.Column(db.Integer,db.ForeignKey("users.id"))
    quiz_id=db.Column(db.Integer,db.ForeignKey("quiz.quiz_id"))
    score=db.Column(db.Integer,nullable=False)
    time=db.Column(Date,default=func.current_date(),nullable=False)
    length=db.Column(db.Integer,nullable=False)