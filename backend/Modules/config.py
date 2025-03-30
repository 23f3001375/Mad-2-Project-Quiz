class Configuartion():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = True

class DevelopmentConfig(Configuartion):
    #configuration basics connecting db
    SQLALCHEMY_DATABASE_URI= "sqlite:///Quiz_Master_Advanced.db"
    DEBUG = True

    #configuartion for security of passwords
    SECRET_KEY= "my-mad-II-project_quix" #hash-password
    SECURITY_PASSWORD_HASH= "bcrypt" #mechanism to hash password
    SECURITY_PASSWORD_SALT= "$salt-mad2-QuixMaster$" # helps to hash password
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-token"
