from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app import models, schemas
from app.db import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


def create_token(username: str) -> str:
    return f"token:{username}"


def parse_token(raw_token: str) -> str:
    if not raw_token.startswith("token:"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return raw_token.split(":", 1)[1]


def get_current_user(
    db: Session = Depends(get_db),
    authorization: str = Header(None, alias="Authorization"),
):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token"
        )
    token = authorization.split(" ", 1)[1].strip()
    username = parse_token(token)
    user = (
        db.query(models.User)
        .options(
            selectinload(models.User.roles),
            selectinload(models.User.student).selectinload(models.Student.class_info),
            selectinload(models.User.teacher),
            selectinload(models.User.roles).selectinload(models.Role.permissions),
        )
        .filter(models.User.username == username)
        .first()
    )
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def get_role_codes(user: models.User) -> set:
    return {role.code for role in user.roles}


def get_permission_codes(user: models.User) -> set:
    perms = set()
    for role in user.roles:
        for perm in role.permissions:
            perms.add(perm.code)
    return perms


def require_roles(allowed_roles: list[str]):
    def wrapper(current_user: models.User = Depends(get_current_user)):
        role_codes = get_role_codes(current_user)
        if allowed_roles and role_codes.isdisjoint(set(allowed_roles)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role not allowed. Need one of {allowed_roles}",
            )
        return current_user

    return wrapper


def require_permissions(allowed_permissions: list[str]):
    def wrapper(current_user: models.User = Depends(get_current_user)):
        role_codes = get_role_codes(current_user)
        if "ADMIN" in role_codes:
            return current_user
        user_perms = get_permission_codes(current_user)
        if allowed_permissions and user_perms.isdisjoint(set(allowed_permissions)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission not allowed. Need one of {allowed_permissions}",
            )
        return current_user

    return wrapper


@router.post("/login", response_model=schemas.LoginResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = (
        db.query(models.User)
        .options(
            selectinload(models.User.roles),
            selectinload(models.User.student).selectinload(models.Student.class_info),
            selectinload(models.User.teacher),
        )
        .filter(
            models.User.username == payload.username,
            models.User.password_hash == payload.password,
        )
        .first()
    )
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    roles = [role.code for role in user.roles]
    token = create_token(user.username)
    return schemas.LoginResponse(access_token=token, user=user, roles=roles)


@router.get("/me", response_model=schemas.MeResponse)
def read_me(current_user: models.User = Depends(get_current_user)):
    roles = [role.code for role in current_user.roles]
    return schemas.MeResponse(user=current_user, roles=roles)
