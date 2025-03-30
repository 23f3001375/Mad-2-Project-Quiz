from datetime import datetime
from flask_restful import Api, Resource, reqparse
from Modules.models import *
from flask_security import auth_required,roles_required,current_user
from flask import current_app as app, flash,jsonify, request
from Modules.cache_setup import cache
from Modules.tasks import quiz_report

api=Api()
parser=reqparse.RequestParser()

class AdminHome(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        return jsonify({
            "message":"Welcome Admin to the Admin Dashboard"
        }),200
    
class AdminSummary(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        users=User.query.count()
        quizzes=Quiz.query.count()
        subjects=Subjects.query.count()
        chapters=Chapters.query.count()
        attempts=Scores.query.count()
        return {
                "usersCount":users,"subjectsCount":subjects,"chaptersCount":chapters,
                "quizCount":quizzes,"quizAttemptsCount":attempts,
        },200

class UserHome(Resource):
    @auth_required('token')
    @roles_required('user')
    def get(self):
        user=current_user
        return jsonify({
            "username":user.username,
            "email":user.email,
        }),200

class UserSummary(Resource):
    @auth_required('token')
    @roles_required('user')
    def get(self):
        user=current_user
        scores=Scores.query.filter_by(user_id=user.id).all()
        result=[]
        for score in scores:
            quiz_id=score.quiz_id
            quiz=Quiz.query.filter_by(quiz_id=quiz_id).first()
            quiz_name = quiz.quiz_name if quiz else "Unknown Quiz"
            marks=score.score
            total_marks=(score.length)*2
            percentage=marks/total_marks*100
            result.append({
                "quiz_name":quiz_name,
                "percentage":percentage
            })
        return result,200

class ManageUsers(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        users=User.query.all()
        users.pop(0)
        return [{
            "id":user.id,
            "username":user.username,
            "email":user.email,
            "dob":user.dob,
            "active":user.active,
            } 
            for user in users],200

class ChangeUserStatus(Resource):
    @auth_required('token')
    @roles_required('admin')
    def post(self,user_id):
        data=request.get_json()
        new_status=data.get('active')
        user=User.query.filter_by(id=user_id).first()
        if not user:
            return {
                "message":"User Not Found"
            },404
        user.active=new_status
        db.session.commit()
        return {
            "message":"user status updated"
        },200
    
class ManageSubjects(Resource):
    @cache.cached(timeout=300, key_prefix='transactions_data')
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        print("From subjects...")
        subjects=Subjects.query.all()
        return [{
            "id":subject.subject_id,
            "name":subject.subject_name,
            "desc":subject.desc,
        } for subject in subjects],200
    
class AddSubjects(Resource):
    @auth_required('token')
    @roles_required('admin')
    def post(self):
        data=request.get_json()
        subject_name=data.get('subjectname')
        subject_desc=data.get('subjectDesc')
        if not subject_name:
            return {"message":"Subject name is required","success":False},400
        if not subject_desc:
            return {"message":"Subject description is required","success":False},400
        exist_subjects=Subjects.query.filter_by(subject_name=subject_name).first()
        if exist_subjects:
            return {"message":"Subject Already Exists","success":False},400
        try:
            new_subject=Subjects(subject_name=subject_name,desc=subject_desc)
            db.session.add(new_subject)
            db.session.commit()
        except:
            return{"message":"Error Occured","success":False },500
        return {
            "message":"Subject Created Successfully",
            "success":True,
            "id": new_subject.subject_id, 
            "name": new_subject.subject_name,
            "desc": new_subject.desc
        },201
    
class DeleteSubject(Resource):
    @auth_required('token')
    @roles_required('admin')
    def post(self,subject_id):
        subject=Subjects.query.filter_by(subject_id=subject_id).first()
        if not subject:
            return {"message":"Subject Not Found","success":False},400
        db.session.delete(subject)
        db.session.commit()
        return {"message":"Subject deleted","success":True},200

class EditSubject(Resource):
    @auth_required('token')
    @roles_required('admin')
    def post(self,subject_id):
        data=request.get_json()
        subject=Subjects.query.filter_by(subject_id=subject_id).first()
        if not subject:
            return {"message":"Subject not Found"},400
        if 'name' in data:
            subject.subject_name = data['name']
        if 'desc' in data:
            subject.desc = data['desc']
        try:
            db.session.commit()
            return {"success": True, "message": "Subject updated successfully"},200
        except Exception as e:
            db.session.rollback()
            return {"success": False, "message": "Database error", "error": str(e)}, 500  
  
class ManageChapters(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self,subjectId):
        print("From chapters...")
        subject=Subjects.query.filter_by(subject_id=subjectId).first()
        if not subject:
            return {
                "message": "Subject not found",
                "success": False
            }, 404
        chapters=Chapters.query.filter_by(subject_id=subjectId).all()
        chapters_list=[
            {
                "chapter_id":chapter.chapter_id,
                "chapter_name":chapter.chapter_name,
                "desc":chapter.desc,
            }for chapter in chapters
        ]
        return {
            "subject_name":subject.subject_name,
            "chapters":chapters_list,
            "success":True
        },200
    
class AddChapter(Resource):
    @auth_required('token')
    @roles_required('admin')
    def post(self):
        data=request.get_json()
        chapter_name=data.get('chaptername')
        chapter_desc=data.get('chapterdesc')
        subject_id=data.get('subjectId')
        if not chapter_name:
            return {"message":"Chapter name is required","success":False},400
        if not chapter_desc:
            return {"message":"Chapter description is required","success":False},400
        exist_chapter=Chapters.query.filter_by(chapter_name=chapter_name).first()
        if exist_chapter:
            return {"message":"Chapter Already Exists","success":False},400
        try:
            new_chapter=Chapters(chapter_name=chapter_name,desc=chapter_desc,subject_id=subject_id)
            db.session.add(new_chapter)
            db.session.commit()
        except:
            return{"message":"Error Occured","success":False },500
        return {
            "message":"Chapter Created Successfully",
            "success":True,
            "chapter_id": new_chapter.chapter_id, 
            "chapter_name": new_chapter.chapter_name,
            "desc": new_chapter.desc
        },201  

class EditChapter(Resource):
    @auth_required('token')
    @roles_required('admin')
    def post(self,chapter_id):
        data=request.get_json()
        chapter=Chapters.query.filter_by(chapter_id=chapter_id).first()
        if not chapter:
            return {"message":"Chapter not Found"},400
        if 'name' in data:
            chapter.chapter_name = data['name']
        if 'desc' in data:
            chapter.desc = data['desc']
        try:
            db.session.commit()
            return {"success": True, "message": "Chapter updated successfully"},200
        except Exception as e:
            db.session.rollback()
            return {"success": False, "message": "Database error", "error": str(e)}, 500  

class DeleteChapter(Resource):
    @auth_required('token')
    @roles_required('admin')
    def post(self,chapter_id):
        chapter=Chapters.query.filter_by(chapter_id=chapter_id).first()
        if not chapter:
            return {"message":"Chapter Not Found","success":False},400
        db.session.delete(chapter)
        db.session.commit()
        return {"message":"Chapter deleted","success":True},200

class ManageQuiz(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self,chapterId):
        chapter=Chapters.query.filter_by(chapter_id=chapterId).first()
        if not chapter:
            return {
                "message": "Quiz not found",
                "success": False
            }, 404
        quizzes=Quiz.query.filter_by(chapter_id=chapterId).all()
        quizzes_list=[
            {
                "id":quizz.quiz_id,
                "name":quizz.quiz_name,
                "date":quizz.quiz_date.strftime('%Y-%m-%d'),
                "duration":quizz.duration,
            }for quizz in quizzes
        ]
        return {
            "chapter_name":chapter.chapter_name,
            "quizzes":quizzes_list,
            "success":True
        },200
    
class DeleteQuiz(Resource):
    @auth_required('token')
    @roles_required('admin')
    def post(self,quiz_id):
        quiz=Quiz.query.filter_by(quiz_id=quiz_id).first()
        if not quiz:
            return {"message":"Quiz Not Found","success":False},400
        db.session.delete(quiz)
        db.session.commit()
        return {"message":"Quiz deleted","success":True},200

class AddQuiz(Resource):
    @auth_required('token')
    @roles_required('admin')
    def post(self):
        data=request.get_json()
        quiz_name=data.get('quizname')
        quiz_date=data.get('quizdate')
        duration=data.get('quizduration')
        chapter_id=data.get('chapterId')
        if not quiz_name:
            return {"message":"Quiz name is required","success":False},400
        if not quiz_date:
            return {"message":"Quiz date is required","success":False},400
        if not duration:
            return {"message":"Quiz duration is required","success":False},400
        try:
            quiz_date_obj = datetime.strptime(quiz_date, '%Y-%m-%d').date()
        except ValueError:
            return {"message": "Invalid date format. Use 'YYYY-MM-DD'", "success": False}, 400
        chapter = Chapters.query.filter_by(chapter_id=chapter_id).first()
        if not chapter:
            return {"message": "Invalid Chapter ID", "success": False}, 400
        try:
            new_quiz=Quiz(quiz_name=quiz_name,quiz_date=quiz_date_obj,chapter_id=chapter_id,duration=duration)
            db.session.add(new_quiz)
            db.session.commit()
            result=quiz_report(quiz_name,quiz_date)
        except:
            return{"message":"Error Occured","success":False },500
        return {
            "message":"Quiz Created Successfully",
            "success":True,
            "id": new_quiz.quiz_id, 
            "name": new_quiz.quiz_name,
            "date": new_quiz.quiz_date.strftime('%Y-%m-%d'),
            "duration": new_quiz.duration
        },201  
    
class EditQuiz(Resource):
    @auth_required('token')
    @roles_required('admin')
    def post(self,quiz_id):
        data=request.get_json()
        quiz=Quiz.query.filter_by(quiz_id=quiz_id).first()
        if not quiz:
            return {"message":"Quiz not Found"},400
        if 'name' in data:
            quiz.quiz_name = data['name']
        if 'date' in data:
            quiz.quiz_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        if 'duration' in data:
            print(data['duration'])
            quiz.duration = data['duration']
        try:
            db.session.commit()
            return {"success": True, "message": "Quiz updated successfully"},200
        except Exception as e:
            db.session.rollback()
            return {"success": False, "message": "Database error", "error": str(e)}, 500  

class Question(Resource):
    def get(self,quiz_id):
        questions=Questions.query.filter_by(quiz_id=quiz_id).all()
        return [{
            "id":question.question_id,
            "question":question.question,
            "option1":question.option1,
            "option2":question.option2,
            "option3":question.option3,
            "option4":question.option4,
            "correctOption":question.correctOption,
        } for question in questions],200

class AddQuestion(Resource):
    @auth_required('token')
    @roles_required('admin')
    def post(self,quiz_id):
        data=request.get_json()
        question=data.get('question')
        option1=data.get('option1')
        option2=data.get('option2')
        option3=data.get('option3')
        option4=data.get('option4')
        correctOption=data.get('correctOption')
        if not question:
            return {"message":"Question is required","success":False},400
        if not option1 or not option2 or not option3 or not option4:
            return {"message":"All options are required","success":False},400
        if not correctOption:
            return {"message":"Answer is required","success":False},400
        try:
            new_question=Questions(question=question,option1=option1,option2=option2,option3=option3,option4=option4,correctOption=correctOption,quiz_id=quiz_id)
            db.session.add(new_question)
            db.session.commit()
        except:
            return{"message":"Error Occured","success":False },500
        return {
            "message":"Question Created Successfully",
            "success":True,
            "id": new_question.question_id, 
            "question": new_question.question,
            "option1": new_question.option1,
            "option2": new_question.option2,
            "option3": new_question.option3,
            "option4": new_question.option4,
            "correctOption": new_question.correctOption,
        },201
    
class UserSubjects(Resource):
    @auth_required('token')
    @roles_required('user')
    def get(self):
        subjects=Subjects.query.all()
        return [{
            "id":subject.subject_id,
            "name":subject.subject_name,
            "desc":subject.desc,
        } for subject in subjects],200
    
class UserChapters(Resource):
    @auth_required('token')
    @roles_required('user')
    def get(self,subject_id):
        subject=Subjects.query.filter_by(subject_id=subject_id).first()
        if not subject:
            return {
                "message": "Subject not found",
                "success": False
            }, 404
        chapters=Chapters.query.filter_by(subject_id=subject_id).all()
        chapters_list=[
            {
                "chapter_id":chapter.chapter_id,
                "chapter_name":chapter.chapter_name,
                "desc":chapter.desc,
            }for chapter in chapters
        ]
        return {
            "subject_name":subject.subject_name,
            "chapters":chapters_list,
            "success":True
        },200
    
class UserQuizzes(Resource):
    @auth_required('token')
    @roles_required('user')
    def get(self,chapter_id):
        chapter=Chapters.query.filter_by(chapter_id=chapter_id).first()
        if not chapter:
            return {
                "message": "Chapter not found",
                "success": False
            }, 404
        quizzes=Quiz.query.filter_by(chapter_id=chapter_id).all()
        quizzes_list=[
            {
                "id":quizz.quiz_id,
                "name":quizz.quiz_name,
                "date":quizz.quiz_date.strftime('%Y-%m-%d'),
                "duration":quizz.duration,
            }for quizz in quizzes
        ]
        return {
            "chapter_name":chapter.chapter_name,
            "quizzes":quizzes_list,
            "success":True
        },200
    
class UserQuestions(Resource):
    def get(self, quiz_id):
        questions = Questions.query.filter_by(quiz_id=quiz_id).all()
        all_questions = [{
            "id": question.question_id,
            "question": question.question,
            "option1": question.option1,
            "option2": question.option2,
            "option3": question.option3,
            "option4": question.option4,
        } for question in questions]
        quiz = Quiz.query.filter_by(quiz_id=quiz_id).first()
        if not quiz:
            return {"error": "Quiz not found"}, 404
        return {
            "quiz_id": quiz_id,
            "questions": all_questions,
            "duration": quiz.duration,
        }, 200

    
class UserSubmit(Resource):
    @auth_required('token')
    @roles_required('user')
    def post(self, quiz_id):
        data = request.get_json()
        questions = Questions.query.filter_by(quiz_id=quiz_id).all()
        correct = 0
        wrong = 0
        for question in questions:
            submitted_answer = data.get(str(question.question_id))
            if submitted_answer is None:
                wrong += 1
            elif question.correctOption == int(submitted_answer):
                correct += 1
            else:
                wrong += 1
        new_score=Scores(user_id=current_user.id, quiz_id=quiz_id, score=correct*2,time=datetime.now().date(),length=len(questions))
        db.session.add(new_score)
        db.session.commit()
        return {
            "correct": correct,
            "wrong": wrong,
            "total_questions": len(questions),
            "score": correct*2,
            "message": "Quiz submitted successfully"
        }, 200
    
class UserScores(Resource):
    @auth_required('token')
    @roles_required('user')
    def get(self):
        scores = Scores.query.filter_by(user_id=current_user.id).all()
        result = [{
            "score_id": score.score_id,
            "quiz_id": score.quiz_id,
            "quiz_name": Quiz.query.filter_by(quiz_id=score.quiz_id).first().quiz_name,
            "score": score.score,
            "questions":score.length,
            "totalScore":score.length*2,
            "time": score.time.strftime('%Y-%m-%d'),
        } for score in scores]
        return result, 200

