from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import hashlib

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ADMIN_EMAIL = "weryyck@gmail.com"
ADMIN_PASSWORD = "1456"

users = []
next_id = 1

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str


class AuthResponse(BaseModel):
    message: str
    user: UserOut


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, hash_value: str) -> bool:
    return hash_password(password) == hash_value


def get_user_by_email(email: str):
    return next((u for u in users if u["email"] == email), None)


def create_admin():
    global next_id

    existing = get_user_by_email(ADMIN_EMAIL)
    if existing:
        return

    users.append({
        "id": next_id,
        "name": "Admin",
        "email": ADMIN_EMAIL,
        "password_hash": hash_password(ADMIN_PASSWORD),
        "role": "admin",
    })
    next_id += 1


create_admin()

class Item(BaseModel):
    id: int
    name: str
    description: str | None = None
    stock: int


class OrderItem(BaseModel):
    item_id: int
    quantity: int


class CreateOrderRequest(BaseModel):
    user_email: EmailStr
    items: list[OrderItem]


class OrderOut(BaseModel):
    id: int
    user_email: EmailStr
    items: list[OrderItem]
    status: str


items_db: list[Item] = [
    Item(id=1, name="Resistor 220Ω", description="Kit de resistores 220 ohms", stock=500),
    Item(id=2, name="LED 5mm vermelho", description="LED vermelho padrão 5mm", stock=300),
    Item(id=3, name="Arduino UNO", description="Placa Arduino UNO compatível", stock=20),
    Item(id=4, name="Protoboard 830 pontos", description="Protoboard grande", stock=50),
    Item(id=5, name="Jumpers macho-macho", description="Kit com 40 jumpers", stock=100),
    Item(id=6, name="ESP32 DevKit", description="Placa ESP32 para IoT", stock=15),
]

orders: list[OrderOut] = []
next_order_id = 1

@app.get("/")
def root():
    return {"message": "API do ElectroStock rodando"}


@app.post("/register", response_model=AuthResponse)
def register(req: RegisterRequest):
    global next_id

    if req.email == ADMIN_EMAIL:
        raise HTTPException(400, "Este email é reservado para o administrador.")

    existing = get_user_by_email(req.email)
    if existing:
        raise HTTPException(400, "Esse email já está registrado.")

    if len(req.password) < 4:
        raise HTTPException(400, "A senha deve ter pelo menos 4 caracteres.")

    user = {
        "id": next_id,
        "name": req.name,
        "email": req.email,
        "password_hash": hash_password(req.password),
        "role": "user",
    }
    users.append(user)
    next_id += 1

    return AuthResponse(
        message="Usuário criado.",
        user=UserOut(**user),
    )


@app.post("/login", response_model=AuthResponse)
def login(req: LoginRequest):
    if req.email == ADMIN_EMAIL and req.password == ADMIN_PASSWORD:
        admin = get_user_by_email(ADMIN_EMAIL)
        return AuthResponse(
            message="Login admin.",
            user=UserOut(**admin),
        )

    user = get_user_by_email(req.email)
    if not user:
        raise HTTPException(401, "Email ou senha inválidos.")

    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(401, "Email ou senha inválidos.")

    return AuthResponse(
        message="Login bem-sucedido.",
        user=UserOut(**user),
    )


@app.get("/items", response_model=list[Item])
def list_items():
    return items_db


@app.post("/orders", response_model=OrderOut)
def create_order(req: CreateOrderRequest):
    global next_order_id

    if not req.items:
        raise HTTPException(400, "O pedido precisa ter ao menos 1 item.")

    for oi in req.items:
        if oi.quantity <= 0:
            raise HTTPException(400, f"Quantidade inválida para o item {oi.item_id}.")

        item = next((it for it in items_db if it.id == oi.item_id), None)
        if not item:
            raise HTTPException(400, f"Item {oi.item_id} não encontrado.")

        if oi.quantity > item.stock:
            raise HTTPException(
                400,
                f"Quantidade pedida para '{item.name}' ({oi.quantity}) excede "
                f"o estoque disponível ({item.stock}).",
            )
    for oi in req.items:
        item = next(it for it in items_db if it.id == oi.item_id)
        item.stock -= oi.quantity

    order = OrderOut(
        id=next_order_id,
        user_email=req.user_email,
        items=req.items,
        status="pending",
    )
    orders.append(order)
    next_order_id += 1

    return order


@app.get("/orders", response_model=list[OrderOut])
def list_orders():
    return orders


@app.post("/orders/{order_id}/approve", response_model=OrderOut)
def approve_order(order_id: int):
    order = next((o for o in orders if o.id == order_id), None)
    if not order:
        raise HTTPException(404, "Pedido não encontrado.")
    if order.status != "pending":
        raise HTTPException(400, "Só é possível aprovar pedidos pendentes.")
    order.status = "approved"
    return order


@app.post("/orders/{order_id}/reject", response_model=OrderOut)
def reject_order(order_id: int):
    order = next((o for o in orders if o.id == order_id), None)
    if not order:
        raise HTTPException(404, "Pedido não encontrado.")
    if order.status != "pending":
        raise HTTPException(400, "Só é possível rejeitar pedidos pendentes.")
    order.status = "rejected"
    return order


@app.post("/orders/{order_id}/finish", response_model=OrderOut)
def finish_order(order_id: int):
    order = next((o for o in orders if o.id == order_id), None)
    if not order:
        raise HTTPException(404, "Pedido não encontrado.")
    if order.status != "approved":
        raise HTTPException(400, "Só é possível finalizar pedidos aprovados.")
    order.status = "finished"
    return order


class UpdateProfileRequest(BaseModel):
  current_email: EmailStr
  new_email: EmailStr | None = None
  new_password: str | None = None


@app.put("/users/profile", response_model=UserOut)
def update_profile(req: UpdateProfileRequest):
    user = get_user_by_email(req.current_email)
    if not user:
        raise HTTPException(404, "Usuário não encontrado.")

    if req.new_email:
        if req.new_email == ADMIN_EMAIL and user["email"] != ADMIN_EMAIL:
            raise HTTPException(400, "Email reservado para o administrador.")
        if req.new_email != user["email"] and get_user_by_email(req.new_email):
            raise HTTPException(400, "Já existe usuário com este email.")
        user["email"] = req.new_email

    if req.new_password:
        if len(req.new_password) < 4:
            raise HTTPException(400, "A nova senha deve ter pelo menos 4 caracteres.")
        user["password_hash"] = hash_password(req.new_password)

    return UserOut(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
    )
