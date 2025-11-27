from datetime import date, time
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class RoleOut(ORMModel):
    id: int
    code: str
    name: str


class PermissionOut(ORMModel):
    code: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None


class RoleWithPermissions(RoleOut):
    permissions: List[PermissionOut] = Field(default_factory=list)


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
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: bool


class TermCreate(BaseModel):
    name: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: bool = False


class TermUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = None


class MajorOut(ORMModel):
    id: int
    code: str
    name: str
    org_unit_id: Optional[int] = None
    parent_id: Optional[int] = None
    level: Optional[str] = None
    degree: Optional[str] = None
    duration_years: Optional[int] = None
    active: bool = True
    description: Optional[str] = None


class MajorCreate(BaseModel):
    code: str
    name: str
    org_unit_id: Optional[int] = None
    parent_id: Optional[int] = None
    level: Optional[str] = None
    degree: Optional[str] = None
    duration_years: Optional[int] = None
    active: bool = True
    description: Optional[str] = None


class MajorUpdate(BaseModel):
    name: Optional[str] = None
    org_unit_id: Optional[int] = None
    parent_id: Optional[int] = None
    level: Optional[str] = None
    degree: Optional[str] = None
    duration_years: Optional[int] = None
    active: Optional[bool] = None
    description: Optional[str] = None


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


class UserDetailOut(UserOut):
    roles: List[RoleOut] = Field(default_factory=list)


class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    email: Optional[str] = None
    org_unit_id: Optional[int] = None
    role_codes: List[str] = Field(default_factory=list)


class UserRoleUpdate(BaseModel):
    role_codes: List[str] = Field(default_factory=list)


class PasswordResetRequest(BaseModel):
    password: str


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


class TeacherOut(ORMModel):
    id: int
    user: UserOut
    major_id: Optional[int] = None
    title: Optional[str] = None

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


class RolePermissionUpdate(BaseModel):
    permissions: List[str] = Field(default_factory=list)


class ScheduleEntryOut(ORMModel):
    id: int
    course_id: int
    class_id: Optional[int] = None
    teacher_id: Optional[int] = None
    room_id: Optional[int] = None
    weekday: int
    start_slot: int
    end_slot: int
    location: Optional[str] = None
    course: Optional[CourseOut] = None
    class_info: Optional[ClassOut] = None
    room: Optional["RoomOut"] = None


class ScheduleCreate(BaseModel):
    course_id: int
    class_id: Optional[int] = None
    teacher_id: Optional[int] = None
    room_id: Optional[int] = None
    weekday: int
    start_slot: int
    end_slot: int
    location: Optional[str] = None


class ScheduleUpdate(BaseModel):
    course_id: Optional[int] = None
    class_id: Optional[int] = None
    teacher_id: Optional[int] = None
    room_id: Optional[int] = None
    weekday: Optional[int] = None
    start_slot: Optional[int] = None
    end_slot: Optional[int] = None
    location: Optional[str] = None


class RoomOut(ORMModel):
    id: int
    code: str
    name: str
    building: Optional[str] = None
    capacity: Optional[int] = None
    room_type: Optional[str] = None
    features: Optional[str] = None
    active: bool


class RoomCreate(BaseModel):
    code: str
    name: str
    building: Optional[str] = None
    capacity: Optional[int] = None
    room_type: Optional[str] = None
    features: Optional[str] = None
    active: bool = True


class RoomUpdate(BaseModel):
    name: Optional[str] = None
    building: Optional[str] = None
    capacity: Optional[int] = None
    room_type: Optional[str] = None
    features: Optional[str] = None
    active: Optional[bool] = None


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
    student: Optional["StudentOut"] = None


class GradeImportItem(BaseModel):
    student_id: int
    course_id: int
    term_id: int
    usual_score: float
    final_score: float
    status: Optional[str] = "draft"


class GradeImport(BaseModel):
    grades: List[GradeImportItem]


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


class ExamOut(ORMModel):
    id: int
    course_id: int
    class_id: Optional[int] = None
    term_id: Optional[int] = None
    exam_type: Optional[str] = None
    exam_date: Optional[date | str] = None
    start_time: Optional[str | time] = None
    duration_minutes: Optional[int] = None
    location: Optional[str] = None
    invigilators: Optional[str] = None
    course: Optional[CourseOut] = None
    class_info: Optional[ClassOut] = None
    term: Optional[TermOut] = None


class ExamCreate(BaseModel):
    course_id: int
    class_id: Optional[int] = None
    term_id: Optional[int] = None
    exam_type: Optional[str] = "期末"
    exam_date: Optional[str] = None
    start_time: Optional[str] = None
    duration_minutes: Optional[int] = 90
    location: Optional[str] = None
    invigilators: Optional[str] = None
