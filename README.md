# Sistema de Reportes de Incidentes - Backend

Backend serverless para sistema de reportes de incidentes usando AWS Lambda, API Gateway y DynamoDB.

## Características

- 🚀 **Serverless**: Desplegado en AWS Lambda con API Gateway
- 📊 **Base de datos**: DynamoDB para almacenamiento escalable
- 🔐 **Autenticación**: JWT con diferenciación de roles (usuario/admin)
- 📸 **Gestión de fotos**: Subida y almacenamiento en S3
- 🔒 **Seguridad**: Validación de datos con Joi
- 📈 **Escalabilidad**: Arquitectura completamente serverless

## Estructura del Proyecto

```
src/
├── handlers/          # Funciones Lambda
│   ├── incidents.js   # CRUD de incidentes
│   ├── admin.js       # Funciones administrativas
│   ├── auth.js        # Autenticación y autorización
│   └── photos.js      # Gestión de fotos
├── models/            # Modelos de datos
│   ├── Incident.js    # Modelo de incidentes
│   └── User.js        # Modelo de usuarios
├── schemas/           # Validaciones
│   └── validation.js  # Esquemas Joi
└── utils/             # Utilidades
    ├── response.js    # Helpers para respuestas HTTP
    └── auth.js        # Helpers de autenticación
```

## Modelo de Datos

### Incidentes
```javascript
{
  id: string,                    // UUID generado automáticamente
  titulo: string,                // Título del incidente
  descripcion: string,           // Descripción detallada
  tipo: string,                  // Tipo de incidente
  piso: string,                  // Piso donde ocurrió
  lugar_especifico: string,      // Ubicación específica
  foto: string,                  // URL de la foto (opcional)
  
  // Campos manejados por el sistema
  nivel_riesgo: string,          // bajo, medio, alto, critico
  fecha_creacion: string,        // ISO timestamp
  estado: string,                // pendiente, en_proceso, resuelto, cerrado
  veces_reportado: number,       // Contador de reportes
  usuario_reporto: string,       // Email del usuario que reportó
  admin_actualizo: string,       // Email del admin que actualizó (opcional)
  comentario_admin: string       // Comentario del administrador (opcional)
}
```

### Usuarios
```javascript
{
  email: string,                 // Email (clave primaria)
  password: string,              // Hash de la contraseña
  nombre: string,                // Nombre completo
  tipo_usuario: string,          // usuario, admin
  fecha_registro: string,        // ISO timestamp
  activo: boolean,               // Estado de la cuenta
  ultimo_login: string           // ISO timestamp
}
```

## API Endpoints

### Autenticación
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión
- `GET /auth/profile` - Obtener perfil (requiere auth)

### Incidentes
- `POST /incidents` - Crear incidente (requiere auth)
- `GET /incidents` - Listar incidentes (requiere auth)
- `GET /incidents/{id}` - Obtener incidente específico
- `PUT /incidents/{id}` - Actualizar incidente (requiere auth)
- `DELETE /incidents/{id}` - Eliminar incidente (solo admin)

### Administración
- `PATCH /admin/incidents/{id}/status` - Actualizar estado (solo admin)
- `GET /admin/incidents/pending` - Incidentes pendientes (solo admin)
- `GET /admin/incidents/stats` - Estadísticas (solo admin)

### Fotos
- `POST /photos/upload` - Subir foto (requiere auth)
- `GET /photos/{fileName}` - Obtener URL firmada (requiere auth)
- `DELETE /photos/{fileName}` - Eliminar foto (requiere auth)

## Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- AWS CLI configurado
- Serverless Framework

### Instalación
```bash
npm install
```

### Configuración
1. Copiar `.env.example` a `.env` y configurar variables
2. Configurar AWS credentials
3. Modificar `serverless.yml` según necesidades

### Desarrollo Local
```bash
npm run local
```

### Despliegue
```bash
# Desarrollo
npm run deploy-dev

# Producción
npm run deploy-prod
```

## Roles y Permisos

### Usuario Normal
- Crear incidentes
- Ver sus propios incidentes
- Actualizar sus propios incidentes
- Subir fotos

### Administrador
- Todas las funciones de usuario normal
- Ver todos los incidentes
- Actualizar estado y nivel de riesgo
- Ver estadísticas
- Eliminar incidentes y fotos

## Tipos de Incidentes

- `mantenimiento` - Problemas de mantenimiento
- `seguridad` - Problemas de seguridad
- `limpieza` - Problemas de limpieza
- `infraestructura` - Problemas de infraestructura
- `tecnologia` - Problemas tecnológicos
- `otros` - Otros tipos de incidentes

## Estados de Incidentes

- `pendiente` - Recién reportado, esperando revisión
- `en_proceso` - En proceso de resolución
- `resuelto` - Problema resuelto
- `cerrado` - Incidente cerrado

## Niveles de Riesgo

- `bajo` - Riesgo bajo
- `medio` - Riesgo medio (por defecto)
- `alto` - Riesgo alto
- `critico` - Riesgo crítico

## Seguridad

- Autenticación JWT con expiración de 24 horas
- Validación de datos con Joi
- Autorización basada en roles
- CORS configurado
- Encriptación de contraseñas con bcrypt
- URLs firmadas para acceso a fotos

## Monitoreo y Logs

- CloudWatch Logs automático
- Métricas de API Gateway
- Monitoreo de DynamoDB
- Alertas configurables

## Contribución

1. Fork el proyecto
2. Crear branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.# backend-alumno
