from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

DEPT_MAP = {
    "104": "CSE",
    "205": "IT",
    "118": "CCE",
    "148": "AI ML",
    "149": "CYBER"
}

YEAR_MAP = {
    "22": 4,
    "23": 4,
    "24": 3,
    "25": 2,
    "26": 1
}

def parse_registration_number(reg_no):
    reg_str = str(reg_no).strip().upper()
    if not reg_str or reg_str == 'NAN':
        return "Unknown", 0
        
    dept = "Unknown"
    year = 0
    
    # 1. Standard 12-digit numeric check (e.g. 721023104023)
    if len(reg_str) >= 9 and reg_str.isdigit():
        join_year_code = reg_str[4:6]  # Digits 5-6 -> Academic Year
        dept_code = reg_str[6:9]       # Digits 7-9 -> Department
        dept = DEPT_MAP.get(dept_code, "Unknown")
        year = YEAR_MAP.get(join_year_code, 0)
        if dept != "Unknown" or year != 0:
            return dept, year
            
    # 2. Text Substring Fallback (e.g. "23IT045", "CSE2401")
    for y_code, y_num in YEAR_MAP.items():
        if y_code in reg_str:
            year = y_num
            break
            
    if 'IT' in reg_str:
        dept = 'IT'
    elif 'CCE' in reg_str:
        dept = 'CCE'
    elif 'AIML' in reg_str or 'AI' in reg_str or 'ML' in reg_str:
        dept = 'AI ML'
    elif 'CYBER' in reg_str or 'CYS' in reg_str or 'CY' in reg_str:
        dept = 'CYBER'
    elif 'CSE' in reg_str or 'CS' in reg_str:
        dept = 'CSE'
        
    return dept, year

class Student(Base):
    __tablename__ = 'students'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    register_number = Column(String(50), unique=True, nullable=False, index=True)
    department = Column(String(50), nullable=False, index=True)
    year = Column(Integer, nullable=False)
    section = Column(String(10), nullable=True)

    leetcode_username = Column(String(100), nullable=True)
    codechef_username = Column(String(100), nullable=True)
    hackerrank_username = Column(String(100), nullable=True)
    github_username = Column(String(100), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    platform_stats = relationship("PlatformStats", back_populates="student", cascade="all, delete-orphan")
    attendance_records = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "register_number": self.register_number,
            "department": self.department,
            "year": self.year,
            "section": self.section or "",
            "leetcode_username": self.leetcode_username or "",
            "codechef_username": self.codechef_username or "",
            "hackerrank_username": self.hackerrank_username or "",
            "github_username": self.github_username or "",
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class PlatformStats(Base):
    __tablename__ = 'platform_stats'

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey('students.id', ondelete="CASCADE"), nullable=False, index=True)
    platform = Column(String(50), nullable=False, index=True) # leetcode, codechef, hackerrank, github

    # Generic / CP metrics
    problems_solved = Column(Integer, default=0)
    easy_solved = Column(Integer, default=0)
    medium_solved = Column(Integer, default=0)
    hard_solved = Column(Integer, default=0)
    rating = Column(Integer, default=0)
    highest_rating = Column(Integer, default=0)
    stars = Column(String(20), default="")
    contests_count = Column(Integer, default=0)
    global_rank = Column(String(50), default="")
    active_days = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    max_streak = Column(Integer, default=0)
    submission_calendar = Column(Text, default="{}")

    # HackerRank specific
    badges_count = Column(Integer, default=0)
    skills = Column(String(255), default="")
    certifications_count = Column(Integer, default=0)
    score = Column(Integer, default=0)

    # GitHub specific
    public_repos = Column(Integer, default=0)
    contributions = Column(Integer, default=0)
    commits = Column(Integer, default=0)
    pull_requests = Column(Integer, default=0)
    issues = Column(Integer, default=0)
    stars_received = Column(Integer, default=0)
    followers = Column(Integer, default=0)

    # Calculated & System fields
    normalized_score = Column(Float, default=0.0) # 0 to 100
    status = Column(String(50), default="connected") # connected, invalid_username, data_unavailable
    error_message = Column(String(255), nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="platform_stats")

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "platform": self.platform,
            "problems_solved": self.problems_solved,
            "easy_solved": self.easy_solved,
            "medium_solved": self.medium_solved,
            "hard_solved": self.hard_solved,
            "rating": self.rating,
            "highest_rating": self.highest_rating,
            "stars": self.stars,
            "contests_count": self.contests_count,
            "global_rank": self.global_rank,
            "active_days": self.active_days,
            "current_streak": getattr(self, "current_streak", 0) or 0,
            "max_streak": getattr(self, "max_streak", 0) or 0,
            "submission_calendar": getattr(self, "submission_calendar", "{}") or "{}",
            "badges_count": self.badges_count,
            "skills": self.skills,
            "certifications_count": self.certifications_count,
            "score": self.score,
            "public_repos": self.public_repos,
            "contributions": self.contributions,
            "commits": self.commits,
            "pull_requests": self.pull_requests,
            "issues": self.issues,
            "stars_received": self.stars_received,
            "followers": self.followers,
            "normalized_score": round(self.normalized_score or 0.0, 1),
            "status": self.status,
            "error_message": self.error_message or "",
            "last_updated": self.last_updated.isoformat() if self.last_updated else None
        }

class Attendance(Base):
    __tablename__ = 'attendance'

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey('students.id', ondelete="CASCADE"), nullable=False, index=True)
    date = Column(String(10), nullable=False, index=True) # YYYY-MM-DD
    active_platform = Column(String(50), default="leetcode")
    activity_count = Column(Integer, default=0)
    status = Column(String(20), default="Present") # Present or Absent
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="attendance_records")

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "student_name": self.student.name if self.student else "",
            "register_number": self.student.register_number if self.student else "",
            "department": self.student.department if self.student else "",
            "year": self.student.year if self.student else 0,
            "date": self.date,
            "active_platform": self.active_platform,
            "activity_count": self.activity_count,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False) # super_admin, hod
    department = Column(String(50), nullable=True) # CCE, IT, CSE, ECE, EEE (if hod)
    name = Column(String(100), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "role": self.role,
            "department": self.department or "All",
            "name": self.name
        }
