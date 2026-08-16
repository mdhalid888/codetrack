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

    # Sync existing student data to MongoDB Atlas if connected (non-destructive)
    mongo_db = get_mongo_db()
    if mongo_db is not None:
        try:
            print("Verifying MongoDB Atlas sync...")
            db_session = SessionLocal()
            all_students = db_session.query(Student).all()
            for st in all_students:
                d = st.to_dict()
                d["_id"] = st.id
                mongo_db.students.replace_one({"_id": st.id}, d, upsert=True)
            db_session.close()
            print("Successfully verified student data in MongoDB Atlas!")
        except Exception as err:
            print(f"MongoDB Atlas sync warning: {err}")
        except Exception as err:
            print(f"MongoDB Atlas sync error: {err}")

    print("Database initialized and seeded successfully.")

if __name__ == "__main__":
    init_db()
