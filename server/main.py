from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, Integer, String, Text,Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional,Dict
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware
import logging
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import asyncio

import google.generativeai as genai

# Database Configuration
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://aaron:denurenu7@localhost/symptoheal"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# JWT Configuration
SECRET_KEY = "YOUR_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# FastAPI App
app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins="*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Database Models
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    hashed_password = Column(String(100))
    is_admin = Column(Boolean, default=False)

class TreatmentDetails(Base):
    __tablename__ = "treatment_details"

    id = Column(Integer, primary_key=True, index=True)
    condition = Column(String(100), index=True)
    side_effects = Column(Text)
    allopathic_treatment = Column(Text)
    naturopathy_treatment = Column(Text)

class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True)
    side_effects = Column(Text)
class Disease(Base):
    __tablename__ = "diseases"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True)
    medications = Column(Text)
# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic Models
class UserCreate(BaseModel):
    username: str
    password: str
    is_admin: bool = False

class UserInDB(BaseModel):
    id: int
    username: str
    is_admin: bool

    class Config:
        orm_mode = True

class TreatmentDetailsCreate(BaseModel):
    condition: str
    side_effects: str
    allopathic_treatment: str
    naturopathy_treatment: str

class TreatmentDetailsInDB(BaseModel):
    id: int
    condition: str
    side_effects: str
    allopathic_treatment: str
    naturopathy_treatment: str

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str
    is_admin: bool

# Helper Functions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(db, username)
    if user is None:
        raise credentials_exception
    return user

def get_current_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

# Routes
@app.post("/users/", response_model=UserInDB)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    db_user = User(username=user.username, hashed_password=hashed_password, is_admin=user.is_admin)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "is_admin": user.is_admin}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer","is_admin":user.is_admin}

# Admin Routes
@app.post("/admin/treatments/", response_model=TreatmentDetailsInDB)
def create_treatment(treatment: TreatmentDetailsCreate, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    db_treatment = TreatmentDetails(**treatment.dict())
    db.add(db_treatment)
    db.commit()
    db.refresh(db_treatment)
    return db_treatment

@app.put("/admin/treatments/{treatment_id}", response_model=TreatmentDetailsInDB)
def update_treatment(treatment_id: int, treatment: TreatmentDetailsCreate, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    db_treatment = db.query(TreatmentDetails).filter(TreatmentDetails.id == treatment_id).first()
    if db_treatment is None:
        raise HTTPException(status_code=404, detail="Treatment details not found")
    for key, value in treatment.dict().items():
        setattr(db_treatment, key, value)
    db.commit()
    db.refresh(db_treatment)
    return db_treatment

@app.delete("/admin/treatments/{treatment_id}", response_model=TreatmentDetailsInDB)
def delete_treatment(treatment_id: int, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    db_treatment = db.query(TreatmentDetails).filter(TreatmentDetails.id == treatment_id).first()
    if db_treatment is None:
        raise HTTPException(status_code=404, detail="Treatment details not found")
    db.delete(db_treatment)
    db.commit()
    return db_treatment

# User Routes
@app.get("/treatments/", response_model=List[TreatmentDetailsInDB])
def read_treatments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    treatments = db.query(TreatmentDetails).offset(skip).limit(limit).all()
    return treatments

@app.get("/treatments/{treatment_id}", response_model=TreatmentDetailsInDB)
def read_treatment(treatment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_treatment = db.query(TreatmentDetails).filter(TreatmentDetails.id == treatment_id).first()
    if db_treatment is None:
        raise HTTPException(status_code=404, detail="Treatment details not found")
    return db_treatment



class MedicationRequest(BaseModel):
    medications: List[str]
# Replace with your actual Google API key
genai.configure(api_key="AIzaSyDnW8xa_kosKErLeqfO5i7DZpJpdnsSh7I")

# Choose a model
model = genai.GenerativeModel('gemini-pro')

# In-memory storage for disease-medication mappings
disease_medication_map: Dict[str, List[str]] = {}

class DiseaseRequest(BaseModel):
    diseases: List[str]

@app.post("/get_medications")
async def get_medications(request: DiseaseRequest):
    for disease in request.diseases:
        corrected_disease = await correct_spelling(disease)
        if corrected_disease not in disease_medication_map:
            try:
                response = model.generate_content(
                    f"List 5 common allopathic medications by their generic names, prescribed for  {corrected_disease}. Exclude brand names outside parentheses just give me one genric name for each.  Format the response as a numbered list."
                )
                medications = parse_medications(response.text)
                disease_medication_map[corrected_disease] = medications
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error querying Gemini API: {str(e)}")

    return disease_medication_map

async def correct_spelling(disease: str) -> str:
    try:
        response = model.generate_content(
            f"Correct the spelling of this disease name if it's misspelled: '{disease}'. If it's correct, just return the original name. Only return the corrected or original name, nothing else."
        )
        return response.text.strip()
    except Exception as e:
        # If there's an error, return the original spelling
        return disease

def parse_medications(response: str) -> List[str]:
    lines = response.split('\n')
    medications = [line.split('.', 1)[-1].strip() for line in lines if line.strip() and line[0].isdigit()]
    return medications[:5]  # Ensure we only return up to 5 medications

@app.get("/get_all_medications")
async def get_all_medications():
    return disease_medication_map

medication_data: Dict[str, Dict[str, Dict[str, List[str]]]] = {}

class MedicationRequest(BaseModel):
    medications: List[str]
@app.post("/get_side_effects")
async def get_side_effects(request: MedicationRequest):
    side_effects_data: Dict[str, List[str]] = {}

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        page.set_default_timeout(600000)  # 60 seconds

        await page.goto("https://www.drugs.com/search.php")
        for medication in request.medications:
            try:
                # Navigate to the Drugs.com search page
                
                # Enter the medication name and search
                await page.fill('input[name="searchterm"]', medication)
                await page.click('button[type="submit"]')

                # Wait for the search results
                await page.wait_for_selector('.ddc-search-results')

                # Click on the first search result
                await page.click('.ddc-search-results a:first-child')

                # Wait for the side effects section
                await page.wait_for_selector('h2#side-effects')

                # Get the page content
                content = await page.content()

                # Use BeautifulSoup to parse the content
                soup = BeautifulSoup(content, 'html.parser')

                # Find the side effects section
                side_effects_section = soup.find('h2', id='side-effects').find_next('ul')

                # Extract side effects
                side_effects = [li.text.strip() for li in side_effects_section.find_all('li')]

                # Store the side effects
                side_effects_data[medication] = side_effects

            except Exception as e:
                side_effects_data[medication] = [f"Error: Unable to retrieve side effects for {medication}"]

        await browser.close()

    return side_effects_data

@app.get("/medications")
def get_medications():
    db = SessionLocal()
    medications = db.query(Medication).all()
    db.close()
    return [{"name": med.name, "side_effects": med.side_effects.split(", ")} for med in medications]


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
@app.post("/process_diseases")
async def process_diseases(request: DiseaseRequest):
    result = {}
    db = SessionLocal()
    diseases_to_query = []
    all_medications = set()

    try:
        # Step 1: Check database and prepare list of diseases to query
        for disease in request.diseases:
            corrected_disease = await correct_spelling(disease)
            result[corrected_disease] = {"medications": []}

            db_disease = db.query(Disease).filter(Disease.name == corrected_disease).first()
            if db_disease and db_disease.medications:
                medications = db_disease.medications.split(",")
                all_medications.update(medications)
                logger.info(f"Found existing medications for {corrected_disease}: {medications}")
            else:
                diseases_to_query.append(corrected_disease)
                logger.info(f"Need to query for medications for {corrected_disease}")

        # Step 2: Query Gemini API for all new diseases at once
        if diseases_to_query:
            diseases_str = ", ".join(diseases_to_query)
            try:
                logger.info(f"Querying Gemini API for: {diseases_str}")
                response = model.generate_content(
                    f"For each of the following diseases: {diseases_str}, list 5 common allopathic medications by their generic names . Exclude brand names and the ones outside paranthesis and give me just one single word with no spaces and paranthesis. Format the response as a numbered list for each disease, with the disease name as a header."
                )
                logger.info(f"Gemini API response: {response.text}")
                new_medications = parse_multiple_diseases_medications(response.text, diseases_to_query)
                logger.info(f"Parsed medications: {new_medications}")
                
                for disease, meds in new_medications.items():
                    disease_medication_map[disease] = meds
                    all_medications.update(meds)
                    
                    # Store or update disease and its medications in the database
                    db_disease = db.query(Disease).filter(Disease.name == disease).first()
                    if db_disease:
                        db_disease.medications = ",".join(meds)
                    else:
                        db_disease = Disease(name=disease, medications=",".join(meds))
                        db.add(db_disease)
                    logger.info(f"Updated database for disease {disease} with medications: {meds}")
            except Exception as e:
                logger.error(f"Error querying Gemini API: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error querying Gemini API: {str(e)}")

        # Step 3: Process medications and get side effects
        medications_to_scrape = list(all_medications)
        logger.info(f"Medications to scrape: {medications_to_scrape}")

        if medications_to_scrape:
            side_effects_data = await get_side_effects(MedicationRequest(medications=medications_to_scrape))
            logger.info(f"Scraped side effects: {side_effects_data}")
            
            for medication, side_effects in side_effects_data.items():
                db_medication = db.query(Medication).filter(Medication.name == medication).first()
                if db_medication:
                    db_medication.side_effects = ", ".join(side_effects)
                else:
                    db_medication = Medication(name=medication, side_effects=", ".join(side_effects))
                    db.add(db_medication)
                logger.info(f"Updated database for medication {medication} with side effects: {side_effects}")

        # Step 4: Build the final result
        for disease in request.diseases:
            corrected_disease = await correct_spelling(disease)
            db_disease = db.query(Disease).filter(Disease.name == corrected_disease).first()
            
            if db_disease and db_disease.medications:
                medications = db_disease.medications.split(",")
            else:
                medications = disease_medication_map.get(corrected_disease, [])

            logger.info(f"Building result for disease {corrected_disease} with medications: {medications}")
            
            for medication in medications:
                db_medication = db.query(Medication).filter(Medication.name == medication).first()
                if db_medication:
                    result[corrected_disease]["medications"].append({
                        "name": medication,
                        "side_effects": db_medication.side_effects.split(", ") if db_medication.side_effects else []
                    })
        db.commit()
        logger.info(f"Final result: {result}")
    except Exception as e:
        db.rollback()
        logger.error(f"An error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    finally:
        db.close()

    return result

def parse_multiple_diseases_medications(response: str, diseases: List[str]) -> Dict[str, List[str]]:
    result = {}
    current_disease = None
    for line in response.split('\n'):
        line = line.strip()
        if any(disease.lower() in line.lower() for disease in diseases):
            current_disease = next(disease for disease in diseases if disease.lower() in line.lower())
            result[current_disease] = []
        elif current_disease and line and line[0].isdigit():
            medication = line.split('.', 1)[-1].strip()
            result[current_disease].append(medication)
    logger.info(f"Parsed medications: {result}")
    return result
@app.get("/get_all_disease_medication_data")
def get_all_disease_medication_data():
    db = SessionLocal()
    try:
        # Get all medications from the database
        medications = db.query(Medication).all()

        # Create a dictionary to store the result
        result = {}

        # Iterate through all medications in the database
        for medication in medications:
            # Find the disease for this medication
            for disease, meds in disease_medication_map.items():
                if medication.name in meds:
                    if disease not in result:
                        result[disease] = {"medications": []}
                    
                    # Add medication and its side effects to the result
                    result[disease]["medications"].append({
                        "name": medication.name,
                        "side_effects": medication.side_effects.split(", ") if medication.side_effects else []
                    })

        return result
    finally:
        db.close()
@app.get("/all_diseases")
def get_all_diseases():
    db = SessionLocal()
    try:
        diseases = db.query(Disease).all()
        result = []
        for disease in diseases:
            disease_data = {
                "name": disease.name,
                "medications": []
            }
            medications = disease.medications.split(",") if disease.medications else []
            for med_name in medications:
                medication = db.query(Medication).filter(Medication.name == med_name).first()
                if medication:
                    disease_data["medications"].append({
                        "name": medication.name,
                        "side_effects": medication.side_effects.split(", ") if medication.side_effects else []
                    })
                else:
                    disease_data["medications"].append({
                        "name": med_name,
                        "side_effects": []
                    })
            result.append(disease_data)
        return result
    finally:
        db.close()

@app.get("/find_by_medication/{medication}")
def find_by_medication(medication: str):
    db = SessionLocal()
    try:
        med = db.query(Medication).filter(Medication.name == medication).first()
        if not med:
            raise HTTPException(status_code=404, detail="Medication not found")
        
        diseases = db.query(Disease).filter(Disease.medications.like(f"%{medication}%")).all()
        
        result = {
            "medication": med.name,
            "side_effects": med.side_effects.split(", ") if med.side_effects else [],
            "used_for_diseases": [disease.name for disease in diseases]
        }
        return result
    finally:
        db.close()

@app.get("/find_by_disease/{disease}")
def find_by_disease(disease: str):
    db = SessionLocal()
    try:
        dis = db.query(Disease).filter(Disease.name == disease).first()
        if not dis:
            raise HTTPException(status_code=404, detail="Disease not found")
        
        result = {
            "disease": dis.name,
            "medications": []
        }
        
        medications = dis.medications.split(",") if dis.medications else []
        for med_name in medications:
            medication = db.query(Medication).filter(Medication.name == med_name).first()
            if medication:
                result["medications"].append({
                    "name": medication.name,
                    "side_effects": medication.side_effects.split(", ") if medication.side_effects else []
                })
            else:
                result["medications"].append({
                    "name": med_name,
                    "side_effects": []
                })
        
        return result
    finally:
        db.close()