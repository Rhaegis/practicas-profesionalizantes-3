# Documentación de la WebAPI - Trabajapp

**Versión:** 1.0
**Fecha:** Noviembre 2025
**Autor:** Barrio Rodrigo
**Base URL:** `http://localhost:3000/api`
**Formato de serialización:** JSON

---

## Índice

1. [Autenticación](#autenticación)
2. [Trabajadores](#trabajadores)
3. [Servicios](#servicios)
4. [Verificación](#verificación)
5. [Calificaciones](#calificaciones)
6. [Disputas](#disputas)
7. [Configuración de Trabajo](#configuración-de-trabajo)
8. [Agenda](#agenda)
9. [Administración](#administración)
10. [Notificaciones](#notificaciones)

---

## Autenticación

### 1. Registro de Usuario

**Endpoint:** `/auth/register`
**Método HTTP:** `POST`
**Formato de serialización:** JSON
**Autenticación requerida:** No

#### Cabeceras de entrada
```http
Content-Type: application/json
```

#### Cabeceras de salida
```http
Content-Type: application/json
```

#### Estructura de datos de entrada
```json
{
  "fullName": "string",
  "email": "string",
  "password": "string",
  "role": "cliente | trabajador",
  "trade": "string (opcional, solo para trabajadores)"
}
```

#### Estructura de datos de salida (caso exitoso - 201)
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "integer",
    "full_name": "string",
    "email": "string",
    "role": "string",
    "trade": "string | null"
  },
  "token": "string (JWT)"
}
```

#### Estructura de datos de salida (caso error - 400)
```json
{
  "message": "El email ya está registrado"
}
```

---

### 2. Login de Usuario

**Endpoint:** `/auth/login`  
**Método HTTP:** `POST`  
**Formato de serialización:** JSON
**Autenticación requerida:** No

#### Cabeceras de entrada
```http
Content-Type: application/json
```

#### Cabeceras de salida
```http
Content-Type: application/json
```

#### Estructura de datos de entrada
```json
{
  "email": "string",
  "password": "string"
}
```

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "message": "Login exitoso",
  "user": {
    "id": "integer",
    "full_name": "string",
    "email": "string",
    "role": "string",
    "trade": "string | null"
  },
  "token": "string (JWT)"
}
```

#### Estructura de datos de salida (caso error - 401)
```json
{
  "message": "Contraseña incorrecta"
}
```

#### Estructura de datos de salida (caso error - 404)
```json
{
  "message": "Usuario no encontrado"
}
```

---

## Trabajadores

### 3. Obtener Lista de Trabajadores

**Endpoint:** `/workers`  
**Método HTTP:** `GET`  
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token)

#### Cabeceras de entrada
```http
Authorization: Bearer {token}
```

#### Cabeceras de salida
```http
Content-Type: application/json
```

#### Parámetros de consulta (opcionales)
- `trade`: Filtrar por oficio
- `lat`: Latitud del cliente (para búsqueda cercana)
- `lng`: Longitud del cliente (para búsqueda cercana)

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "workers": [
    {
      "id": "integer",
      "full_name": "string",
      "email": "string",
      "trade": "string",
      "work_area": "string",
      "work_latitude": "float",
      "work_longitude": "float",
      "work_radius": "float",
      "average_rating": "float",
      "total_ratings": "integer"
    }
  ]
}
```

#### Estructura de datos de salida (caso error - 401)
```json
{
  "message": "Token inválido o expirado"
}
```

---

## Servicios

### 4. Crear Solicitud de Servicio

**Endpoint:** `/services`  
**Método HTTP:** `POST`  
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token - Cliente)

#### Cabeceras de entrada
```http
Content-Type: application/json
Authorization: Bearer {token}
```

#### Cabeceras de salida
```http
Content-Type: application/json
```

#### Estructura de datos de entrada
```json
{
  "title": "string",
  "description": "string",
  "worker_id": "integer",
  "scheduled_date": "string (ISO 8601)",
  "client_latitude": "float",
  "client_longitude": "float",
  "client_address": "string"
}
```

#### Estructura de datos de salida (caso exitoso - 201)
```json
{
  "message": "Solicitud de servicio creada exitosamente",
  "service": {
    "id": "integer",
    "title": "string",
    "description": "string",
    "status": "pending",
    "client_id": "integer",
    "worker_id": "integer",
    "scheduled_date": "string",
    "client_latitude": "float",
    "client_longitude": "float",
    "client_address": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

#### Estructura de datos de salida (caso error - 400)
```json
{
  "message": "Todos los campos son requeridos"
}
```

#### Estructura de datos de salida (caso error - 403)
```json
{
  "message": "Fuera de tu zona de trabajo"
}
```

---

### 5. Obtener Servicios del Cliente

**Endpoint:** `/services/client/:client_id`
**Método HTTP:** `GET`  
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token)

#### Cabeceras de entrada
```http
Authorization: Bearer {token}
```

#### Cabeceras de salida
```http
Content-Type: application/json
```

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "services": [
    {
      "id": "integer",
      "title": "string",
      "description": "string",
      "status": "string",
      "scheduled_date": "string",
      "client_address": "string",
      "worker": {
        "id": "integer",
        "full_name": "string",
        "trade": "string"
      },
      "verification_code": {
        "code": "string | null"
      }
    }
  ]
}
```

---

### 6. Obtener Servicios del Trabajador

**Endpoint:** `/services/worker/:worker_id`
**Método HTTP:** `GET`
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token)

#### Cabeceras de entrada
```http
Authorization: Bearer {token}
```

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "services": [
    {
      "id": "integer",
      "title": "string",
      "description": "string",
      "status": "string",
      "scheduled_date": "string",
      "client_address": "string",
      "client": {
        "id": "integer",
        "full_name": "string",
        "email": "string"
      }
    }
  ]
}
```

---

### 7. Aceptar Servicio

**Endpoint:** `/services/:id/accept`
**Método HTTP:** `PATCH`
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token - Trabajador)

#### Cabeceras de entrada
```http
Authorization: Bearer {token}
```

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "message": "Solicitud aceptada exitosamente",
  "service": {
    "id": "integer",
    "status": "accepted",
    "updatedAt": "string"
  }
}
```

#### Estructura de datos de salida (caso error - 404)
```json
{
  "message": "Servicio no encontrado"
}
```

---

### 8. Rechazar Servicio

**Endpoint:** `/services/:id/reject`
**Método HTTP:** `PATCH`
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token - Trabajador)

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "message": "Solicitud rechazada",
  "service": {
    "id": "integer",
    "status": "rejected"
  }
}
```

---

### 9. Actualizar Estado del Servicio

**Endpoint:** `/services/:id/status`
**Método HTTP:** `PATCH`
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token)

#### Cabeceras de entrada
```http
Content-Type: application/json
Authorization: Bearer {token}
```

#### Estructura de datos de entrada
```json
{
  "status": "in_progress | completed"
}
```

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "message": "Estado actualizado exitosamente",
  "service": {
    "id": "integer",
    "status": "string",
    "updatedAt": "string"
  }
}
```

---

## Verificación

### 10. Generar Código de Verificación

**Endpoint:** `/verification/generate`
**Método HTTP:** `POST`
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token - Trabajador)

#### Cabeceras de entrada
```http
Content-Type: application/json
Authorization: Bearer {token}
```

#### Estructura de datos de entrada
```json
{
  "service_id": "integer"
}
```

#### Estructura de datos de salida (caso exitoso - 201)
```json
{
  "message": "Código de verificación generado",
  "code": "string (6 dígitos)"
}
```

#### Estructura de datos de salida (caso error - 400)
```json
{
  "message": "El código ya fue generado para este servicio"
}
```

---

### 11. Verificar Código

**Endpoint:** `/verification/verify`
**Método HTTP:** `POST`
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token - Trabajador)

#### Cabeceras de entrada
```http
Content-Type: application/json
Authorization: Bearer {token}
```

#### Estructura de datos de entrada
```json
{
  "service_id": "integer",
  "code": "string (6 dígitos)"
}
```

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "message": "Código verificado exitosamente. Servicio completado.",
  "service": {
    "id": "integer",
    "status": "completed"
  }
}
```

#### Estructura de datos de salida (caso error - 400)
```json
{
  "message": "Código inválido"
}
```

---

## Calificaciones

### 12. Crear Calificación

**Endpoint:** `/ratings`
**Método HTTP:** `POST`
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token)

#### Cabeceras de entrada
```http
Content-Type: application/json
Authorization: Bearer {token}
```

#### Estructura de datos de entrada
```json
{
  "service_id": "integer",
  "rated_user_id": "integer",
  "rating": "integer (1-5)",
  "comment": "string (opcional)"
}
```

#### Estructura de datos de salida (caso exitoso - 201)
```json
{
  "message": "Calificación creada exitosamente",
  "rating": {
    "id": "integer",
    "service_id": "integer",
    "rater_id": "integer",
    "rated_user_id": "integer",
    "rating": "integer",
    "comment": "string | null",
    "createdAt": "string"
  }
}
```

#### Estructura de datos de salida (caso error - 400)
```json
{
  "message": "Ya calificaste a este usuario para este servicio"
}
```

---

### 13. Obtener Calificaciones de un Usuario

**Endpoint:** `/ratings/user/:user_id`
**Método HTTP:** `GET`
**Formato de serialización:** JSON
**Autenticación requerida:** No

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "ratings": [
    {
      "id": "integer",
      "rating": "integer",
      "comment": "string | null",
      "createdAt": "string",
      "rater": {
        "id": "integer",
        "full_name": "string"
      }
    }
  ],
  "average": "float",
  "total": "integer"
}
```

---

## Disputas

### 14. Crear Disputa

**Endpoint:** `/disputes`
**Método HTTP:** `POST`
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token - Cliente)

#### Cabeceras de entrada
```http
Content-Type: application/json
Authorization: Bearer {token}
```

#### Estructura de datos de entrada
```json
{
  "service_id": "integer",
  "reason": "string",
  "reported_by": "client | worker",
  "reported_against_user_id": "integer"
}
```

#### Estructura de datos de salida (caso exitoso - 201)
```json
{
  "message": "Disputa creada exitosamente",
  "dispute": {
    "id": "integer",
    "service_id": "integer",
    "reason": "string",
    "status": "abierta",
    "reported_by": "string",
    "reported_by_user_id": "integer",
    "reported_against_user_id": "integer",
    "createdAt": "string"
  }
}
```

---

### 15. Obtener Disputas del Cliente

**Endpoint:** `/disputes/client/:client_id`
**Método HTTP:** `GET`
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token)

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "disputes": [
    {
      "id": "integer",
      "reason": "string",
      "status": "string",
      "worker_response": "string | null",
      "admin_notes": "string | null",
      "createdAt": "string",
      "service": {
        "id": "integer",
        "title": "string"
      }
    }
  ]
}
```

---

### 16. Responder a Disputa (Trabajador)

**Endpoint:** `/disputes/:id/respond`
**Método HTTP:** `PATCH`
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token - Trabajador)

#### Cabeceras de entrada
```http
Content-Type: application/json
Authorization: Bearer {token}
```

#### Estructura de datos de entrada
```json
{
  "worker_response": "string"
}
```

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "message": "Descargo agregado exitosamente",
  "dispute": {
    "id": "integer",
    "worker_response": "string",
    "status": "en_revision",
    "updatedAt": "string"
  }
}
```

---

## Configuración de Trabajo

### 17. Configurar Zona de Trabajo

**Endpoint:** `/work-settings/zone`
**Método HTTP:** `POST`
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token - Trabajador)

#### Cabeceras de entrada
```http
Content-Type: application/json
Authorization: Bearer {token}
```

#### Estructura de datos de entrada
```json
{
  "work_latitude": "float",
  "work_longitude": "float",
  "work_address": "string",
  "work_radius": "float (en kilómetros)"
}
```

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "message": "Zona de trabajo actualizada exitosamente",
  "settings": {
    "work_latitude": "float",
    "work_longitude": "float",
    "work_address": "string",
    "work_radius": "float"
  }
}
```

---

### 18. Pausar/Reactivar Cuenta

**Endpoint:** `/work-settings/toggle-active`
**Método HTTP:** `PATCH`
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token - Trabajador)

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "message": "Cuenta reactivada | Cuenta pausada",
  "is_active": "boolean"
}
```

---

## Agenda

### 19. Obtener Agenda del Mes

**Endpoint:** `/agenda/month`
**Método HTTP:** `GET`
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token - Trabajador)

#### Parámetros de consulta
- `month`: Mes (1-12)
- `year`: Año

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "services": [
    {
      "id": "integer",
      "title": "string",
      "status": "string",
      "scheduled_date": "string",
      "client": {
        "full_name": "string"
      }
    }
  ],
  "blocks": [
    {
      "id": "integer",
      "date": "string",
      "reason": "string"
    }
  ]
}
```

---

### 20. Bloquear/Desbloquear Día

**Endpoint:** `/agenda/toggle-block`
**Método HTTP:** `POST`
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token - Trabajador)

#### Cabeceras de entrada
```http
Content-Type: application/json
Authorization: Bearer {token}
```

#### Estructura de datos de entrada
```json
{
  "date": "string (YYYY-MM-DD)",
  "reason": "string (opcional)"
}
```

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "message": "Día bloqueado | Bloqueo eliminado",
  "blocked": "boolean"
}
```

---

### 21. Configurar Horarios Semanales

**Endpoint:** `/agenda/schedule`
**Método HTTP:** `PATCH`
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token - Trabajador)

#### Cabeceras de entrada
```http
Content-Type: application/json
Authorization: Bearer {token}
```

#### Estructura de datos de entrada
```json
{
  "schedule": {
    "monday": {
      "enabled": "boolean",
      "start": "string (HH:MM)",
      "end": "string (HH:MM)"
    },
    "tuesday": {
      "enabled": "boolean",
      "start": "string",
      "end": "string"
    }
    // ... resto de días
  }
}
```

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "message": "Horarios actualizados exitosamente"
}
```

---

## Administración

### 22. Obtener Estadísticas del Sistema

**Endpoint:** `/admin/stats`
**Método HTTP:** `GET`
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token - Admin)

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "users": {
    "total": "integer",
    "clients": "integer",
    "workers": "integer"
  },
  "services": {
    "total": "integer",
    "pending": "integer",
    "completed": "integer"
  },
  "disputes": {
    "total": "integer",
    "open": "integer",
    "inReview": "integer"
  },
  "rating": {
    "average": "string"
  }
}
```

---

### 23. Obtener Todas las Disputas (Admin)

**Endpoint:** `/admin/disputes`
**Método HTTP:** `GET`
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token - Admin)

#### Parámetros de consulta (opcionales)
- `status`: Filtrar por estado

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "disputes": [
    {
      "id": "integer",
      "reason": "string",
      "status": "string",
      "worker_response": "string | null",
      "admin_notes": "string | null",
      "createdAt": "string",
      "service": {
        "id": "integer",
        "title": "string"
      },
      "reporter": {
        "id": "integer",
        "full_name": "string",
        "role": "string"
      },
      "reportedUser": {
        "id": "integer",
        "full_name": "string",
        "role": "string"
      }
    }
  ]
}
```

---

### 24. Resolver Disputa (Admin)

**Endpoint:** `/admin/disputes/:dispute_id/resolve`
**Método HTTP:** `PATCH`
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token - Admin)

#### Cabeceras de entrada
```http
Content-Type: application/json
Authorization: Bearer {token}
```

#### Estructura de datos de entrada
```json
{
  "resolution": "resuelta_cliente | resuelta_trabajador | rechazada",
  "admin_notes": "string (opcional)"
}
```

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "message": "Disputa resuelta exitosamente",
  "dispute": {
    "id": "integer",
    "status": "string",
    "admin_notes": "string | null",
    "resolved_by": "integer",
    "updatedAt": "string"
  }
}
```

---

### 25. Obtener Todos los Usuarios (Admin)

**Endpoint:** `/admin/users`
**Método HTTP:** `GET`
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token - Admin)

#### Parámetros de consulta (opcionales)
- `role`: Filtrar por rol
- `search`: Buscar por nombre o email

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "users": [
    {
      "id": "integer",
      "full_name": "string",
      "email": "string",
      "role": "string",
      "trade": "string | null",
      "is_active": "boolean",
      "createdAt": "string"
    }
  ]
}
```

---

### 26. Obtener Detalles de Usuario (Admin)

**Endpoint:** `/admin/users/:user_id`
**Método HTTP:** `GET`
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token - Admin)

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "user": {
    "id": "integer",
    "full_name": "string",
    "email": "string",
    "role": "string",
    "trade": "string | null",
    "work_area": "string | null",
    "work_radius": "float | null",
    "is_active": "boolean",
    "createdAt": "string"
  },
  "stats": {
    "completedServices": "integer",
    "averageRating": "string",
    "totalServices": "integer"
  }
}
```

---

### 27. Activar/Desactivar Usuario (Admin)

**Endpoint:** `/admin/users/:user_id/toggle-status`
**Método HTTP:** `PATCH`
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token - Admin)

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "message": "Usuario activado exitosamente | Usuario desactivado exitosamente",
  "user": {
    "id": "integer",
    "full_name": "string",
    "is_active": "boolean"
  }
}
```

---

## Notificaciones

### 28. Obtener Notificaciones del Usuario

**Endpoint:** `/notifications`
**Método HTTP:** `GET`
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token)

#### Parámetros de consulta (opcionales)
- `limit`: Número de notificaciones (default: 20)
- `unread_only`: Solo no leídas (true/false)

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "notifications": [
    {
      "id": "integer",
      "type": "string",
      "title": "string",
      "message": "string",
      "link": "string | null",
      "is_read": "boolean",
      "related_id": "integer | null",
      "createdAt": "string"
    }
  ],
  "unreadCount": "integer"
}
```

---

### 29. Marcar Notificación como Leída

**Endpoint:** `/notifications/:id/read`
**Método HTTP:** `PATCH`
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token)

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "message": "Notificación marcada como leída",
  "notification": {
    "id": "integer",
    "is_read": true
  }
}
```

---

### 30. Marcar Todas las Notificaciones como Leídas

**Endpoint:** `/notifications/read-all`
**Método HTTP:** `PATCH`
**Formato de serialización:** JSON
**Autenticación requerida:** Sí (JWT Token)

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "message": "Todas las notificaciones marcadas como leídas"
}
```

---

## Códigos de Estado HTTP

La API utiliza los siguientes códigos de estado:

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Petición exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Error en los datos enviados |
| 401 | Unauthorized | Token inválido o expirado |
| 403 | Forbidden | Sin permisos para esta acción |
| 404 | Not Found | Recurso no encontrado |
| 500 | Internal Server Error | Error del servidor |

---

## Autenticación

La API utiliza **JSON Web Tokens (JWT)** para autenticación.

### Obtener un Token
1. Registrarse con `/auth/register` o
2. Iniciar sesión con `/auth/login`

### Usar el Token
Incluir el token en la cabecera de cada petición:
```http
Authorization: Bearer {tu_token_jwt}
```

### Expiración
Los tokens expiran en **24 horas**. Después de esto, deberás iniciar sesión nuevamente.

---

## Ejemplos de Uso

### Ejemplo 1: Registrar un Cliente

**Request:**
```http
POST /api/auth/register HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "fullName": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "role": "cliente"
}
```

**Response (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 1,
    "full_name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "cliente"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Ejemplo 2: Crear Solicitud de Servicio

**Request:**
```http
POST /api/services HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "title": "Reparación de cañería",
  "description": "Cañería rota en el baño principal",
  "worker_id": 2,
  "scheduled_date": "2024-11-20T10:00:00Z",
  "client_latitude": -34.6037,
  "client_longitude": -58.3816,
  "client_address": "Av. Corrientes 1234, CABA"
}
```

**Response (201):**
```json
{
  "message": "Solicitud de servicio creada exitosamente",
  "service": {
    "id": 1,
    "title": "Reparación de cañería",
    "description": "Cañería rota en el baño principal",
    "status": "pending",
    "client_id": 1,
    "worker_id": 2,
    "scheduled_date": "2024-11-20T10:00:00.000Z",
    "client_latitude": -34.6037,
    "client_longitude": -58.3816,
    "client_address": "Av. Corrientes 1234, CABA"
  }
}
```

---

## Notas Adicionales

- Todas las fechas están en formato **ISO 8601**
- Todas las respuestas son en formato **JSON**
- Las coordenadas geográficas usan el sistema **WGS84**
- Los radios de cobertura están en **kilómetros**
- Los códigos de verificación son **numéricos de 6 dígitos**
- Las calificaciones van de **1 a 5 estrellas**

---

**Fin de la documentación**