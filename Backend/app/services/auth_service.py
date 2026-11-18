from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.cart import Cart
from app.schemas.user import UserRegister, UserLogin, Token, UserResponse
from app.core.security import hash_password, verify_password, create_access_token


class AuthService:
    @staticmethod
    def register_user(db: Session, user_in: UserRegister) -> User:
        """Register a new customer or seller."""
        # 1. Check for duplicate email (case-insensitive)
        normalized_email = user_in.email.strip().lower()
        existing_email = db.query(User).filter(User.email.ilike(normalized_email)).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email address already exists"
            )

        # 2. Check for duplicate phone if provided
        if user_in.phone:
            existing_phone = db.query(User).filter(User.phone == user_in.phone.strip()).first()
            if existing_phone:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="A user with this phone number already exists"
                )

        # 3. Hash password securely
        hashed_pwd = hash_password(user_in.password)

        # 4. Create user
        new_user = User(
            full_name=user_in.full_name.strip(),
            email=normalized_email,
            phone=user_in.phone.strip() if user_in.phone else None,
            password_hash=hashed_pwd,
            role=user_in.role.value,
            is_active=True
        )
        db.add(new_user)
        db.flush()

        # 5. Automatically initialize an empty cart for customers
        if new_user.role == "CUSTOMER":
            new_cart = Cart(customer_user_id=new_user.id)
            db.add(new_cart)

        db.commit()
        db.refresh(new_user)
        return new_user

    @staticmethod
    def authenticate_user(db: Session, user_in: UserLogin) -> User:
        """Authenticate user with email and password."""
        normalized_email = user_in.email.strip().lower()
        user = db.query(User).filter(User.email.ilike(normalized_email)).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not verify_password(user_in.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated"
            )

        return user

    @staticmethod
    def create_token_response(user: User) -> Token:
        """Generate JWT access token for the authenticated user."""
        access_token = create_access_token(
            subject=str(user.id),
            extra_claims={"role": user.role, "email": user.email}
        )
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )
