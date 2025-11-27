from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Time,
    DECIMAL,
    ForeignKey,
    Integer,
    String,
    text,
)
from sqlalchemy.orm import relationship

from .db import Base


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), nullable=False, unique=True)
    name = Column(String(100), nullable=False)
    building = Column(String(100))
    capacity = Column(Integer)
    room_type = Column(String(50))
    features = Column(String(255))
    active = Column(Boolean, nullable=False, server_default=text("1"))
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    schedules = relationship("ScheduleEntry", back_populates="room")
    exams = relationship("Exam", back_populates="room")


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), nullable=False, unique=True)
    name = Column(String(100), nullable=False, unique=True)
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    users = relationship(
        "User",
        secondary="user_roles",
        back_populates="roles",
        overlaps="user_roles",
    )
    user_roles = relationship(
        "UserRole",
        back_populates="role",
        cascade="all, delete-orphan",
        overlaps="users",
    )


class OrgUnit(Base):
    __tablename__ = "org_units"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    unit_type = Column("type", String(50), default="DEPARTMENT")
    parent_id = Column(Integer, ForeignKey("org_units.id"), nullable=True)
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    parent = relationship("OrgUnit", remote_side=[id], backref="children")
    users = relationship("User", back_populates="org_unit")
    majors = relationship("Major", back_populates="org_unit")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True)
    org_unit_id = Column(Integer, ForeignKey("org_units.id"))
    active = Column(Boolean, nullable=False, server_default=text("1"))
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    org_unit = relationship("OrgUnit", back_populates="users")
    user_roles = relationship(
        "UserRole",
        back_populates="user",
        cascade="all, delete-orphan",
        overlaps="roles",
    )
    roles = relationship(
        "Role",
        secondary="user_roles",
        back_populates="users",
        overlaps="user_roles",
    )
    student = relationship("Student", back_populates="user", uselist=False)
    teacher = relationship("Teacher", back_populates="user", uselist=False)


class UserRole(Base):
    __tablename__ = "user_roles"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    role_id = Column(Integer, ForeignKey("roles.id"), primary_key=True)
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    user = relationship(
        "User",
        back_populates="user_roles",
        overlaps="roles,users",
    )
    role = relationship(
        "Role",
        back_populates="user_roles",
        overlaps="users,roles",
    )


class Major(Base):
    __tablename__ = "majors"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), nullable=False, unique=True)
    name = Column(String(100), nullable=False, unique=True)
    org_unit_id = Column(Integer, ForeignKey("org_units.id"))
    parent_id = Column(Integer, ForeignKey("majors.id"))
    level = Column(String(50))  # 本科/专科/方向等
    degree = Column(String(50))  # 学位类型或门类
    duration_years = Column(Integer)  # 学制（年）
    active = Column(Boolean, nullable=False, server_default=text("1"))
    description = Column(String(255))
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    org_unit = relationship("OrgUnit", back_populates="majors")
    parent = relationship("Major", remote_side=[id], backref="children")
    classes = relationship("Class", back_populates="major")
    teachers = relationship("Teacher", back_populates="major")
    courses = relationship("Course", back_populates="major")


class Term(Base):
    __tablename__ = "terms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    start_date = Column(Date)
    end_date = Column(Date)
    is_current = Column(Boolean, nullable=False, server_default=text("0"))
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    classes = relationship("Class", back_populates="term")
    courses = relationship("Course", back_populates="term")


class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), nullable=False, unique=True)
    name = Column(String(100), nullable=False)
    major_id = Column(Integer, ForeignKey("majors.id"))
    term_id = Column(Integer, ForeignKey("terms.id"))
    grade_year = Column(Integer)
    advisor_name = Column(String(100))
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    major = relationship("Major", back_populates="classes")
    term = relationship("Term", back_populates="classes")
    students = relationship("Student", back_populates="class_info")
    courses = relationship("Course", back_populates="class_info")


class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    major_id = Column(Integer, ForeignKey("majors.id"))
    title = Column(String(100))
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    user = relationship("User", back_populates="teacher")
    major = relationship("Major", back_populates="teachers")
    courses = relationship("Course", back_populates="teacher")


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    class_id = Column(Integer, ForeignKey("classes.id"))
    student_no = Column(String(50), nullable=False, unique=True)
    status = Column(String(30), default="active", server_default=text("'active'"))
    status_note = Column(String(255))
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    user = relationship("User", back_populates="student")
    class_info = relationship("Class", back_populates="students")
    status_logs = relationship(
        "StudentStatusLog", back_populates="student", cascade="all, delete-orphan"
    )
    grades = relationship("Grade", back_populates="student", cascade="all, delete-orphan")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), nullable=False, unique=True)
    name = Column(String(100), nullable=False)
    major_id = Column(Integer, ForeignKey("majors.id"))
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    term_id = Column(Integer, ForeignKey("terms.id"))
    class_id = Column(Integer, ForeignKey("classes.id"))
    course_type = Column(String(50), default="必修")
    active = Column(Boolean, nullable=False, server_default=text("1"))
    credit = Column(DECIMAL(3, 1), server_default=text("2.0"))
    weekly_hours = Column(Integer, server_default=text("4"))
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    major = relationship("Major", back_populates="courses")
    teacher = relationship("Teacher", back_populates="courses")
    term = relationship("Term", back_populates="courses")
    class_info = relationship("Class", back_populates="courses")
    schedules = relationship("ScheduleEntry", back_populates="course", cascade="all, delete-orphan")


class StudentStatusLog(Base):
    __tablename__ = "student_status_logs"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    status = Column(String(30), nullable=False)
    reason = Column(String(255))
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    student = relationship("Student", back_populates="status_logs")


class TrainingPlan(Base):
    __tablename__ = "training_plans"

    id = Column(Integer, primary_key=True, index=True)
    major_id = Column(Integer, ForeignKey("majors.id"), nullable=False)
    entry_year = Column(Integer, nullable=False)
    name = Column(String(150), nullable=False)
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    major = relationship("Major", backref="training_plans")
    items = relationship("TrainingPlanItem", back_populates="plan", cascade="all, delete-orphan")


class TrainingPlanItem(Base):
    __tablename__ = "training_plan_items"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("training_plans.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    term_no = Column(Integer, default=1)
    weekly_hours = Column(Integer, default=4)
    exam_type = Column(String(50), default="闭卷")
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    plan = relationship("TrainingPlan", back_populates="items")
    course = relationship("Course", backref="training_plan_items")


class ScheduleEntry(Base):
    __tablename__ = "schedule_entries"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"))
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    room_id = Column(Integer, ForeignKey("rooms.id"))
    weekday = Column(Integer, nullable=False)  # 1=Mon
    start_slot = Column(Integer, nullable=False)
    end_slot = Column(Integer, nullable=False)
    location = Column(String(100))
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    course = relationship("Course", back_populates="schedules")
    class_info = relationship("Class", backref="schedules")
    teacher = relationship("Teacher", backref="schedules")
    room = relationship("Room", back_populates="schedules")


class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    term_id = Column(Integer, ForeignKey("terms.id"), nullable=False)
    usual_score = Column(DECIMAL(5, 2))
    final_score = Column(DECIMAL(5, 2))
    total_score = Column(DECIMAL(5, 2))
    status = Column(String(30), default="draft", server_default=text("'draft'"))
    reviewer = Column(String(100))
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    student = relationship("Student", back_populates="grades")
    course = relationship("Course", backref="grades")
    term = relationship("Term", backref="grades")


class GradeAudit(Base):
    __tablename__ = "grade_audits"

    id = Column(Integer, primary_key=True, index=True)
    grade_id = Column(Integer, ForeignKey("grades.id"), nullable=False)
    action = Column(String(50), nullable=False)  # submit/review/publish/reject
    actor = Column(String(100))
    comment = Column(String(255))
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    grade = relationship("Grade", backref="audits")


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"))
    term_id = Column(Integer, ForeignKey("terms.id"))
    room_id = Column(Integer, ForeignKey("rooms.id"))
    exam_type = Column(String(50), default="期末")
    exam_date = Column(Date)
    start_time = Column(Time)
    duration_minutes = Column(Integer, default=90)
    location = Column(String(100))
    invigilators = Column(String(200))
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    course = relationship("Course", backref="exams")
    term = relationship("Term", backref="exams")
    class_info = relationship("Class", backref="exams")
    room = relationship("Room", back_populates="exams")
