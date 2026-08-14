import os
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Student, PlatformStats, Attendance, User
from services.all_rounder_service import calculate_platform_normalized_score, calculate_overall_allrounder_score

# Try importing pymongo for MongoDB Atlas support
try:
    import pymongo
    HAS_PYMONGO = True
except ImportError:
    HAS_PYMONGO = False

DB_PATH = os.path.join(os.path.dirname(__file__), "codetrack.db")
DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{DB_PATH}")
MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb+srv://codetrack:PasSw0rd2023@cluster0.z1ogdtc.mongodb.net/codetrack?retryWrites=true&w=majority")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_mongo_db():
    if not HAS_PYMONGO or not MONGODB_URI:
        return None
    try:
        client = pymongo.MongoClient(MONGODB_URI, serverSelectionTimeoutMS=4000)
        client.admin.command('ping')
        return client.get_database("codetrack")
    except Exception as e:
        print(f"MongoDB Atlas connection warning: {e}")
        return None

def init_db():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()

    # Check and add individual users if they don't exist
    users_to_add = [
        ("test456@gmail.com", "admin456@", "super_admin", "All", "Main Administrator"),
        ("admin", "admin456@", "super_admin", "All", "Main Administrator"),
        
        # HODs
        ("nitithod@nehrucolleges.com", "itHod123$", "hod", "IT", "IT Department HOD"),
        ("nitcsehod@nehrucolleges.com", "cseHod123$", "hod", "CSE", "CSE Department HOD"),
        ("nitccehod@nehrucolleges.com", "cceHod123$", "hod", "CCE", "CCE Department HOD"),
        ("nitaimlhod@nehrucolleges.com", "aimlHod123$", "hod", "AI ML", "AI ML Department HOD"),
        ("nitcshod@nehrucolleges.com", "csHod123$", "hod", "CYBER", "Cyber Security HOD"),

        # NIT Placements & Staff
        ("nitplacements@nehrucolleges.com", "nitplacements23$", "super_admin", "All", "NIT Placement Officer"),
        ("nitarunpatrick@nehrucolleges.com", "nitArun123$", "super_admin", "All", "Arun Patrick (Placement)"),
        ("nitjasonp@nehrucolleges.com", "nitJason123$", "super_admin", "All", "Jason P (Placement)"),
        ("nititiv@nehrucolleges.com", "nitIT123$", "hod", "IT", "IT Placement Coordinator"),
        ("nicsetiv@nehrucolleges.com", "nitCSE123$", "hod", "CSE", "CSE Placement Coordinator"),
    ]

    for u_name, u_pass, u_role, u_dept, u_fullname in users_to_add:
        existing_user = session.query(User).filter(User.username == u_name).first()
        if not existing_user:
            user = User(username=u_name, password=u_pass, role=u_role, department=u_dept, name=u_fullname)
            session.add(user)
        else:
            existing_user.password = u_pass
            existing_user.role = u_role
            existing_user.department = u_dept
            existing_user.name = u_fullname
    
    session.commit()

    # Check if students exist
    if session.query(Student).count() == 0:
        seed_students = [
            {
                "name": "Arthi R", "register_number": "7376222CCE001", "department": "CCE", "year": 3, "section": "A",
                "leetcode": "arthi0611", "codechef": "arthi0607", "hackerrank": "arthiHR", "github": "arthi0607",
                "lc": {"solved": 245, "easy": 120, "med": 95, "hard": 30, "rating": 1780, "rank": "45,210", "active": 180, "contests": 22},
                "cc": {"solved": 190, "rating": 1645, "highest": 1710, "stars": "3★", "contests": 18},
                "hr": {"solved": 140, "badges": 12, "skills": "Python, Problem Solving, Java", "certifications": 3, "score": 1450},
                "gh": {"repos": 18, "contrib": 512, "commits": 380, "prs": 45, "issues": 12, "stars": 88, "followers": 34}
            },
            {
                "name": "Barath Kumar", "register_number": "7376231CCE002", "department": "CCE", "year": 2, "section": "B",
                "leetcode": "barath_k", "codechef": "barath_cc", "hackerrank": "barath_hr", "github": "barath-k",
                "lc": {"solved": 180, "easy": 100, "med": 65, "hard": 15, "rating": 1620, "rank": "89,140", "active": 120, "contests": 14},
                "cc": {"solved": 210, "rating": 1580, "highest": 1620, "stars": "3★", "contests": 15},
                "hr": {"solved": 95, "badges": 8, "skills": "C++, SQL", "certifications": 2, "score": 920},
                "gh": {"repos": 12, "contrib": 340, "commits": 240, "prs": 22, "issues": 8, "stars": 42, "followers": 19}
            },
            {
                "name": "Dinesh V", "register_number": "7376211CCE003", "department": "CCE", "year": 4, "section": "A",
                "leetcode": "dinesh_pro", "codechef": "dinesh_cc", "hackerrank": "dinesh_hr", "github": "dinesh-v",
                "lc": {"solved": 380, "easy": 160, "med": 170, "hard": 50, "rating": 1950, "rank": "12,400", "active": 240, "contests": 35},
                "cc": {"solved": 320, "rating": 1890, "highest": 1920, "stars": "4★", "contests": 28},
                "hr": {"solved": 210, "badges": 16, "skills": "Algorithms, Data Structures, Go", "certifications": 5, "score": 1980},
                "gh": {"repos": 28, "contrib": 780, "commits": 590, "prs": 85, "issues": 24, "stars": 160, "followers": 65}
            },
            {
                "name": "Elango S", "register_number": "7376241CCE004", "department": "CCE", "year": 1, "section": "A",
                "leetcode": "elango_fresh", "codechef": "elango_1", "hackerrank": "elango_hr", "github": "elango-s",
                "lc": {"solved": 85, "easy": 60, "med": 22, "hard": 3, "rating": 1420, "rank": "180,500", "active": 65, "contests": 6},
                "cc": {"solved": 90, "rating": 1350, "highest": 1380, "stars": "2★", "contests": 8},
                "hr": {"solved": 45, "badges": 5, "skills": "Python, C", "certifications": 1, "score": 480},
                "gh": {"repos": 6, "contrib": 120, "commits": 95, "prs": 8, "issues": 2, "stars": 12, "followers": 8}
            },
            {
                "name": "Kavitha M", "register_number": "7376222IT001", "department": "IT", "year": 3, "section": "A",
                "leetcode": "kavitha_m", "codechef": "kavitha_cc", "hackerrank": "kavitha_hr", "github": "kavitham",
                "lc": {"solved": 310, "easy": 140, "med": 130, "hard": 40, "rating": 1840, "rank": "28,100", "active": 210, "contests": 29},
                "cc": {"solved": 260, "rating": 1720, "highest": 1760, "stars": "3★", "contests": 22},
                "hr": {"solved": 175, "badges": 14, "skills": "JavaScript, React, Node.js", "certifications": 4, "score": 1620},
                "gh": {"repos": 24, "contrib": 640, "commits": 480, "prs": 68, "issues": 18, "stars": 125, "followers": 52}
            },
            {
                "name": "Gokulraj P", "register_number": "7376211IT002", "department": "IT", "year": 4, "section": "B",
                "leetcode": "gokul_dev", "codechef": "gokul_cc", "hackerrank": "gokul_hr", "github": "gokulraj-p",
                "lc": {"solved": 420, "easy": 180, "med": 185, "hard": 55, "rating": 2010, "rank": "8,900", "active": 290, "contests": 42},
                "cc": {"solved": 390, "rating": 1980, "highest": 2010, "stars": "4★", "contests": 34},
                "hr": {"solved": 250, "badges": 18, "skills": "Java, Spring Boot, Microservices", "certifications": 6, "score": 2200},
                "gh": {"repos": 32, "contrib": 920, "commits": 710, "prs": 110, "issues": 32, "stars": 210, "followers": 84}
            },
            {
                "name": "Harini T", "register_number": "7376231IT003", "department": "IT", "year": 2, "section": "A",
                "leetcode": "harini_t", "codechef": "harini_cc", "hackerrank": "harini_hr", "github": "harinit",
                "lc": {"solved": 145, "easy": 85, "med": 50, "hard": 10, "rating": 1540, "rank": "120,400", "active": 95, "contests": 10},
                "cc": {"solved": 140, "rating": 1490, "highest": 1520, "stars": "2★", "contests": 11},
                "hr": {"solved": 80, "badges": 7, "skills": "Python, SQL", "certifications": 2, "score": 780},
                "gh": {"repos": 10, "contrib": 210, "commits": 160, "prs": 14, "issues": 4, "stars": 24, "followers": 14}
            },
            {
                "name": "Manoj Kumar", "register_number": "7376222CSE001", "department": "CSE", "year": 3, "section": "B",
                "leetcode": "manoj_cse", "codechef": "manoj_cc", "hackerrank": "manoj_hr", "github": "manojkumar",
                "lc": {"solved": 290, "easy": 130, "med": 125, "hard": 35, "rating": 1810, "rank": "32,900", "active": 195, "contests": 25},
                "cc": {"solved": 280, "rating": 1750, "highest": 1780, "stars": "3★", "contests": 24},
                "hr": {"solved": 160, "badges": 13, "skills": "C++, Python, Machine Learning", "certifications": 3, "score": 1510},
                "gh": {"repos": 20, "contrib": 580, "commits": 440, "prs": 52, "issues": 15, "stars": 95, "followers": 41}
            },
            {
                "name": "Nivetha B", "register_number": "7376211CSE002", "department": "CSE", "year": 4, "section": "A",
                "leetcode": "nivi_code", "codechef": "nivi_cc", "hackerrank": "nivi_hr", "github": "nivethab",
                "lc": {"solved": 360, "easy": 150, "med": 160, "hard": 50, "rating": 1910, "rank": "16,800", "active": 260, "contests": 36},
                "cc": {"solved": 310, "rating": 1840, "highest": 1870, "stars": "4★", "contests": 29},
                "hr": {"solved": 220, "badges": 17, "skills": "System Design, Java, Docker", "certifications": 5, "score": 2050},
                "gh": {"repos": 26, "contrib": 840, "commits": 640, "prs": 92, "issues": 28, "stars": 175, "followers": 72}
            },
            {
                "name": "Praveen Raj", "register_number": "7376222ECE001", "department": "ECE", "year": 3, "section": "A",
                "leetcode": "praveen_ece", "codechef": "praveen_cc", "hackerrank": "praveen_hr", "github": "praveenraj",
                "lc": {"solved": 170, "easy": 95, "med": 65, "hard": 10, "rating": 1590, "rank": "102,000", "active": 115, "contests": 12},
                "cc": {"solved": 160, "rating": 1520, "highest": 1560, "stars": "3★", "contests": 14},
                "hr": {"solved": 110, "badges": 9, "skills": "Embedded C, Verilog, Python", "certifications": 2, "score": 980},
                "gh": {"repos": 14, "contrib": 290, "commits": 220, "prs": 18, "issues": 6, "stars": 35, "followers": 22}
            },
            {
                "name": "Surya K", "register_number": "7376231EEE001", "department": "EEE", "year": 2, "section": "A",
                "leetcode": "surya_eee", "codechef": "surya_cc", "hackerrank": "surya_hr", "github": "suryak",
                "lc": {"solved": 110, "easy": 75, "med": 32, "hard": 3, "rating": 1460, "rank": "155,000", "active": 80, "contests": 8},
                "cc": {"solved": 110, "rating": 1410, "highest": 1430, "stars": "2★", "contests": 9},
                "hr": {"solved": 60, "badges": 6, "skills": "MATLAB, C", "certifications": 1, "score": 540},
                "gh": {"repos": 8, "contrib": 150, "commits": 115, "prs": 10, "issues": 3, "stars": 16, "followers": 10}
            }
        ]

        today = datetime.utcnow().strftime("%Y-%m-%d")
        yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")

        for sdata in seed_students:
            student = Student(
                name=sdata["name"],
                register_number=sdata["register_number"],
                department=sdata["department"],
                year=sdata["year"],
                section=sdata["section"],
                leetcode_username=sdata["leetcode"],
                codechef_username=sdata["codechef"],
                hackerrank_username=sdata["hackerrank"],
                github_username=sdata["github"]
            )
            session.add(student)
            session.flush()

            # LeetCode Stats
            lc = sdata["lc"]
            lc_stats = {
                "status": "connected", "problems_solved": lc["solved"], "easy_solved": lc["easy"],
                "medium_solved": lc["med"], "hard_solved": lc["hard"], "rating": lc["rating"],
                "global_rank": lc["rank"], "active_days": lc["active"], "contests_count": lc["contests"]
            }
            lc_score = calculate_platform_normalized_score("leetcode", lc_stats)
            p_lc = PlatformStats(
                student_id=student.id, platform="leetcode", problems_solved=lc["solved"], easy_solved=lc["easy"],
                medium_solved=lc["med"], hard_solved=lc["hard"], rating=lc["rating"], global_rank=lc["rank"],
                active_days=lc["active"], contests_count=lc["contests"], normalized_score=lc_score, status="connected", last_updated=datetime.utcnow()
            )

            # CodeChef Stats
            cc = sdata["cc"]
            cc_stats = {
                "status": "connected", "rating": cc["rating"], "highest_rating": cc["highest"],
                "stars": cc["stars"], "problems_solved": cc["solved"], "contests_count": cc["contests"]
            }
            cc_score = calculate_platform_normalized_score("codechef", cc_stats)
            p_cc = PlatformStats(
                student_id=student.id, platform="codechef", problems_solved=cc["solved"], rating=cc["rating"],
                highest_rating=cc["highest"], stars=cc["stars"], contests_count=cc["contests"],
                normalized_score=cc_score, status="connected", last_updated=datetime.utcnow()
            )

            # HackerRank Stats
            hr = sdata["hr"]
            hr_stats = {
                "status": "connected", "problems_solved": hr["solved"], "badges_count": hr["badges"],
                "skills": hr["skills"], "certifications_count": hr["certifications"], "score": hr["score"]
            }
            hr_score = calculate_platform_normalized_score("hackerrank", hr_stats)
            p_hr = PlatformStats(
                student_id=student.id, platform="hackerrank", problems_solved=hr["solved"], badges_count=hr["badges"],
                skills=hr["skills"], certifications_count=hr["certifications"], score=hr["score"],
                normalized_score=hr_score, status="connected", last_updated=datetime.utcnow()
            )

            # GitHub Stats
            gh = sdata["gh"]
            gh_stats = {
                "status": "connected", "public_repos": gh["repos"], "contributions": gh["contrib"],
                "commits": gh["commits"], "pull_requests": gh["prs"], "issues": gh["issues"],
                "stars_received": gh["stars"], "followers": gh["followers"]
            }
            gh_score = calculate_platform_normalized_score("github", gh_stats)
            p_gh = PlatformStats(
                student_id=student.id, platform="github", public_repos=gh["repos"], contributions=gh["contrib"],
                commits=gh["commits"], pull_requests=gh["prs"], issues=gh["issues"], stars_received=gh["stars"],
                followers=gh["followers"], normalized_score=gh_score, status="connected", last_updated=datetime.utcnow()
            )

            session.add_all([p_lc, p_cc, p_hr, p_gh])

            # Attendance records
            session.add(Attendance(student_id=student.id, date=today, active_platform="leetcode", activity_count=4, status="Present"))
            session.add(Attendance(student_id=student.id, date=yesterday, active_platform="github", activity_count=8, status="Present"))

        session.commit()

    session.close()

    # Sync to MongoDB Atlas if connected
    mongo_db = get_mongo_db()
    if mongo_db is not None:
        try:
            print("Syncing data to MongoDB Atlas cluster...")
            mongo_db.students.delete_many({})
            db_session = SessionLocal()
            all_students = db_session.query(Student).all()
            st_records = []
            for st in all_students:
                d = st.to_dict()
                d["_id"] = st.id
                st_records.append(d)
            if st_records:
                mongo_db.students.insert_many(st_records)
            db_session.close()
            print("Successfully synced all student records to MongoDB Atlas!")
        except Exception as err:
            print(f"MongoDB Atlas sync error: {err}")

    print("Database initialized and seeded successfully.")

if __name__ == "__main__":
    init_db()
