from Modules.celery_init import celery_init_app
from Modules.config import Configuartion, DevelopmentConfig
from flask import Flask, request, jsonify,send_from_directory
from Modules.models import db, User, Role
from flask_security import Security, SQLAlchemyUserDatastore, UserMixin, RoleMixin,hash_password
from werkzeug.security import generate_password_hash,check_password_hash
from Modules.resources import  AddChapter, AddQuestion, AddQuiz, AddSubjects, AdminSummary, ChangeUserStatus, DeleteChapter, DeleteQuestion, DeleteQuiz, DeleteSubject, EditChapter, EditQuestion, EditQuiz, EditSubject, ManageChapters, ManageQuiz,ManageSubjects, ManageUsers,AdminHome, Question, UserChapters,UserHome, UserQuestions, UserQuizzes, UserScores, UserSubjects, UserSubmit, UserSummary,api
from Modules.tasks import monthly_report
from celery.schedules import crontab
from Modules.cache_setup import cache

def create_app():
    app=Flask(__name__,template_folder='../frontend/templates',static_folder='../frontend/static')
    app.config.from_object(DevelopmentConfig)
    db.init_app(app)
    datastore=SQLAlchemyUserDatastore(db,User,Role)
    app.security=Security(app,datastore)
    app.app_context().push()
    return app

app = create_app()
api.__init__(app)

app.config['CACHE_TYPE'] = 'RedisCache'
app.config['CACHE_REDIS_HOST'] = 'localhost'  
app.config['CACHE_REDIS_PORT'] = 6379
app.config['CACHE_REDIS_DB'] = 0
app.config['CACHE_DEFAULT_TIMEOUT'] = 300
cache.__init__(app)
celery = celery_init_app(app)
celery.autodiscover_tasks()

with app.app_context():
    db.create_all()
    app.security.datastore.find_or_create_role(name="admin",description="admin")
    app.security.datastore.find_or_create_role(name="user",description="user")
    db.session.commit()

    if not app.security.datastore.find_user(email="admin@gmail.com"):
        app.security.datastore.create_user(username="admin",email="admin@gmail.com",dob="04-01-2006",
                                           password=generate_password_hash("admin_quiz"),roles=['admin'])
        
    if not app.security.datastore.find_user(email="user@gmail.com"):
        app.security.datastore.create_user(username="user",email="user@gmail.com",dob="04-01-2006",
                                           password=generate_password_hash("user_quiz"),roles=['user'])
    db.session.commit()

from Modules.routes import *

api.add_resource(AdminHome,'/api/admin')
api.add_resource(AdminSummary,'/api/admin/home')
api.add_resource(UserHome,'/api/user')
api.add_resource(UserSummary,'/api/user/summary')
api.add_resource(ManageUsers,'/api/admin/manage_users')
api.add_resource(ChangeUserStatus,'/api/admin/manage_users/changestatus/<int:user_id>')
api.add_resource(ManageSubjects,'/api/admin/manage_subjects')
api.add_resource(AddSubjects,'/api/admin/manage_subjects/addsubject')
api.add_resource(EditSubject,'/api/admin/manage_subjects/editsubject/<int:subject_id>')
api.add_resource(DeleteSubject,'/api/admin/manage_subjects/deletesubject/<int:subject_id>')
api.add_resource(ManageChapters,'/api/admin/manage_chapters/<int:subjectId>')
api.add_resource(AddChapter,'/api/admin/manage_chapters/addchapter')
api.add_resource(EditChapter,'/api/admin/manage_chapters/editchapter/<int:chapter_id>')
api.add_resource(DeleteChapter,'/api/admin/manage_chapters/deletechapter/<int:chapter_id>')
api.add_resource(ManageQuiz,'/api/admin/manage_quizzes/<int:chapterId>')
api.add_resource(AddQuiz,'/api/admin/manage_quizzes/addquiz')
api.add_resource(DeleteQuiz,'/api/admin/manage_quizzes/deletequiz/<int:quiz_id>')
api.add_resource(EditQuiz,'/api/admin/manage_quizzes/editquiz/<int:quiz_id>')
api.add_resource(Question,'/api/admin/questions/<int:quiz_id>')
api.add_resource(AddQuestion,'/api/admin/questions/add/<int:quiz_id>')
api.add_resource(EditQuestion,'/api/admin/questions/edit/<int:question_id>')
api.add_resource(DeleteQuestion,'/api/admin/questions/delete/<int:question_id>')
api.add_resource(UserSubjects,'/api/user/subjects')
api.add_resource(UserChapters,'/api/user/subjects/<int:subject_id>/chapters')
api.add_resource(UserQuizzes,'/api/user/chapters/<int:chapter_id>/quizzes')
api.add_resource(UserQuestions,'/api/user/quizzes/<int:quiz_id>/attempt')
api.add_resource(UserSubmit,'/api/user/quizzes/<int:quiz_id>/submit')
api.add_resource(UserScores,'/api/user/scores')

@celery.on_after_finalize.connect 
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(minute = '*/2'),
        monthly_report.s(),
    )

if __name__=="__main__":
    app.run()