import os
import csv
import requests
from datetime import datetime
from celery import shared_task
from Modules.models import Scores, User, Quiz
from Modules.mail import send_email
from Modules.utils import format_report

@shared_task(ignore_result=False, name="download_csv_report")
def csv_report():
    scores = Scores.query.all()
    csv_file_name = f"scores_{datetime.now().strftime('%f')}.csv"
    current_dir = os.path.dirname(os.path.abspath(__file__))
    static_dir = os.path.join(current_dir, '..', '..', 'frontend', 'static')
    os.makedirs(static_dir, exist_ok=True)
    file_path = os.path.join(static_dir, csv_file_name)
    with open(file_path, 'w', newline="") as file:
        quiz_csv = csv.writer(file, delimiter=",")
        quiz_csv.writerow(["Sr No", "User ID", "Quiz ID", "Score", "Email"])
        srno = 1
        for score in scores:
            quiz_csv.writerow([srno, score.user_id, score.quiz_id, score.score, score.user.email])
            srno += 1
    return csv_file_name


@shared_task(ignore_result=False, name="monthly_report")
def monthly_report():
    users = User.query.all()
    for user in users[1:]: 
        user_data = {
            "username": user.username,
            "email": user.email,
            "quiz": []
        }
        for score in user.score:
            quiz_details = Quiz.query.filter_by(quiz_id=score.quiz_id).first()
            user_data["quiz"].append({
                "quiz_id": score.quiz_id,
                "quiz_name": quiz_details.quiz_name if quiz_details else "Unknown",
                "score": score.score,
                "time": score.time
            })
        current_dir = os.path.dirname(os.path.abspath(__file__))
        templates_dir = os.path.join(current_dir, '..', '..', 'frontend', 'templates')
        message = format_report(os.path.join(templates_dir, 'mail_details.html'), user_data)
        send_email(to_address=user.email, subject="Monthly Report", message=message)
    return "Monthly Report Generated"


@shared_task(ignore_result=False, name="quiz_report")
def quiz_report(quiz_name, quiz_date):
    print("quiz_report task started")
    text = f"Alert! A new Quiz -> {quiz_name} has been added to the portal with date {quiz_date}. Please login to the portal and attempt the quiz."
    response = requests.post(
        "https://chat.googleapis.com/v1/spaces/AAAAactADPQ/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=W2AER2_q9aazoIJviuiZVkIefeQV97FkrkugHcQ52FE",
        headers={"Content-Type": "application/json"},
        json={"text": text}
    )
    return "Quiz Alert Generated"
