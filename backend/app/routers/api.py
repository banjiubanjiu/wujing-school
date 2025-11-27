from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, selectinload

from app import models, schemas
from app.db import get_db
from app.routers.auth import get_current_user, get_role_codes, require_roles

router = APIRouter(prefix="/api", tags=["api"])

ROLE_MENUS = {
    "STUDENT": [
        {"key": "home", "label": "总览", "path": "/student/home", "icon": "dashboard"},
        {"key": "schedule", "label": "我的课表", "path": "/student/schedule"},
        {"key": "grades", "label": "我的成绩", "path": "/student/grades"},
        {"key": "training", "label": "培养方案", "path": "/student/training"},
    ],
    "TEACHER": [
        {"key": "home", "label": "课堂工作台", "path": "/teacher/home", "icon": "calendar"},
        {"key": "teaching-schedule", "label": "授课安排", "path": "/teacher/schedule"},
        {"key": "roster", "label": "花名册", "path": "/teacher/classes"},
        {"key": "grade-entry", "label": "成绩录入", "path": "/teacher/grades"},
    ],
    "ADMIN": [
        {"key": "home", "label": "教务驾驶舱", "path": "/admin/home", "icon": "layout"},
        {"key": "students", "label": "学籍", "path": "/admin/students"},
        {"key": "courses", "label": "课程与教学班", "path": "/admin/courses"},
        {"key": "plans", "label": "培养方案", "path": "/admin/plans"},
        {"key": "schedule", "label": "排课与课表", "path": "/admin/schedule"},
        {"key": "grades", "label": "成绩审核", "path": "/admin/grades"},
    ],
}


@router.get("/menus", response_model=schemas.MenuResponse)
def read_menus(current_user: models.User = Depends(get_current_user)):
    role_codes = get_role_codes(current_user)
    menus: list[schemas.MenuItem] = []
    for code in role_codes:
        for item in ROLE_MENUS.get(code, []):
            menus.append(schemas.MenuItem(**item))
    return schemas.MenuResponse(roles=list(role_codes), menus=menus)


@router.get("/home")
def read_home(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    role_codes = get_role_codes(current_user)
    counters = {
        "students": db.query(models.Student).count(),
        "teachers": db.query(models.Teacher).count(),
        "courses": db.query(models.Course).count(),
        "classes": db.query(models.Class).count(),
    }
    payload = {"roles": list(role_codes), "counters": counters}

    schedule_preview: list[models.ScheduleEntry] = []
    if "STUDENT" in role_codes and current_user.student:
        schedule_preview = get_schedule_for_student(db, current_user.student.class_id)[:4]
    elif "TEACHER" in role_codes and current_user.teacher:
        schedule_preview = get_schedule_for_teacher(db, current_user.teacher.id)[:4]
    payload["schedule_preview"] = [
        schemas.ScheduleEntryOut.model_validate(item) for item in schedule_preview
    ]

    if "STUDENT" in role_codes and current_user.student:
        grades = (
            db.query(models.Grade)
            .options(selectinload(models.Grade.course), selectinload(models.Grade.term))
            .filter(models.Grade.student_id == current_user.student.id)
            .order_by(models.Grade.created_at.desc())
            .limit(5)
            .all()
        )
        payload["latest_grades"] = [schemas.GradeOut.model_validate(g) for g in grades]
    return payload


@router.get("/students", response_model=List[schemas.StudentOut])
def list_students(
    q: Optional[str] = Query(None, description="Search by student_no/name"),
    class_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["ADMIN", "TEACHER"])),
):
    query = (
        db.query(models.Student)
        .options(
            selectinload(models.Student.user),
            selectinload(models.Student.class_info),
            selectinload(models.Student.status_logs),
        )
        .join(models.User)
    )
    if q:
        like_pattern = f"%{q}%"
        query = query.filter(
            or_(
                models.Student.student_no.like(like_pattern),
                models.User.full_name.like(like_pattern),
            )
        )
    if class_id:
        query = query.filter(models.Student.class_id == class_id)
    return query.all()


@router.post("/students", response_model=schemas.StudentOut, status_code=status.HTTP_201_CREATED)
def create_student(
    payload: schemas.StudentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["ADMIN"])),
):
    if db.query(models.User).filter(models.User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    if db.query(models.Student).filter(models.Student.student_no == payload.student_no).first():
        raise HTTPException(status_code=400, detail="Student number already exists")
    class_info = db.get(models.Class, payload.class_id)
    if not class_info:
        raise HTTPException(status_code=404, detail="Class not found")
    student_role = db.query(models.Role).filter(models.Role.code == "STUDENT").first()
    if not student_role:
        student_role = models.Role(code="STUDENT", name="Student")
        db.add(student_role)
        db.flush()
    user = models.User(
        username=payload.username,
        password_hash=payload.password,
        full_name=payload.full_name,
        email=payload.email,
        roles=[student_role],
        org_unit=class_info.major.org_unit if class_info.major else None,
    )
    student = models.Student(user=user, class_info=class_info, student_no=payload.student_no)
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.post("/students/import")
def import_students(
    payload: schemas.StudentImport,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["ADMIN"])),
):
    created = 0
    skipped = 0
    for item in payload.students:
        if db.query(models.User).filter(models.User.username == item.username).first():
            skipped += 1
            continue
        class_info = db.get(models.Class, item.class_id)
        if not class_info:
            skipped += 1
            continue
        student_role = db.query(models.Role).filter(models.Role.code == "STUDENT").first()
        if not student_role:
            student_role = models.Role(code="STUDENT", name="Student")
            db.add(student_role)
            db.flush()
        user = models.User(
            username=item.username,
            password_hash=item.password,
            full_name=item.full_name,
            email=item.email,
            roles=[student_role],
            org_unit=class_info.major.org_unit if class_info.major else None,
        )
        student = models.Student(user=user, class_info=class_info, student_no=item.student_no)
        db.add(student)
        created += 1
    db.commit()
    return {"created": created, "skipped": skipped}


@router.get("/students/export", response_model=List[schemas.StudentOut])
def export_students(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["ADMIN"])),
):
    return (
        db.query(models.Student)
        .options(
            selectinload(models.Student.user),
            selectinload(models.Student.class_info),
            selectinload(models.Student.status_logs),
        )
        .all()
    )


@router.put("/students/{student_id}", response_model=schemas.StudentOut)
def update_student(
    student_id: int,
    payload: schemas.StudentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["ADMIN", "TEACHER"])),
):
    student = (
        db.query(models.Student)
        .options(
            selectinload(models.Student.user),
            selectinload(models.Student.class_info),
            selectinload(models.Student.status_logs),
        )
        .filter(models.Student.id == student_id)
        .first()
    )
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if payload.class_id:
        class_obj = db.get(models.Class, payload.class_id)
        if not class_obj:
            raise HTTPException(status_code=404, detail="Class not found")
        student.class_info = class_obj
    if payload.status:
        student.status = payload.status
        log = models.StudentStatusLog(
            student=student, status=payload.status, reason=payload.status_note
        )
        db.add(log)
    if payload.status_note is not None:
        student.status_note = payload.status_note
    db.commit()
    db.refresh(student)
    return student


@router.get("/classes", response_model=List[schemas.ClassOut])
def list_classes(
    term_id: Optional[int] = None,
    major_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Class)
    if term_id:
        query = query.filter(models.Class.term_id == term_id)
    if major_id:
        query = query.filter(models.Class.major_id == major_id)
    return query.all()


@router.post("/classes", response_model=schemas.ClassOut)
def create_class(
    payload: schemas.ClassCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["ADMIN"])),
):
    if db.query(models.Class).filter(models.Class.code == payload.code).first():
        raise HTTPException(status_code=400, detail="Class code already exists")
    class_obj = models.Class(
        code=payload.code,
        name=payload.name,
        major_id=payload.major_id,
        term_id=payload.term_id,
        grade_year=payload.grade_year,
        advisor_name=payload.advisor_name,
    )
    db.add(class_obj)
    db.commit()
    db.refresh(class_obj)
    return class_obj


@router.put("/classes/{class_id}", response_model=schemas.ClassOut)
def update_class(
    class_id: int,
    payload: schemas.ClassUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["ADMIN"])),
):
    class_obj = db.get(models.Class, class_id)
    if not class_obj:
        raise HTTPException(status_code=404, detail="Class not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(class_obj, field, value)
    db.commit()
    db.refresh(class_obj)
    return class_obj


@router.get("/majors", response_model=List[schemas.MajorOut])
def list_majors(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.Major).all()


@router.get("/orgs", response_model=List[schemas.OrgUnitOut])
def list_orgs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.OrgUnit).all()


@router.post("/orgs", response_model=schemas.OrgUnitOut)
def create_org(
    payload: schemas.OrgUnitCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["ADMIN"])),
):
    org = models.OrgUnit(name=payload.name, unit_type=payload.unit_type, parent_id=payload.parent_id)
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


@router.put("/orgs/{org_id}", response_model=schemas.OrgUnitOut)
def update_org(
    org_id: int,
    payload: schemas.OrgUnitUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["ADMIN"])),
):
    org = db.get(models.OrgUnit, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Org not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(org, field, value)
    db.commit()
    db.refresh(org)
    return org


@router.get("/terms", response_model=List[schemas.TermOut])
def list_terms(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.Term).order_by(models.Term.start_date).all()


@router.get("/courses", response_model=List[schemas.CourseOut])
def list_courses(
    term_id: Optional[int] = None,
    mine: Optional[bool] = False,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Course)
    if term_id:
        query = query.filter(models.Course.term_id == term_id)
    role_codes = get_role_codes(current_user)
    if mine and "TEACHER" in role_codes:
        teacher = db.query(models.Teacher).filter(models.Teacher.user_id == current_user.id).first()
        if teacher:
            query = query.filter(models.Course.teacher_id == teacher.id)
    return query.all()


@router.post("/courses", response_model=schemas.CourseOut)
def create_course(
    payload: schemas.CourseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["ADMIN"])),
):
    if db.query(models.Course).filter(models.Course.code == payload.code).first():
        raise HTTPException(status_code=400, detail="Course code already exists")
    course = models.Course(**payload.dict())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.put("/courses/{course_id}", response_model=schemas.CourseOut)
def update_course(
    course_id: int,
    payload: schemas.CourseUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["ADMIN"])),
):
    course = db.get(models.Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(course, field, value)
    db.commit()
    db.refresh(course)
    return course


@router.get("/training-plans", response_model=List[schemas.TrainingPlanOut])
def list_training_plans(
    major_id: Optional[int] = None,
    entry_year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.TrainingPlan).options(
        selectinload(models.TrainingPlan.items).selectinload(models.TrainingPlanItem.course)
    )
    if major_id:
        query = query.filter(models.TrainingPlan.major_id == major_id)
    if entry_year:
        query = query.filter(models.TrainingPlan.entry_year == entry_year)
    return query.all()


@router.post("/training-plans", response_model=schemas.TrainingPlanOut)
def create_training_plan(
    payload: schemas.TrainingPlanCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["ADMIN"])),
):
    plan = models.TrainingPlan(
        name=payload.name,
        entry_year=payload.entry_year,
        major_id=payload.major_id,
    )
    plan.items = [
        models.TrainingPlanItem(
            course_id=cid,
            term_no=1,
            weekly_hours=4,
            exam_type="Closed",
        )
        for cid in payload.item_course_ids
    ]
    db.add(plan)
    db.commit()
    db.refresh(plan)
    db.refresh(plan, attribute_names=["items"])
    return plan


@router.post("/training-plans/{plan_id}/clone", response_model=schemas.TrainingPlanOut)
def clone_training_plan(
    plan_id: int,
    entry_year: int,
    name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["ADMIN"])),
):
    plan = (
        db.query(models.TrainingPlan)
        .options(selectinload(models.TrainingPlan.items))
        .filter(models.TrainingPlan.id == plan_id)
        .first()
    )
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    new_plan = models.TrainingPlan(
        name=name or f"{plan.name}-copy",
        entry_year=entry_year,
        major_id=plan.major_id,
    )
    new_plan.items = [
        models.TrainingPlanItem(
            course_id=item.course_id,
            term_no=item.term_no,
            weekly_hours=item.weekly_hours,
            exam_type=item.exam_type,
        )
        for item in plan.items
    ]
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    db.refresh(new_plan, attribute_names=["items"])
    return new_plan


def get_schedule_for_student(db: Session, class_id: int):
    return (
        db.query(models.ScheduleEntry)
        .options(
            selectinload(models.ScheduleEntry.course),
            selectinload(models.ScheduleEntry.class_info),
        )
        .filter(models.ScheduleEntry.class_id == class_id)
        .order_by(models.ScheduleEntry.weekday, models.ScheduleEntry.start_slot)
        .all()
    )


def get_schedule_for_teacher(db: Session, teacher_id: int):
    return (
        db.query(models.ScheduleEntry)
        .options(
            selectinload(models.ScheduleEntry.course),
            selectinload(models.ScheduleEntry.class_info),
        )
        .filter(models.ScheduleEntry.teacher_id == teacher_id)
        .order_by(models.ScheduleEntry.weekday, models.ScheduleEntry.start_slot)
        .all()
    )


@router.get("/schedule/my", response_model=List[schemas.ScheduleEntryOut])
def my_schedule(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    role_codes = get_role_codes(current_user)
    if "STUDENT" in role_codes and current_user.student:
        return get_schedule_for_student(db, current_user.student.class_id)
    if "TEACHER" in role_codes and current_user.teacher:
        return get_schedule_for_teacher(db, current_user.teacher.id)
    raise HTTPException(status_code=403, detail="No schedule available")


@router.get("/schedule", response_model=List[schemas.ScheduleEntryOut])
def schedule_admin(
    class_id: Optional[int] = None,
    teacher_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["ADMIN"])),
):
    query = (
        db.query(models.ScheduleEntry)
        .options(
            selectinload(models.ScheduleEntry.course),
            selectinload(models.ScheduleEntry.class_info),
        )
        .order_by(models.ScheduleEntry.weekday, models.ScheduleEntry.start_slot)
    )
    if class_id:
        query = query.filter(models.ScheduleEntry.class_id == class_id)
    if teacher_id:
        query = query.filter(models.ScheduleEntry.teacher_id == teacher_id)
    return query.all()


def find_schedule_conflicts(
    db: Session,
    weekday: int,
    start_slot: int,
    end_slot: int,
    class_id: Optional[int],
    teacher_id: Optional[int],
    location: Optional[str],
):
    query = db.query(models.ScheduleEntry).filter(models.ScheduleEntry.weekday == weekday)
    query = query.filter(models.ScheduleEntry.start_slot <= end_slot).filter(
        models.ScheduleEntry.end_slot >= start_slot
    )
    conflict_filters = []
    if class_id:
        conflict_filters.append(models.ScheduleEntry.class_id == class_id)
    if teacher_id:
        conflict_filters.append(models.ScheduleEntry.teacher_id == teacher_id)
    if location:
        conflict_filters.append(models.ScheduleEntry.location == location)
    if conflict_filters:
        query = query.filter(or_(*conflict_filters))
    return query.all()


@router.post("/schedule", response_model=schemas.ScheduleEntryOut)
def create_schedule_entry(
    payload: schemas.ScheduleCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["ADMIN"])),
):
    conflicts = find_schedule_conflicts(
        db,
        weekday=payload.weekday,
        start_slot=payload.start_slot,
        end_slot=payload.end_slot,
        class_id=payload.class_id,
        teacher_id=payload.teacher_id,
        location=payload.location,
    )
    if conflicts:
        detail = [
            {
                "id": c.id,
                "course": c.course_id,
                "class": c.class_id,
                "teacher": c.teacher_id,
                "weekday": c.weekday,
                "slot": f"{c.start_slot}-{c.end_slot}",
                "location": c.location,
            }
            for c in conflicts
        ]
        raise HTTPException(status_code=400, detail={"message": "Schedule conflict", "conflicts": detail})
    entry = models.ScheduleEntry(**payload.dict())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/grades/my", response_model=List[schemas.GradeOut])
def my_grades(
    term_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["STUDENT"])),
):
    student = current_user.student
    if not student:
        raise HTTPException(status_code=404, detail="Student info not found")
    query = (
        db.query(models.Grade)
        .options(selectinload(models.Grade.course), selectinload(models.Grade.term))
        .filter(models.Grade.student_id == student.id)
    )
    if term_id:
        query = query.filter(models.Grade.term_id == term_id)
    return query.all()


@router.post("/grades", response_model=schemas.GradeOut)
def upsert_grade(
    payload: schemas.GradeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["TEACHER"])),
):
    student = db.get(models.Student, payload.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    course = db.get(models.Course, payload.course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    grade = (
        db.query(models.Grade)
        .filter(
            models.Grade.student_id == payload.student_id,
            models.Grade.course_id == payload.course_id,
        )
        .first()
    )
    if not grade:
        grade = models.Grade(
            student_id=payload.student_id, course_id=payload.course_id, term_id=payload.term_id
        )
        db.add(grade)
    grade.usual_score = payload.usual_score
    grade.final_score = payload.final_score
    grade.total_score = round(payload.usual_score * 0.4 + payload.final_score * 0.6, 2)
    grade.status = payload.status or "draft"
    db.commit()
    db.refresh(grade)
    return grade


@router.post("/grades/submit")
def submit_grade(
    payload: schemas.GradeSubmitRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["TEACHER"])),
):
    grade = db.get(models.Grade, payload.grade_id)
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")
    if grade.status not in {"draft", "rejected"}:
        raise HTTPException(status_code=400, detail="Status not allowed to submit")
    grade.status = "submitted"
    audit = models.GradeAudit(
        grade=grade, action="submit", actor=current_user.full_name, comment=payload.comment
    )
    db.add(audit)
    db.commit()
    return {"status": grade.status}


@router.post("/grades/review")
def review_grade(
    payload: schemas.GradeReviewRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["ADMIN"])),
):
    grade = db.get(models.Grade, payload.grade_id)
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")
    if grade.status not in {"submitted", "draft"}:
        raise HTTPException(status_code=400, detail="Status not allowed to review")
    if payload.approve:
        grade.status = "published"
        grade.reviewer = payload.reviewer or current_user.full_name
        action = "publish"
    else:
        grade.status = "rejected"
        action = "reject"
    audit = models.GradeAudit(
        grade=grade,
        action=action,
        actor=current_user.full_name,
        comment=payload.comment,
    )
    db.add(audit)
    db.commit()
    return {"status": grade.status}


@router.post("/grades/publish")
def publish_grades(
    payload: schemas.GradePublishRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["ADMIN"])),
):
    grades = db.query(models.Grade).filter(models.Grade.course_id == payload.course_id).all()
    for g in grades:
        g.status = "published"
        g.reviewer = payload.reviewer or current_user.full_name
    db.commit()
    return {"published": len(grades)}
