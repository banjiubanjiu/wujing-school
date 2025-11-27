from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class RoleOut(ORMModel):
    code: str
    name: str


class OrgUnitOut(ORMModel):
    id: int
    name: str
    unit_type: Optional[str] = None
    parent_id: Optional[int] = None


class OrgUnitCreate(BaseModel):
    name: str
    unit_type: Optional[str] = None
    parent_id: Optional[int] = None


class OrgUnitUpdate(BaseModel):
    name: Optional[str] = None
    unit_type: Optional[str] = None
    parent_id: Optional[int] = None


class TermOut(ORMModel):
    id: int
    name: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool


class MajorOut(ORMModel):
    id: int
    code: str
    name: str
    org_unit_id: Optional[int] = None


class ClassOut(ORMModel):
    id: int
    code: str
    name: str
    major_id: Optional[int] = None
    term_id: Optional[int] = None
    grade_year: Optional[int] = None
    advisor_name: Optional[str] = None


class ClassCreate(BaseModel):
    code: str
    name: str
    major_id: int
    term_id: int
    grade_year: Optional[int] = None
    advisor_name: Optional[str] = None


class ClassUpdate(BaseModel):
    name: Optional[str] = None
    major_id: Optional[int] = None
    term_id: Optional[int] = None
    grade_year: Optional[int] = None
    advisor_name: Optional[str] = None


class UserOut(ORMModel):
    id: int
    username: str
    full_name: str
    email: Optional[str] = None
    org_unit_id: Optional[int] = None
    active: bool


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
    roles: List[str]


class MeResponse(ORMModel):
    user: UserOut
    roles: List[str]


class StudentStatusLogOut(ORMModel):
    status: str
    reason: Optional[str] = None
    created_at: Optional[str] = None


class StudentOut(ORMModel):
    id: int
    student_no: str
    status: Optional[str] = None
    status_note: Optional[str] = None
    user: UserOut
    class_info: Optional[ClassOut] = None
    status_logs: List[StudentStatusLogOut] = Field(default_factory=list)

class StudentCreate(BaseModel):
    username: str
    password: str
    full_name: str
    student_no: str
    class_id: int
    email: Optional[str] = None


class StudentUpdate(BaseModel):
    class_id: Optional[int] = None
    status: Optional[str] = None
    status_note: Optional[str] = None


class StudentImport(BaseModel):
    students: List[StudentCreate]


class CourseOut(ORMModel):
    id: int
    code: str
    name: str
    major_id: Optional[int] = None
    teacher_id: Optional[int] = None
    term_id: Optional[int] = None
    class_id: Optional[int] = None
    course_type: Optional[str] = None
    active: Optional[bool] = None
    credit: Optional[float] = None
    weekly_hours: Optional[int] = None


class CourseCreate(BaseModel):
    code: str
    name: str
    major_id: int
    teacher_id: Optional[int] = None
    term_id: int
    class_id: Optional[int] = None
    course_type: Optional[str] = None
    credit: Optional[float] = 2.0
    weekly_hours: Optional[int] = 4
    active: Optional[bool] = True


class CourseUpdate(BaseModel):
    name: Optional[str] = None
    teacher_id: Optional[int] = None
    term_id: Optional[int] = None
    class_id: Optional[int] = None
    course_type: Optional[str] = None
    credit: Optional[float] = None
    weekly_hours: Optional[int] = None
    active: Optional[bool] = None

class TrainingPlanItemOut(ORMModel):
    id: int
    course: CourseOut
    term_no: int
    weekly_hours: int
    exam_type: Optional[str] = None


class TrainingPlanOut(ORMModel):
    id: int
    name: str
    entry_year: int
    major_id: int
    items: List[TrainingPlanItemOut] = Field(default_factory=list)


class TrainingPlanCreate(BaseModel):
    name: str
    entry_year: int
    major_id: int
    item_course_ids: List[int] = Field(default_factory=list)


class ScheduleEntryOut(ORMModel):
    id: int
    course_id: int
    class_id: Optional[int] = None
    teacher_id: Optional[int] = None
    weekday: int
    start_slot: int
    end_slot: int
    location: Optional[str] = None
    course: Optional[CourseOut] = None
    class_info: Optional[ClassOut] = None


class ScheduleCreate(BaseModel):
    course_id: int
    class_id: Optional[int] = None
    teacher_id: Optional[int] = None
    weekday: int
    start_slot: int
    end_slot: int
    location: Optional[str] = None


class GradeOut(ORMModel):
    id: int
    student_id: int
    course_id: int
    term_id: int
    usual_score: Optional[float] = None
    final_score: Optional[float] = None
    total_score: Optional[float] = None
    status: str
    reviewer: Optional[str] = None
    course: Optional[CourseOut] = None
    term: Optional[TermOut] = None


class GradeCreate(BaseModel):
    student_id: int
    course_id: int
    term_id: int
    usual_score: float
    final_score: float
    status: Optional[str] = "draft"


class GradePublishRequest(BaseModel):
    course_id: int
    reviewer: Optional[str] = None


class GradeSubmitRequest(BaseModel):
    grade_id: int
    comment: Optional[str] = None


class GradeReviewRequest(BaseModel):
    grade_id: int
    approve: bool = True
    reviewer: Optional[str] = None
    comment: Optional[str] = None


class GradeAuditOut(ORMModel):
    action: str
    actor: Optional[str] = None
    comment: Optional[str] = None
    created_at: Optional[str] = None


class MenuItem(BaseModel):
    key: str
    label: str
    path: str
    icon: Optional[str] = None


class MenuResponse(BaseModel):
    roles: List[str]
    menus: List[MenuItem]
