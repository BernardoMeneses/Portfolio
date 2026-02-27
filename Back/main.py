from fastapi import FastAPI, HTTPException, Depends, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
import json
from datetime import datetime
import secrets
import urllib.parse

# Carregar variáveis de ambiente
load_dotenv()

# Configurações do GitHub OAuth
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
GITHUB_REDIRECT_URI = os.getenv("GITHUB_REDIRECT_URI", "https://portfolio-backend-shy-butterfly-71.fly.dev/api/auth/github/callback")

# Configurações do Google OAuth
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "https://portfolio-backend-shy-butterfly-71.fly.dev/api/auth/google/callback")

# Configurações da base de dados
DATABASE_PATH = os.getenv("DATABASE_PATH", "portfolio.db")

# Caminho customizável para o arquivo projects.json (em deploys pode ser diferente)
PROJECTS_PATH_ENV = os.getenv("PROJECTS_PATH")

# Origens permitidas (CORS). Pode ser uma lista separada por vírgulas ou "*" para permitir todas.
ALLOWED_ORIGINS_ENV = os.getenv("ALLOWED_ORIGINS")
# Senha admin para edição via UI (defina como secret no Fly)
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

# Store tokens for admin sessions (in-memory, ephemeral)
admin_tokens = {}

def init_database():
    # No database initialization required when DB removed
    print("⚠️  Database disabled - running without persistent storage.")

def get_projects_from_db():
    """Load projects from `Back/data/projects.json` (no DB).

    This function reads the static JSON bundled with the backend and
    returns it. If the file is missing or invalid, return empty list.
    """
    try:
        here = os.path.dirname(os.path.abspath(__file__))
        projects_path = os.path.normpath(os.path.join(here, 'data', 'projects.json'))
        with open(projects_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
            if isinstance(data, dict):
                for k in ('projects', 'data', 'items'):
                    if k in data and isinstance(data[k], list):
                        return data[k]
            return []
    except Exception as e:
        print(f"Could not load backend projects.json: {e}")
        print(f"Tried path: {projects_path}")
        return []

def get_recommendations_from_db():
    # No persistent recommendations
    return []

def get_skills_from_db():
    """Load skills from `Back/data/skills.json` (no DB)."""
    try:
        here = os.path.dirname(os.path.abspath(__file__))
        skills_path = os.path.normpath(os.path.join(here, 'data', 'skills.json'))
        with open(skills_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data
    except Exception as e:
        print(f"Could not load backend skills.json: {e}")
        print(f"Tried path: {skills_path}")
        return {}

def add_recommendation_to_db(*args, **kwargs):
    # No-op when DB removed
    return None

def add_project_to_db(*args, **kwargs):
    # No-op
    return None

def save_contact_message(name: str, email: str, message: str, sent_by_email: bool = False):
    # Do not save messages to a database; just log
    print(f"[contact] {name} <{email}> — sent_by_email={sent_by_email}")
    return None

app = FastAPI()

# Ensure backend has a public folder to serve uploaded CVs
here = os.path.dirname(os.path.abspath(__file__))
backend_cv_dir = os.path.normpath(os.path.join(here, 'public', 'cv'))
os.makedirs(backend_cv_dir, exist_ok=True)
# Mount static files so uploaded CV is available at /cv/Bernardo_Meneses.pdf
app.mount('/cv', StaticFiles(directory=backend_cv_dir), name='cv')

# Ensure backend has a public folder to serve hero images
backend_hero_dir = os.path.normpath(os.path.join(here, 'public', 'hero'))
os.makedirs(backend_hero_dir, exist_ok=True)
# Mount hero images at /hero
app.mount('/hero', StaticFiles(directory=backend_hero_dir), name='hero')

# Resolver lista de origins para CORS a partir de variável de ambiente
def _resolve_allowed_origins():
    default = [
        "http://localhost:5173",
        "http://localhost:4698",
        "https://bernardomeneses.fly.dev",
    ]
    if not ALLOWED_ORIGINS_ENV:
        return default
    val = ALLOWED_ORIGINS_ENV.strip()
    if val == "*":
        return ["*"]
    # split CSV e strip
    parts = [p.strip() for p in val.split(",") if p.strip()]
    return parts if parts else default

allowed_origins = _resolve_allowed_origins()
print(f"CORS allowed_origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Project(BaseModel):
    title: str
    description: str
    tech: List[str]
    repo: str
    image: str

class Recommendation(BaseModel):
    name: str
    text: str
    avatar: str
    username: Optional[str] = None
    provider: Optional[str] = 'github'

class GitHubUser(BaseModel):
    login: str
    name: str
    avatar_url: str

class CommentRequest(BaseModel):
    text: str
    github_token: Optional[str] = None
    google_token: Optional[str] = None

class ContactMessage(BaseModel):
    name: str
    email: str
    message: str

# Os dados agora são geridos pela base de dados SQLite
# Não precisamos mais de variáveis em memória

# Store para códigos OAuth temporários (em produção, usar Redis ou base de dados)
oauth_states = {}

@app.get("/")
def read_root():
    return {"message": "Portfolio API está funcionando! 🚀 Base de dados SQLite ativa."}

@app.get("/api/config/check")
def check_config():
    """Verifica se as configurações necessárias estão presentes"""
    config_status = {
        "github_oauth": {
            "client_id_configured": bool(GITHUB_CLIENT_ID),
            "client_secret_configured": bool(GITHUB_CLIENT_SECRET),
            "redirect_uri": GITHUB_REDIRECT_URI
        },
        "email": {
            "smtp_configured": bool(os.getenv("SMTP_SERVER") and os.getenv("SENDER_EMAIL"))
        }
    }
    return config_status

@app.get("/api/auth/github/login")
async def github_login():
    """Inicia o fluxo OAuth do GitHub"""
    print(f"GitHub login endpoint chamado")
    print(f"GITHUB_CLIENT_ID: {GITHUB_CLIENT_ID}")
    
    if not GITHUB_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GitHub Client ID não configurado")
    
    # Gerar um state único para segurança
    state = secrets.token_urlsafe(32)
    oauth_states[state] = True
    
    # Construir URL de autorização do GitHub
    params = {
        "client_id": GITHUB_CLIENT_ID,
        "redirect_uri": GITHUB_REDIRECT_URI,
        "scope": "user:email",
        "state": state
    }
    
    auth_url = f"https://github.com/login/oauth/authorize?{urllib.parse.urlencode(params)}"
    print(f"Auth URL gerado: {auth_url}")
    return {"auth_url": auth_url}

@app.get("/api/auth/github/callback")
async def github_callback(code: str, state: str):
    """Processa o callback OAuth do GitHub e redireciona para o frontend"""
    try:
        # Verificar se as configurações OAuth estão presentes
        if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
            error_url = f"https://bernardomeneses.fly.dev/callback.html?error=config_error"
            return RedirectResponse(url=error_url)
        
        # Verificar se o state é válido
        if state not in oauth_states:
            error_url = f"https://bernardomeneses.fly.dev/callback.html?error=invalid_state"
            return RedirectResponse(url=error_url)
        
        # Remover state usado
        del oauth_states[state]
        
        # Trocar código por token de acesso
        token_data = {
            "client_id": GITHUB_CLIENT_ID,
            "client_secret": GITHUB_CLIENT_SECRET,
            "code": code,
            "redirect_uri": GITHUB_REDIRECT_URI
        }
        
        headers = {"Accept": "application/json"}
        response = requests.post(
            "https://github.com/login/oauth/access_token",
            data=token_data,
            headers=headers
        )
        
        if response.status_code != 200:
            error_url = f"https://bernardomeneses.fly.dev/github/callback.html?error=token_exchange_failed"
            return RedirectResponse(url=error_url)
        
        token_response = response.json()
        access_token = token_response.get("access_token")
        
        if not access_token:
            error_url = f"https://bernardomeneses.fly.dev/github/callback.html?error=no_access_token"
            return RedirectResponse(url=error_url)
        
        # Obter dados do usuário
        user_headers = {"Authorization": f"token {access_token}"}
        user_response = requests.get("https://api.github.com/user", headers=user_headers)
        
        if user_response.status_code != 200:
            error_url = f"https://bernardomeneses.fly.dev/github/callback.html?error=user_data_failed"
            return RedirectResponse(url=error_url)
        
        user_data = user_response.json()
        
        # Criar URL de sucesso com dados do usuário
        user_params = {
            "success": "true",
            "login": user_data.get("login", ""),
            "name": user_data.get("name", ""),
            "avatar_url": user_data.get("avatar_url", ""),
            "email": user_data.get("email", ""),
            "token": access_token
        }
        
        success_url = f"https://bernardomeneses.fly.dev/github/callback.html?{urllib.parse.urlencode(user_params)}"
        return RedirectResponse(url=success_url)
        
    except Exception as e:
        error_url = f"https://bernardomeneses.fly.dev/github/callback.html?error=server_error&message={str(e)}"
        return RedirectResponse(url=error_url)

@app.get("/api/auth/google/login")
async def google_login():
    """Inicia o fluxo OAuth do Google"""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google Client ID não configurado")
    
    # Gerar um state único para segurança
    state = secrets.token_urlsafe(32)
    oauth_states[state] = True
    
    # Construir URL de autorização do Google
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "scope": "openid email profile",
        "response_type": "code",
        "state": state
    }
    
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
    return {"auth_url": auth_url}

@app.get("/api/auth/google/callback")
async def google_callback(code: str, state: str):
    """Processa o callback OAuth do Google e redireciona para o frontend"""
    try:
        # Verificar se as configurações OAuth estão presentes
        if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
            error_url = f"https://bernardomeneses.fly.dev/google/callback.html?error=config_error"
            return RedirectResponse(url=error_url)
        
        # Verificar se o state é válido
        if state not in oauth_states:
            error_url = f"https://bernardomeneses.fly.dev/google/callback.html?error=invalid_state"
            return RedirectResponse(url=error_url)
        
        # Remover state usado
        del oauth_states[state]
        
        # Trocar código por token de acesso
        token_data = {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": GOOGLE_REDIRECT_URI
        }
        
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        response = requests.post(
            "https://oauth2.googleapis.com/token",
            data=token_data,
            headers=headers
        )
        
        if response.status_code != 200:
            error_url = f"https://bernardomeneses.fly.dev/google/callback.html?error=token_exchange_failed"
            return RedirectResponse(url=error_url)
        
        token_response = response.json()
        access_token = token_response.get("access_token")
        
        if not access_token:
            error_url = f"https://bernardomeneses.fly.dev/google/callback.html?error=no_access_token"
            return RedirectResponse(url=error_url)
        
        # Obter dados do usuário
        user_headers = {"Authorization": f"Bearer {access_token}"}
        user_response = requests.get("https://www.googleapis.com/oauth2/v2/userinfo", headers=user_headers)
        
        if user_response.status_code != 200:
            error_url = f"https://bernardomeneses.fly.dev/google/callback.html?error=user_data_failed"
            return RedirectResponse(url=error_url)
        
        user_data = user_response.json()
        
        # Criar URL de sucesso com dados do usuário
        user_params = {
            "success": "true",
            "id": user_data.get("id", ""),
            "email": user_data.get("email", ""),
            "name": user_data.get("name", ""),
            "picture": user_data.get("picture", ""),
            "verified_email": user_data.get("verified_email", ""),
            "token": access_token
        }
        
        success_url = f"https://bernardomeneses.fly.dev/google/callback.html?{urllib.parse.urlencode(user_params)}"
        return RedirectResponse(url=success_url)
        
    except Exception as e:
        error_url = f"https://bernardomeneses.fly.dev/google/callback.html?error=server_error&message={str(e)}"
        return RedirectResponse(url=error_url)

@app.get("/api/projects", response_model=List[Project])
def get_projects():
    """Obter todos os projetos da base de dados"""
    return get_projects_from_db()

@app.get("/api/recommendations", response_model=List[Recommendation])
def get_recommendations():
    """Obter todas as recomendações da base de dados"""
    return get_recommendations_from_db()


@app.get("/api/skills")
def get_skills():
    """Obter skills estáticos do backend"""
    return get_skills_from_db()

@app.post("/api/auth/github")
async def verify_github_token(request: dict):
    """Verifica o token do GitHub e retorna informações do usuário"""
    try:
        token = request.get("token")
        headers = {"Authorization": f"token {token}"}
        response = requests.get("https://api.github.com/user", headers=headers)
        
        if response.status_code == 200:
            user_data = response.json()
            return {
                "login": user_data["login"],
                "name": user_data.get("name", user_data["login"]),
                "avatar_url": user_data["avatar_url"]
            }
        else:
            raise HTTPException(status_code=401, detail="Token inválido")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao verificar token")

@app.post("/api/recommendations")
async def add_recommendation(comment: CommentRequest):
    """Adiciona uma nova recomendação após verificar o token GitHub ou Google"""
    try:
        user_data = None
        provider = None
        google_data = None  # Adicionar variável para dados do Google
        
        # Verificar se é token GitHub
        if comment.github_token:
            headers = {"Authorization": f"token {comment.github_token}"}
            response = requests.get("https://api.github.com/user", headers=headers)
            
            if response.status_code == 200:
                user_data = response.json()
                provider = "github"
        
        # Verificar se é token Google
        elif comment.google_token:
            headers = {"Authorization": f"Bearer {comment.google_token}"}
            response = requests.get("https://www.googleapis.com/oauth2/v2/userinfo", headers=headers)
            
            if response.status_code == 200:
                google_data = response.json()  # Guardar dados originais do Google
                # Adaptar dados do Google para o formato esperado
                user_data = {
                    "name": google_data.get("name", "Usuário Google"),
                    "login": f"google_{google_data.get('id', 'user')}",  # Usar ID do Google em vez do email
                    "avatar_url": google_data.get("picture", ""),
                    "email": google_data.get("email", "")
                }
                provider = "google"
        
        if not user_data:
            raise HTTPException(status_code=401, detail="Token inválido ou não fornecido")
        
        # Criar nova recomendação na base de dados
        username = None
        if provider == "google":
            username = f"google_{google_data.get('id', 'user')}"
        else:
            username = user_data.get("login", "unknown")
            
        recommendation_id = add_recommendation_to_db(
            name=user_data.get("name", user_data.get("login", "Usuário")),
            text=comment.text,
            avatar=user_data.get("avatar_url", ""),
            username=username,
            provider=provider
        )
        
        new_recommendation = {
            "name": user_data.get("name", user_data.get("login", "Usuário")),
            "text": comment.text,
            "avatar": user_data.get("avatar_url", ""),
            "username": username,
            "provider": provider
        }
        
        return {"message": "Recomendação adicionada com sucesso!", "recommendation": new_recommendation}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao adicionar recomendação")


@app.post("/api/skills")
async def add_skill(request: Request, payload: dict):
    """Add a skill to one of the arrays in Back/data/skills.json (admin only)."""
    try:
        _validate_admin_token(request)
        category = payload.get('category')
        skill = payload.get('skill')
        if not category or not skill:
            raise HTTPException(status_code=400, detail='category and skill required')
        here = os.path.dirname(os.path.abspath(__file__))
        skills_path = os.path.normpath(os.path.join(here, 'data', 'skills.json'))
        with open(skills_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        # Ensure category exists and is a list
        if category not in data or not isinstance(data.get(category), list):
            data[category] = []
        data[category].append(skill)
        with open(skills_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"[skills] Added skill to {category}: {skill.get('name')}")
        return {"message": "Skill adicionada com sucesso", "skill": skill}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao adicionar skill: {e}")
        raise HTTPException(status_code=500, detail="Erro ao adicionar skill")

@app.post("/api/contact")
async def send_contact_message(contact: ContactMessage):
    """Envia mensagem de contato por email"""
    try:
        # Configurações do email - carregadas do arquivo .env
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        sender_email = os.getenv("SENDER_EMAIL")
        sender_password = os.getenv("SENDER_PASSWORD")
        recipient_email = os.getenv("RECIPIENT_EMAIL")
        
        # Verificar se as configurações estão definidas
        if not sender_email or not sender_password or not recipient_email:
            # Modo de teste - salvar na base de dados sem enviar email
            message_id = save_contact_message(contact.name, contact.email, contact.message, False)
            print(f"=== MENSAGEM SALVA NA BD (ID: {message_id}) ===")
            print(f"De: {contact.name} ({contact.email})")
            print(f"Mensagem: {contact.message}")
            print(f"=============================================")
            return {"message": "Mensagem recebida e salva! Configure o arquivo .env para envio automático por email."}
        
        # Tentar enviar email e salvar na base de dados
        # Criar mensagem
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = recipient_email
        msg['Subject'] = f"Nova mensagem do portfolio - {contact.name}"
        
        # Corpo do email
        body = f"""
        New message from your portfolio contact form:

        Name: {contact.name}
        Email: {contact.email}

        Message:
        {contact.message}
        
        ---
        This message was sent from the contact form on Bernardo Meneses' portfolio, dont reply to it.
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Enviar email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        text = msg.as_string()
        server.sendmail(sender_email, recipient_email, text)
        server.quit()
        
        # Salvar na base de dados como enviado com sucesso
        message_id = save_contact_message(contact.name, contact.email, contact.message, True)
        
        return {"message": "Mensagem enviada com sucesso!"}
        
    except Exception as e:
        print(f"Erro ao enviar email: {e}")
        # Em caso de erro, salvar mensagem na base de dados
        message_id = save_contact_message(contact.name, contact.email, contact.message, False)
        print(f"=== MENSAGEM SALVA NA BD (ID: {message_id}) ===")
        print(f"De: {contact.name} ({contact.email})")
        print(f"Mensagem: {contact.message}")
        print(f"=============================================")
        return {"message": "Mensagem recebida e salva! Houve um erro no envio automático."}

@app.post("/api/admin/login")
async def admin_login(payload: dict):
    """Simple admin login: verify password and return a token."""
    try:
        password = payload.get("password")
        if not ADMIN_PASSWORD:
            raise HTTPException(status_code=403, detail="Admin password not configured")
        if password != ADMIN_PASSWORD:
            raise HTTPException(status_code=401, detail="Invalid password")
        token = secrets.token_urlsafe(32)
        admin_tokens[token] = True
        return {"token": token}
    except HTTPException:
        raise
    except Exception as e:
        print(f"admin login error: {e}")
        raise HTTPException(status_code=500, detail="Server error")


def _validate_admin_token(request: Request):
    token = request.headers.get("X-ADMIN-TOKEN")
    if not token or token not in admin_tokens:
        raise HTTPException(status_code=401, detail="Invalid or missing admin token")


@app.post("/api/projects")
async def add_project(request: Request, project: Project):
    """Adicionar novo projeto gravando em Back/data/projects.json (admin only)"""
    try:
        _validate_admin_token(request)
        here = os.path.dirname(os.path.abspath(__file__))
        projects_path = os.path.normpath(os.path.join(here, 'data', 'projects.json'))
        # Read existing
        with open(projects_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        if not isinstance(data, list):
            data = []
        # Append new project
        project_dict = project.dict()
        data.append(project_dict)
        # Write back
        with open(projects_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"[project] Added project: {project.title}")
        return {"message": "Projeto adicionado com sucesso", "project": project_dict}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao adicionar projeto: {e}")
        raise HTTPException(status_code=500, detail="Erro ao adicionar projeto")
    except Exception as e:
        print(f"Erro ao adicionar projeto: {e}")
        raise HTTPException(status_code=500, detail="Erro ao adicionar projeto")


@app.delete("/api/projects/{index}")
async def delete_project(request: Request, index: int):
    """Delete a project by index from Back/data/projects.json (admin only)."""
    try:
        _validate_admin_token(request)
        here = os.path.dirname(os.path.abspath(__file__))
        projects_path = os.path.normpath(os.path.join(here, 'data', 'projects.json'))
        with open(projects_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        if not isinstance(data, list):
            raise HTTPException(status_code=400, detail='Projects file invalid')
        if index < 0 or index >= len(data):
            raise HTTPException(status_code=404, detail='Project index out of range')
        removed = data.pop(index)
        with open(projects_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"[project] Removed project: {removed.get('title')}")
        return {"message": "Projeto removido com sucesso", "project": removed}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao remover projeto: {e}")
        raise HTTPException(status_code=500, detail="Erro ao remover projeto")


@app.delete("/api/skills")
async def delete_skill(request: Request, payload: dict):
    """Delete a skill by category and name from Back/data/skills.json (admin only).

    Expected payload: { "category": "stack", "name": "React" }
    """
    try:
        _validate_admin_token(request)
        category = payload.get('category')
        name = payload.get('name')
        if not category or not name:
            raise HTTPException(status_code=400, detail='category and name required')
        here = os.path.dirname(os.path.abspath(__file__))
        skills_path = os.path.normpath(os.path.join(here, 'data', 'skills.json'))
        with open(skills_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        if category not in data or not isinstance(data.get(category), list):
            raise HTTPException(status_code=404, detail='Category not found')
        removed = None
        new_list = []
        for item in data.get(category, []):
            if isinstance(item, dict) and item.get('name') == name and removed is None:
                removed = item
                continue
            new_list.append(item)
        if removed is None:
            raise HTTPException(status_code=404, detail='Skill not found')
        data[category] = new_list
        with open(skills_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"[skills] Removed skill from {category}: {name}")
        return {"message": "Skill removida com sucesso", "skill": removed}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao remover skill: {e}")
        raise HTTPException(status_code=500, detail="Erro ao remover skill")


@app.put("/api/projects/{index}")
async def edit_project(request: Request, index: int, project: Project):
    """Edit a project at a given index in Back/data/projects.json (admin only)."""
    try:
        _validate_admin_token(request)
        here = os.path.dirname(os.path.abspath(__file__))
        projects_path = os.path.normpath(os.path.join(here, 'data', 'projects.json'))
        with open(projects_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        if not isinstance(data, list):
            raise HTTPException(status_code=400, detail='Projects file invalid')
        if index < 0 or index >= len(data):
            raise HTTPException(status_code=404, detail='Project index out of range')
        project_dict = project.dict()
        data[index] = project_dict
        with open(projects_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"[project] Edited project at index {index}: {project_dict.get('title')}")
        return {"message": "Projeto atualizado com sucesso", "project": project_dict}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao editar projeto: {e}")
        raise HTTPException(status_code=500, detail="Erro ao editar projeto")


@app.put("/api/skills")
async def edit_skill(request: Request, payload: dict):
    """Edit a skill in Back/data/skills.json by category and existing name (admin only).

    Expected payload: { "category": "stack", "name": "React", "skill": { "name": "ReactJS", "image": "..." } }
    """
    try:
        _validate_admin_token(request)
        category = payload.get('category')
        name = payload.get('name')
        new_skill = payload.get('skill')
        if not category or not name or not new_skill:
            raise HTTPException(status_code=400, detail='category, name and skill required')
        here = os.path.dirname(os.path.abspath(__file__))
        skills_path = os.path.normpath(os.path.join(here, 'data', 'skills.json'))
        with open(skills_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        if category not in data or not isinstance(data.get(category), list):
            raise HTTPException(status_code=404, detail='Category not found')
        updated = None
        new_list = []
        for item in data.get(category, []):
            if isinstance(item, dict) and item.get('name') == name and updated is None:
                new_list.append(new_skill)
                updated = new_skill
                continue
            new_list.append(item)
        if updated is None:
            raise HTTPException(status_code=404, detail='Skill not found')
        data[category] = new_list
        with open(skills_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"[skills] Edited skill in {category}: {name} -> {new_skill.get('name')}")
        return {"message": "Skill atualizada com sucesso", "skill": new_skill}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao editar skill: {e}")
        raise HTTPException(status_code=500, detail="Erro ao editar skill")


@app.post("/api/admin/upload-cv")
async def upload_cv(request: Request, file: UploadFile = File(...)):
    """Upload a CV PDF from the admin UI and save it into the backend mounted `public/cv`.

    Files are served from the backend mount at `/cv` (mounted earlier in this file),
    so we write into the backend `public/cv` directory (`backend_cv_dir`).
    """
    try:
        _validate_admin_token(request)
        # Basic validation
        filename = file.filename or 'Bernardo_Meneses.pdf'
        if not filename.lower().endswith('.pdf') and file.content_type != 'application/pdf':
            raise HTTPException(status_code=400, detail='Only PDF files are accepted')

        # Use the backend mounted CV directory (created at module top as `backend_cv_dir`).
        dest_dir = backend_cv_dir
        os.makedirs(dest_dir, exist_ok=True)
        dest_path = os.path.join(dest_dir, 'Bernardo_Meneses.pdf')

        contents = await file.read()
        with open(dest_path, 'wb') as f:
            f.write(contents)

        print(f"[admin] CV uploaded to {dest_path}")
        return {"message": "CV uploaded successfully", "path": "/cv/Bernardo_Meneses.pdf"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error uploading CV: {e}")
        raise HTTPException(status_code=500, detail='Error uploading CV')


@app.post("/api/admin/upload-hero")
async def upload_hero(request: Request, file: UploadFile = File(...)):
    """Upload hero image from admin UI and save it into the backend mounted `public/hero`.

    Saved file will be available at `/hero/hero.jpg` (or original extension).
    """
    try:
        _validate_admin_token(request)
        filename = file.filename or 'hero.jpg'
        # allow common image types
        if not any(filename.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp']):
            raise HTTPException(status_code=400, detail='Only JPG/PNG/WEBP files are accepted')

        dest_dir = backend_hero_dir
        os.makedirs(dest_dir, exist_ok=True)
        # preserve extension but use stable name
        _, ext = os.path.splitext(filename)
        ext = ext or '.jpg'
        dest_path = os.path.join(dest_dir, 'hero' + ext)

        contents = await file.read()
        with open(dest_path, 'wb') as f:
            f.write(contents)

        print(f"[admin] Hero image uploaded to {dest_path}")
        return {"message": "Hero image uploaded successfully", "path": "/hero/hero" + ext}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error uploading hero image: {e}")
        raise HTTPException(status_code=500, detail='Error uploading hero image')

@app.get("/api/stats")
def get_stats():
    """Obter estatísticas da base de dados"""
    # Database disabled: return zeros and a note
    return {
        "recommendations_count": 0,
        "projects_count": 0,
        "contact_messages_count": 0,
        "sent_messages_count": 0,
        "database_path": None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
