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

    session.commit()
    session.close()

    # Restore students from MongoDB Atlas if local SQLite is empty
    mongo_db = get_mongo_db()
    if mongo_db is not None:
        try:
            db_session = SessionLocal()
            local_count = db_session.query(Student).count()
            mongo_docs = list(mongo_db.students.find({}))
            if local_count == 0 and mongo_docs:
                print(f"Restoring {len(mongo_docs)} student records from MongoDB Atlas to local SQLite...")
                for doc in mongo_docs:
                    raw_id = doc.get("id") if doc.get("id") is not None else doc.get("_id")
                    try:
                        st_id = int(raw_id)
                    except Exception:
                        continue
                    
                    st = db_session.query(Student).filter(Student.id == st_id).first()
                    if not st:
                        st = Student(
                            id=st_id,
                            name=doc.get("name", "Student"),
                            register_number=doc.get("register_number", f"REG_{st_id}"),
                            department=doc.get("department", "IT"),
                            year=doc.get("year", 4),
                            section=doc.get("section", "A"),
                            leetcode_username=doc.get("leetcode_username", ""),
                            codechef_username=doc.get("codechef_username", ""),
                            hackerrank_username=doc.get("hackerrank_username", ""),
                            github_username=doc.get("github_username", "")
                        )
                        db_session.add(st)
                        db_session.flush()
                    
                    stats_list = doc.get("platform_stats", [])
                    if stats_list:
                        for s_item in stats_list:
                            p_stat = PlatformStats(
                                student_id=st.id,
                                platform=s_item.get("platform", "leetcode"),
                                problems_solved=s_item.get("problems_solved", 0),
                                easy_solved=s_item.get("easy_solved", 0),
                                medium_solved=s_item.get("medium_solved", 0),
                                hard_solved=s_item.get("hard_solved", 0),
                                rating=s_item.get("rating", 0),
                                highest_rating=s_item.get("highest_rating", 0),
                                stars=s_item.get("stars", "1★"),
                                contests_count=s_item.get("contests_count", 0),
                                global_rank=str(s_item.get("global_rank", "N/A")),
                                active_days=s_item.get("active_days", 0),
                                badges_count=s_item.get("badges_count", 0),
                                skills=s_item.get("skills", "N/A"),
                                certifications_count=s_item.get("certifications_count", 0),
                                score=s_item.get("score", 0),
                                public_repos=s_item.get("public_repos", 0),
                                contributions=s_item.get("contributions", 0),
                                commits=s_item.get("commits", 0),
                                pull_requests=s_item.get("pull_requests", 0),
                                issues=s_item.get("issues", 0),
                                stars_received=s_item.get("stars_received", 0),
                                followers=s_item.get("followers", 0),
                                normalized_score=s_item.get("normalized_score", 0.0),
                                status=s_item.get("status", "connected")
                            )
                            db_session.add(p_stat)
                db_session.commit()
                print("Successfully restored all student records from MongoDB Atlas!")
            
            # Sync existing student data to MongoDB Atlas if connected (non-destructive)
            all_students = db_session.query(Student).all()
            for st in all_students:
                d = st.to_dict()
                d["_id"] = st.id
                mongo_db.students.replace_one({"_id": st.id}, d, upsert=True)
            db_session.close()
            print("Successfully verified student data in MongoDB Atlas!")
        except Exception as err:
            print(f"MongoDB Atlas sync warning: {err}")

    print("Database initialized and seeded successfully.")

if __name__ == "__main__":
    init_db()
