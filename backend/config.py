import os

class Config:
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', 'ironman2003')
    MYSQL_DATABASE = os.getenv('MYSQL_DATABASE', 'complaint_tracking_system')
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key')
