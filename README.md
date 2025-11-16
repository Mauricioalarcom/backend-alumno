# 🚨 Sistema de Incidentes UTEC - Backend

Backend serverless para el sistema de reportes de incidentes de UTEC.

## ✅ Características Principales

### 🔐 Autenticación Restrictiva
- **Solo acepta emails @utec.edu.pe**
- Login con JWT (válido 24h)

### 📋 Gestión de Incidentes
- Crear incidentes con validación automática de nivel de riesgo
- Listar todos los incidentes
- Ver incidente por ID

## 🚀 Despliegue en AWS

### Comando Simple:
```bash
serverless deploy
```

O especificar stage:
```bash
serverless deploy --stage prod
```

Esto creará:
- ✅ 5 Lambda Functions
- ✅ 2 Tablas DynamoDB
- ✅ API Gateway con endpoints HTTP

## 📡 Endpoints

### 1. Registrar Usuario
```
POST /auth/register
```
**Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan.perez@utec.edu.pe",
  "password": "mipassword123"
}
```

⚠️ **Importante**: Solo emails `@utec.edu.pe` son aceptados

### 2. Login
```
POST /auth/login
```
**Body:**
```json
{
  "email": "juan.perez@utec.edu.pe",
  "password": "mipassword123"
}
```

### 3. Crear Incidente (requiere token)
```
POST /incidents
Authorization: Bearer {token}
```
**Body:**
```json
{
  "titulo": "Fuga de agua",
  "descripcion": "Hay una fuga en el baño",
  "tipo": "infraestructura",
  "piso": 2,
  "lugar_especifico": "Baño del ala norte",
  "foto": "base64_string_opcional"
}
```

**Tipos permitidos:**
- `seguridad` → Riesgo: ALTO
- `infraestructura` → Riesgo: ALTO
- `limpieza` → Riesgo: MEDIO
- `equipamiento` → Riesgo: MEDIO
- `otro` → Riesgo: BAJO

### 4. Listar Incidentes (requiere token)
```
GET /incidents
Authorization: Bearer {token}
```

### 5. Ver Incidente (requiere token)
```
GET /incidents/{id}
Authorization: Bearer {token}
```

## 🛠️ Configuración

### Variables de Entorno (.env)
```
JWT_SECRET=utec-secret-2024
AWS_REGION=us-east-1
```

### Organización y Rol IAM
Configurado en `serverless.yml`:
- **Org**: diegoalarconm
- **IAM Role**: arn:aws:iam::520247722169:role/LabRole

## 📦 Recursos AWS Creados

### Lambda Functions:
- `register` - Registro de usuarios
- `login` - Autenticación
- `createIncident` - Crear incidente
- `listIncidents` - Listar incidentes
- `getIncident` - Ver incidente

### DynamoDB Tables:
- `{stage}-utec-users` - Usuarios
- `{stage}-utec-incidents` - Incidentes

## 🎯 Flujo Completo

1. **Registrar** con email @utec.edu.pe
2. **Login** para obtener token
3. **Crear incidentes** con el token
4. El sistema automáticamente:
   - Calcula el nivel de riesgo
   - Asigna fecha de creación
   - Marca estado como "pendiente"
   - Cuenta veces reportado

## 📝 Ejemplo de Uso

```bash
# 1. Registrar
curl -X POST https://API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan Pérez","email":"juan.perez@utec.edu.pe","password":"pass123"}'

# 2. Login
curl -X POST https://API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan.perez@utec.edu.pe","password":"pass123"}'

# 3. Crear Incidente
curl -X POST https://API_URL/incidents \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Problema","descripcion":"Desc","tipo":"seguridad","piso":1,"lugar_especifico":"Lab A"}'
```

## 🔧 Comandos Útiles

```bash
# Ver logs
serverless logs -f register --tail

# Eliminar deployment
serverless remove

# Info del deployment
serverless info
```

## ✨ Listo para Usar

```bash
npm install
serverless deploy
```

¡Tu API estará lista en AWS!
