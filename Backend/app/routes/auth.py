from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserResponse, Token
from app.services.auth_service import AuthService
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new customer or seller account"
)
def register(
    user_in: UserRegister,
    db: Session = Depends(get_db)
):
    """
    Register a new user in the marketplace.
    - Role can be **CUSTOMER** or **SELLER** (defaults to CUSTOMER).
    - Email must be unique.
    - Phone number, if provided, must be unique.
    - Passwords are securely hashed with bcrypt.
    """
    user = AuthService.register_user(db=db, user_in=user_in)
    return user


@router.post(
    "/login",
    response_model=Token,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user and obtain JWT access token"
)
def login(
    user_in: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Authenticate with email and password.
    Returns a signed JWT bearer token valid for subsequent authorized requests.
    """
    user = AuthService.authenticate_user(db=db, user_in=user_in)
    return AuthService.create_token_response(user)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current authenticated user profile"
)
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Returns profile information for the authenticated user from their Bearer token.
    """
    return current_user
