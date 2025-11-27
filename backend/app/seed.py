from datetime import date
from decimal import Decimal

from app import models
from app.db import Base, SessionLocal, engine


DEFAULT_PERMISSIONS = [
    {"code": "user:read", "name": "查看用户"},
    {"code": "user:write", "name": "管理用户"},
    {"code": "role:read", "name": "查看角色"},
    {"code": "role:write", "name": "管理角色"},
    {"code": "permission:read", "name": "查看权限"},
    {"code": "permission:assign", "name": "分配权限"},
    {"code": "exam:write", "name": "管理考试"},
    {"code": "schedule:write", "name": "管理排课"},
    {"code": "grade:review", "name": "审核成绩"},
]


def ensure_permissions_seed(db: SessionLocal):
    # 插入权限表
    for perm in DEFAULT_PERMISSIONS:
        exists = db.get(models.Permission, perm["code"])
        if not exists:
            db.add(models.Permission(**perm))
    db.commit()

    # 赋予 ADMIN 全部权限
    admin_role = db.query(models.Role).filter(models.Role.code == "ADMIN").first()
    if admin_role:
        existing_codes = {p.code for p in admin_role.permissions}
        for perm in db.query(models.Permission).all():
            if perm.code not in existing_codes:
                admin_role.permissions.append(perm)
    db.commit()


def init_db_with_sample_data():
    """Create tables and seed a handful of demo records for P0/P1 MVP."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        ensure_permissions_seed(db)
        if db.query(models.User).count() > 0:
            return

        # Roles
        admin_role = models.Role(code="ADMIN", name="教务管理员")
        teacher_role = models.Role(code="TEACHER", name="教师")
        student_role = models.Role(code="STUDENT", name="学员")
        db.add_all([admin_role, teacher_role, student_role])
        db.flush()
        ensure_permissions_seed(db)

        # Org/major/class
        academy = models.OrgUnit(name="警官学院", unit_type="ACADEMY")
        battalion = models.OrgUnit(name="第一大队", unit_type="BATTALION", parent=academy)
        db.add_all([academy, battalion])

        term1 = models.Term(
            name="2024-2025-1",
            start_date=date(2024, 9, 1),
            end_date=date(2025, 1, 15),
            is_current=True,
        )
        term2 = models.Term(
            name="2024-2025-2",
            start_date=date(2025, 3, 1),
            end_date=date(2025, 7, 10),
            is_current=False,
        )
        db.add_all([term1, term2])

        major = models.Major(
            code="LAW",
            name="刑法学",
            org_unit=battalion,
            level="本科",
            degree="法学",
            duration_years=4,
            active=True,
            description="公安院校法学专业培养计划",
        )

        class_a = models.Class(
            code="2024A",
            name="2024刑法一队",
            major=major,
            term=term1,
            grade_year=2024,
            advisor_name="张教官",
        )
        class_b = models.Class(
            code="2024B",
            name="2024刑法二队",
            major=major,
            term=term1,
            grade_year=2024,
            advisor_name="李教官",
        )
        db.add_all([major, class_a, class_b])
        db.flush()

        # Users
        admin_user = models.User(
            username="admin",
            password_hash="admin123",
            full_name="教务管理员",
            email="admin@academy.local",
            roles=[admin_role],
            org_unit=academy,
        )
        teacher_user = models.User(
            username="teacher1",
            password_hash="teacher123",
            full_name="李教官",
            email="teacher1@academy.local",
            roles=[teacher_role],
            org_unit=battalion,
        )
        student_user = models.User(
            username="student1",
            password_hash="student123",
            full_name="王新生",
            email="student1@academy.local",
            roles=[student_role],
            org_unit=battalion,
        )
        student_user2 = models.User(
            username="student2",
            password_hash="student123",
            full_name="赵同学",
            email="student2@academy.local",
            roles=[student_role],
            org_unit=battalion,
        )
        db.add_all([admin_user, teacher_user, student_user, student_user2])
        db.flush()

        teacher = models.Teacher(user=teacher_user, major=major, title="讲师")
        student = models.Student(user=student_user, class_info=class_a, student_no="2024001")
        student2 = models.Student(
            user=student_user2, class_info=class_b, student_no="2024002", status="leave"
        )
        db.add_all([teacher, student, student2])

        # Courses as teaching classes
        course1 = models.Course(
            code="LAW101",
            name="刑法基础",
            major=major,
            teacher=teacher,
            term=term1,
            class_info=class_a,
            credit=Decimal("3.0"),
            weekly_hours=4,
            course_type="必修",
            active=True,
        )
        course2 = models.Course(
            code="POL102",
            name="警务技能",
            major=major,
            teacher=teacher,
            term=term1,
            class_info=class_b,
            credit=Decimal("2.0"),
            weekly_hours=2,
            course_type="实践",
            active=True,
        )
        db.add_all([course1, course2])
        db.flush()

        # Training plan
        plan = models.TrainingPlan(name="刑法学2024培养方案", entry_year=2024, major=major)
        plan.items = [
            models.TrainingPlanItem(course=course1, term_no=1, weekly_hours=4, exam_type="闭卷"),
            models.TrainingPlanItem(course=course2, term_no=1, weekly_hours=2, exam_type="实操"),
        ]
        db.add(plan)

        # Schedule entries
        db.add_all(
            [
                models.ScheduleEntry(
                    course=course1,
                    class_info=class_a,
                    teacher=teacher,
                    weekday=1,
                    start_slot=1,
                    end_slot=2,
                    location="综合楼201",
                ),
                models.ScheduleEntry(
                    course=course1,
                    class_info=class_a,
                    teacher=teacher,
                    weekday=3,
                    start_slot=3,
                    end_slot=4,
                    location="模拟法庭",
                ),
                models.ScheduleEntry(
                    course=course2,
                    class_info=class_b,
                    teacher=teacher,
                    weekday=2,
                    start_slot=1,
                    end_slot=2,
                    location="操场A区",
                ),
            ]
        )

        # Grades
        grade1 = models.Grade(
            student=student,
            course=course1,
            term=term1,
            usual_score=85,
            final_score=88,
            total_score=87,
            status="published",
            reviewer="教务管理员",
        )
        grade2 = models.Grade(
            student=student2,
            course=course2,
            term=term1,
            usual_score=75,
            final_score=80,
            total_score=78,
            status="draft",
        )
        db.add_all([grade1, grade2])

        # Exams
        exam1 = models.Exam(
            course=course1,
            class_info=class_a,
            term=term1,
            exam_type="期末",
            exam_date=date(2025, 1, 5),
            start_time=None,
            duration_minutes=120,
            location="综合楼201",
            invigilators="张老师",
        )
        exam2 = models.Exam(
            course=course2,
            class_info=class_b,
            term=term1,
            exam_type="期中",
            exam_date=date(2024, 11, 30),
            start_time=None,
            duration_minutes=90,
            location="操场B",
            invigilators="李老师",
        )
        db.add_all([exam1, exam2])

        db.commit()
    finally:
        db.close()
