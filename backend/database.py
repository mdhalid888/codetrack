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
            mongo_docs = list(mongo_db.students.find({})) if mongo_db is not None else []
            
            if local_count == 0:
                if mongo_docs:
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

                # If SQLite is still 0 (MongoDB offline or empty), seed 29 roster students
                if db_session.query(Student).count() == 0:
                    print("Seeding 29 classroom roster students into SQLite...")
                    ROSTER_SEED = [
                        (1, 'Bharathi.D', '721023205010', 'IT', 4, 'A', 'Bharathidurai', 'Bharathidurai', 'Bharathidurai', 'Bharathidurai'),
                        (2, 'Kandasamy A', '721023205028', 'IT', 4, 'A', 'Kandasamy122', 'Kandasamy122', 'Kandasamy122', 'Kandasamy122'),
                        (3, 'Dhanusri P', '721023205015', 'IT', 4, 'A', 'dhanusripalani', 'dhanusripalani', 'dhanusripalani', 'dhanusripalani'),
                        (4, 'U.sreya', '721023205055', 'IT', 4, 'A', 'Sreyasuraj', 'Sreyasuraj', 'Sreyasuraj', 'Sreyasuraj'),
                        (5, 'KALYANI J', '721023205027', 'IT', 4, 'A', 'kalyani_j12', 'kalyani_j12', 'kalyani_j12', 'kalyani_j12'),
                        (6, 'NAVYA N', '7210232050', 'IT', 4, 'A', 'Navyanagarajan', 'Navyanagarajan', 'Navyanagarajan', 'Navyanagarajan'),
                        (7, 'DAKSATHA M', '721023205011', 'IT', 4, 'A', 'Daksatha25', 'Daksatha25', 'Daksatha25', 'Daksatha25'),
                        (8, 'Sriram. A', '721023205056', 'IT', 4, 'A', 'Sriramalagudurai', 'Sriramalagudurai', 'Sriramalagudurai', 'Sriramalagudurai'),
                        (9, 'Arthi M', '721023205005', 'IT', 4, 'A', 'Arthi0611', 'Arthi0611', 'Arthi0611', 'Arthi0611'),
                        (10, 'Om Prakash.A', '721823205045', 'IT', 4, 'A', 'OmPrakashanbumani', 'OmPrakashanbumani', 'OmPrakashanbumani', 'OmPrakashanbumani'),
                        (11, 'Jeyasri J', '721023205024', 'IT', 4, 'A', 'Jeyasri_jesudas', 'Jeyasri_jesudas', 'Jeyasri_jesudas', 'Jeyasri_jesudas'),
                        (12, 'AJMAL HASAN A', '721023205002', 'IT', 4, 'A', 'Ajmal_Hasan786', 'Ajmal_Hasan786', 'Ajmal_Hasan786', 'Ajmal_Hasan786'),
                        (13, 'Kavindra G', '721023205031', 'IT', 4, 'A', 'kavindraganesh', 'kavindraganesh', 'kavindraganesh', 'kavindraganesh'),
                        (14, 'Elavarasan s', '721023205018', 'IT', 4, 'A', 'elavarasan2004', 'elavarasan2004', 'elavarasan2004', 'elavarasan2004'),
                        (15, 'Akash R', '721023205004', 'IT', 4, 'A', 'Akash_nvl', 'Akash_nvl', 'Akash_nvl', 'Akash_nvl'),
                        (16, 'Suruthi S', '721023205058', 'IT', 4, 'A', 'SuruthiSivakumar', 'SuruthiSivakumar', 'SuruthiSivakumar', 'SuruthiSivakumar'),
                        (17, 'Ashiha CK', '721023205007', 'IT', 4, 'A', 'Ashiha24', 'Ashiha24', 'Ashiha24', 'Ashiha24'),
                        (18, 'Siva.B', '721023205054', 'IT', 4, 'A', 'iam_siv_312', 'iam_siv_312', 'iam_siv_312', 'iam_siv_312'),
                        (19, 'MAAHIR M', '721023205035', 'IT', 4, 'A', 'maahir_16', 'maahir_16', 'maahir_16', 'maahir_16'),
                        (20, 'Naveen Kumar T', '721023205043', 'IT', 4, 'A', 'naveenthiruppathi', 'naveenthiruppathi', 'naveenthiruppathi', 'naveenthiruppathi'),
                        (21, 'Ragul Raj R', '721023205048', 'IT', 4, 'A', 'Ragul_raj_18', 'Ragul_raj_18', 'Ragul_raj_18', 'Ragul_raj_18'),
                        (22, 'KISHORE.R', '721023205033', 'IT', 4, 'A', 'Kishoreramadass', 'Kishoreramadass', 'Kishoreramadass', 'Kishoreramadass'),
                        (23, 'Deepika M', '721023205013', 'IT', 4, 'A', 'Deepika_11', 'Deepika_11', 'Deepika_11', 'Deepika_11'),
                        (24, 'Dhatchanamoorthi C', '721023205016', 'IT', 4, 'A', 'Dhatchana 13', 'Dhatchana 13', 'Dhatchana 13', 'Dhatchana 13'),
                        (25, 'SHAI PRATHAP R', '721023205052', 'IT', 4, 'A', 'shai_pratt', 'shai_pratt', 'shai_pratt', 'shai_pratt'),
                        (26, 'Kirthik G', '721023205032', 'IT', 4, 'A', 'Kirthik03', 'Kirthik03', 'Kirthik03', 'Kirthik03'),
                        (27, 'RAJESH VK', '721023205049', 'IT', 4, 'A', 'rajesh-vk', 'rajesh-vk', 'rajesh-vk', 'rajesh-vk'),
                        (28, 'VENKATESWARAN A', '721023235062', 'IT', 4, 'A', 'VENKATESWARAN_26', 'VENKATESWARAN_26', 'VENKATESWARAN_26', 'VENKATESWARAN_26'),
                        (29, 'Mohamed Halid', '721023205039', 'IT', 4, 'A', 'mohamedhalid', 'mohamedhalid', 'mohamedhalid', 'mohamedhalid')
                    ]
                    for item in ROSTER_SEED:
                        st = Student(
                            id=item[0], name=item[1], register_number=item[2],
                            department=item[3], year=item[4], section=item[5],
                            leetcode_username=item[6], codechef_username=item[7],
                            hackerrank_username=item[8], github_username=item[9]
                        )
                        db_session.add(st)
                    db_session.commit()
            
            # Sync existing student data to MongoDB Atlas if connected (non-destructive)
            if mongo_db is not None:
                try:
                    mongo_db.students.create_index([("department", 1), ("year", 1)])
                    mongo_db.students.create_index([("register_number", 1)])
                    mongo_db.students.create_index([("leetcode_username", 1)])
                except Exception as idx_err:
                    print(f"MongoDB index creation notice: {idx_err}")

                all_students = db_session.query(Student).all()
                for st in all_students:
                    d = st.to_dict()
                    d["_id"] = st.id
                    mongo_db.students.replace_one({"_id": st.id}, d, upsert=True)
            db_session.close()
            print("Successfully verified student data and ensured compound indexes in MongoDB Atlas!")
        except Exception as err:
            print(f"MongoDB Atlas sync warning: {err}")

    print("Database initialized and seeded successfully.")

if __name__ == "__main__":
    init_db()
