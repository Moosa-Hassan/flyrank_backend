import os
from fastapi import FastAPI, HTTPException, status, Header, Depends
from dotenv import load_dotenv
from supabase import create_client, Client
from pydantic import BaseModel, EmailStr

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="Auth API", version="1.0")

@app.get("/")
def root():
    print("Server running and connected to Supabase")
    return {"status": "Server running and connected to Supabase"}

class AuthCredentials(BaseModel):
    email: EmailStr
    password: str
    
@app.post("/auth/signup", status_code=status.HTTP_201_CREATED)
def signup(credentials: AuthCredentials):
    try:
        response = supabase.auth.sign_up({
            "email": credentials.email,
            "password": credentials.password
        })
        return {"message": "User registered successfully", "user": response.user}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@app.post("/auth/login", status_code=status.HTTP_200_OK)
def login(credentials: AuthCredentials):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        session = response.session
        return {
            "access_token": session.access_token,
            "refresh_token": session.refresh_token,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid login credentials"
        )
        
@app.get("/public/info", status_code=status.HTTP_200_OK)
def public_info():
    return {"message": "Welcome stranger! This info is public."}


def verify_access_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token required"
        )
    
    token = authorization.split(" ")[1]
    
    try:
        response = supabase.auth.get_user(token)
        return {"token": token, "user": response.user}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

@app.get("/protected/profile", status_code=status.HTTP_200_OK)
def protected_profile(auth_data: dict = Depends(verify_access_token)):
    user = auth_data["user"]
    return {
        "message": "Token verified via middleware",
        "user": {
            "id": user.id,
            "email": user.email,
            "created_at": user.created_at
        }
    }

@app.get("/protected/dashboard", status_code=status.HTTP_200_OK)
def protected_dashboard(auth_data: dict = Depends(verify_access_token)):
    user = auth_data["user"]
    return {
        "message": f"Welcome to your secure dashboard, {user.email}!"
    }

@app.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(auth_data: dict = Depends(verify_access_token)):
    token = auth_data["token"]
    try:
        supabase.auth.sign_out(token)
        return None
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error signing out"
        )