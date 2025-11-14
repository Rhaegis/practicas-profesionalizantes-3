# Documentación de la WebAPI - Trabajapp

**Versión:** 1.1
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

### 3. Crear Administrador (Temporal)

**Endpoint:** `/auth/create-admin`  
**Método HTTP:** `POST`  
**Formato de serialización:** JSON  
**Autenticación requerida:** No

⚠️ **NOTA:** Este endpoint es temporal y debe ser eliminado en producción.

#### Cabeceras de entrada
```http
Content-Type: application/json
```

#### Estructura de datos de entrada
```json
{
  "fullName": "string",
  "email": "string",
  "password": "string"
}
```

#### Estructura de datos de salida (caso exitoso - 201)
```json
{
  "message": "Administrador creado exitosamente",
  "user": {
    "id": "integer",
    "full_name": "string",
    "email": "string",
    "role": "admin"
  },
  "token": "string (JWT)"
}
```

---

## Trabajadores

### 4. Obtener Trabajadores Cercanos

**Endpoint:** `/workers/nearby`  
**Método HTTP:** `GET`  
**Formato de serialización:** JSON  
**Autenticación requerida:** No

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

---

## Servicios

### 5. Crear Solicitud de Servicio

**Endpoint:** `/services`  
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

---

### 6. Obtener Mis Solicitudes (Cliente)

**Endpoint:** `/services/my-requests`  
**Método HTTP:** `GET`  
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token - Cliente)

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

### 7. Obtener Mis Trabajos (Trabajador)

**Endpoint:** `/services/my-jobs`  
**Método HTTP:** `GET`  
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token - Trabajador)

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

### 8. Obtener Todos los Servicios

**Endpoint:** `/services/all`  
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
      "client_latitude": "float",
      "client_longitude": "float",
      "client": {
        "id": "integer",
        "full_name": "string"
      },
      "worker": {
        "id": "integer",
        "full_name": "string"
      }
    }
  ]
}
```

---

### 9. Obtener Servicios Cercanos (Trabajador)

**Endpoint:** `/services/nearby`  
**Método HTTP:** `GET`  
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token - Trabajador)

**Descripción:** Obtiene servicios pendientes que están dentro del radio de cobertura del trabajador.

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
      "status": "pending",
      "scheduled_date": "string",
      "client_address": "string",
      "client_latitude": "float",
      "client_longitude": "float",
      "distance": "float (km)",
      "client": {
        "id": "integer",
        "full_name": "string"
      }
    }
  ]
}
```

---

### 10. Aceptar Servicio

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

---

### 11. Cancelar Servicio

**Endpoint:** `/services/:id/cancel`  
**Método HTTP:** `PATCH`  
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token - Cliente o Trabajador)

#### Cabeceras de entrada
```http
Authorization: Bearer {token}
```

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "message": "Servicio cancelado exitosamente",
  "service": {
    "id": "integer",
    "status": "cancelled",
    "updatedAt": "string"
  }
}
```

---

### 12. Actualizar Estado del Servicio

**Endpoint:** `/services/:id/status`  
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

### 13. Generar Código de Verificación

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

---

### 14. Verificar Código

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

---

### 15. Obtener Código Activo

**Endpoint:** `/verification/code/:service_id`  
**Método HTTP:** `GET`  
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token - Cliente)

**Descripción:** Permite al cliente ver el código de verificación activo para dárselo al trabajador.

#### Cabeceras de entrada
```http
Authorization: Bearer {token}
```

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "code": "string (6 dígitos)",
  "service_id": "integer",
  "expires_at": "string | null"
}
```

#### Estructura de datos de salida (caso error - 404)
```json
{
  "message": "No hay código de verificación activo para este servicio"
}
```

---

## Calificaciones

### 16. Crear Calificación

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

---

### 17. Obtener Calificaciones de un Usuario

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

### 18. Obtener Promedio de Calificación

**Endpoint:** `/ratings/user/:user_id/average`  
**Método HTTP:** `GET`  
**Formato de serialización:** JSON  
**Autenticación requerida:** No

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "user_id": "integer",
  "average": "float",
  "total": "integer"
}
```

---

### 19. Verificar si Puede Calificar

**Endpoint:** `/ratings/can-rate/:service_id`  
**Método HTTP:** `GET`  
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token)

**Descripción:** Verifica si el usuario puede calificar un servicio específico.

#### Cabeceras de entrada
```http
Authorization: Bearer {token}
```

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "canRate": "boolean",
  "reason": "string | null"
}
```

---

## Disputas

### 20. Crear Disputa

**Endpoint:** `/disputes`  
**Método HTTP:** `POST`  
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token - Cliente o Trabajador)

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
  "evidence_url": "string | null (opcional)"
}
```

**NOTA:** El sistema determina automáticamente:
- Quién reporta (`reported_by`: client o worker)
- Contra quién se reporta (`reported_against_user_id`)

#### Estructura de datos de salida (caso exitoso - 201)
```json
{
  "message": "Disputa creada exitosamente",
  "dispute": {
    "id": "integer",
    "service_id": "integer",
    "reported_by": "client | worker",
    "reported_by_user_id": "integer",
    "reported_against_user_id": "integer",
    "reason": "string",
    "status": "abierta",
    "createdAt": "string"
  }
}
```

---

### 21. Responder a Disputa

**Endpoint:** `/disputes/:dispute_id/response`  
**Método HTTP:** `PATCH`  
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token - Trabajador)

**Descripción:** Permite al trabajador agregar su descargo a una disputa creada por el cliente.

#### Cabeceras de entrada
```http
Content-Type: application/json
Authorization: Bearer {token}
```

#### Estructura de datos de entrada
```json
{
  "worker_response": "string",
  "worker_evidence_url": "string | null (opcional)"
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

### 22. Responder a Disputa (Cliente)

**Endpoint:** `/disputes/:dispute_id/client-response`  
**Método HTTP:** `POST`  
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token - Cliente)

**Descripción:** Permite al cliente responder a una disputa creada por el trabajador.

#### Cabeceras de entrada
```http
Content-Type: application/json
Authorization: Bearer {token}
```

#### Estructura de datos de entrada
```json
{
  "client_response": "string",
  "client_evidence_url": "string | null (opcional)"
}
```

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "message": "Respuesta agregada exitosamente",
  "dispute": {
    "id": "integer",
    "worker_response": "string",
    "status": "en_revision",
    "updatedAt": "string"
  }
}
```

**NOTA:** La respuesta del cliente también se almacena en el campo `worker_response` para mantener compatibilidad con el modelo de base de datos.

---

### 23. Obtener Mis Disputas

**Endpoint:** `/disputes/my-disputes`  
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
  "disputes": [
    {
      "id": "integer",
      "service_id": "integer",
      "reason": "string",
      "status": "abierta | en_revision | resuelta_cliente | resuelta_trabajador | rechazada",
      "reported_by": "client | worker",
      "worker_response": "string | null",
      "admin_notes": "string | null",
      "createdAt": "string",
      "updatedAt": "string",
      "service": {
        "id": "integer",
        "title": "string",
        "description": "string"
      },
      "reporter": {
        "id": "integer",
        "full_name": "string"
      },
      "reportedUser": {
        "id": "integer",
        "full_name": "string"
      }
    }
  ]
}
```

---

### 24. Obtener Detalles de una Disputa

**Endpoint:** `/disputes/:dispute_id`  
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
  "dispute": {
    "id": "integer",
    "service_id": "integer",
    "reason": "string",
    "status": "string",
    "reported_by": "client | worker",
    "worker_response": "string | null",
    "admin_notes": "string | null",
    "createdAt": "string",
    "updatedAt": "string",
    "service": {
      "id": "integer",
      "title": "string",
      "description": "string",
      "status": "string",
      "client_id": "integer",
      "worker_id": "integer"
    },
    "reporter": {
      "id": "integer",
      "full_name": "string",
      "email": "string"
    },
    "reportedUser": {
      "id": "integer",
      "full_name": "string",
      "email": "string"
    }
  }
}
```

---

## Configuración de Trabajo

### 25. Obtener Configuración de Trabajo

**Endpoint:** `/work-settings`  
**Método HTTP:** `GET`  
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token - Trabajador)

#### Cabeceras de entrada
```http
Authorization: Bearer {token}
```

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "settings": {
    "id": "integer",
    "work_latitude": "float | null",
    "work_longitude": "float | null",
    "work_address": "string | null",
    "work_radius": "float | null",
    "is_immediately_available": "boolean",
    "is_active": "boolean",
    "weekly_schedule": "object | null"
  }
}
```

---

### 26. Actualizar Configuración de Trabajo

**Endpoint:** `/work-settings`  
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
  "work_latitude": "float (opcional)",
  "work_longitude": "float (opcional)",
  "work_address": "string (opcional)",
  "work_radius": "float (opcional)"
}
```

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "message": "Configuración actualizada exitosamente",
  "settings": {
    "work_latitude": "float",
    "work_longitude": "float",
    "work_address": "string",
    "work_radius": "float"
  }
}
```

---

### 27. Toggle Disponibilidad Inmediata

**Endpoint:** `/work-settings/toggle-availability`  
**Método HTTP:** `PATCH`  
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token - Trabajador)

**Descripción:** Activa/desactiva la disponibilidad inmediata del trabajador para aceptar trabajos urgentes.

#### Cabeceras de entrada
```http
Authorization: Bearer {token}
```

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "message": "Disponibilidad inmediata activada | Disponibilidad inmediata desactivada",
  "is_immediately_available": "boolean"
}
```

---

### 28. Toggle Estado de Cuenta

**Endpoint:** `/work-settings/toggle-status`  
**Método HTTP:** `PATCH`  
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token - Trabajador)

**Descripción:** Activa/pausa la cuenta del trabajador (visible/invisible en búsquedas).

#### Cabeceras de entrada
```http
Authorization: Bearer {token}
```

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "message": "Cuenta reactivada | Cuenta pausada",
  "is_active": "boolean"
}
```

---

## Agenda

### 29. Obtener Agenda del Mes

**Endpoint:** `/agenda/month`  
**Método HTTP:** `GET`  
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token - Trabajador)

#### Cabeceras de entrada
```http
Authorization: Bearer {token}
```

#### Parámetros de consulta
- `month`: Mes (1-12)
- `year`: Año (YYYY)

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
      "date": "string (YYYY-MM-DD)",
      "reason": "string"
    }
  ]
}
```

---

### 30. Obtener Horarios Semanales

**Endpoint:** `/agenda/schedule`  
**Método HTTP:** `GET`  
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token - Trabajador)

#### Cabeceras de entrada
```http
Authorization: Bearer {token}
```

#### Estructura de datos de salida (caso exitoso - 200)
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

---

### 31. Actualizar Horarios Semanales

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
  "message": "Horarios actualizados exitosamente",
  "schedule": {
    "monday": { "enabled": true, "start": "09:00", "end": "18:00" }
    // ... resto de dias
  }
}
```

---

### 32. Bloquear/Desbloquear Fecha

**Endpoint:** `/agenda/toggle-block`  
**Método HTTP:** `POST`  
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token - Trabajador)

**Descripción:** Bloquea o desbloquea una fecha específica en la agenda del trabajador.

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
  "message": "Día bloqueado exitosamente | Bloqueo eliminado exitosamente",
  "blocked": "boolean",
  "block": {
    "id": "integer",
    "date": "string",
    "reason": "string"
  } | null
}
```

---

### 33. Obtener Estadísticas de Agenda

**Endpoint:** `/agenda/stats`  
**Método HTTP:** `GET`  
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token - Trabajador)

#### Cabeceras de entrada
```http
Authorization: Bearer {token}
```

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "stats": {
    "pendingServices": "integer",
    "upcomingServices": "integer",
    "blockedDays": "integer",
    "nextService": {
      "id": "integer",
      "title": "string",
      "scheduled_date": "string"
    } | null
  }
}
```

---

## Administración

### 34. Obtener Estadísticas del Sistema

**Endpoint:** `/admin/stats`  
**Método HTTP:** `GET`  
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token - Admin)

#### Cabeceras de entrada
```http
Authorization: Bearer {token}
```

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

### 35. Obtener Todas las Disputas (Admin)

**Endpoint:** `/admin/disputes`  
**Método HTTP:** `GET`  
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token - Admin)

#### Cabeceras de entrada
```http
Authorization: Bearer {token}
```

#### Parámetros de consulta (opcionales)
- `status`: Filtrar por estado

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "disputes": [
    {
      "id": "integer",
      "service_id": "integer",
      "reason": "string",
      "status": "string",
      "reported_by": "client | worker",
      "worker_response": "string | null",
      "admin_notes": "string | null",
      "createdAt": "string",
      "service": {
        "id": "integer",
        "title": "string",
        "description": "string"
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
      },
      "resolver": {
        "id": "integer",
        "full_name": "string"
      } | null
    }
  ]
}
```

---

### 36. Resolver Disputa (Admin)

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

### 37. Obtener Todos los Usuarios (Admin)

**Endpoint:** `/admin/users`  
**Método HTTP:** `GET`  
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token - Admin)

#### Cabeceras de entrada
```http
Authorization: Bearer {token}
```

#### Parámetros de consulta (opcionales)
- `role`: Filtrar por rol (`cliente`, `trabajador`)
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

### 38. Obtener Detalles de Usuario (Admin)

**Endpoint:** `/admin/users/:user_id`  
**Método HTTP:** `GET`  
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token - Admin)

#### Cabeceras de entrada
```http
Authorization: Bearer {token}
```

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "user": {
    "id": "integer",
    "full_name": "string",
    "email": "string",
    "role": "string",
    "trade": "string | null",
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

### 39. Activar/Desactivar Usuario (Admin)

**Endpoint:** `/admin/users/:user_id/toggle-status`  
**Método HTTP:** `PATCH`  
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token - Admin)

#### Cabeceras de entrada
```http
Authorization: Bearer {token}
```

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

### 40. Obtener Notificaciones del Usuario

**Endpoint:** `/notifications`  
**Método HTTP:** `GET`  
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token)

#### Cabeceras de entrada
```http
Authorization: Bearer {token}
```

#### Parámetros de consulta (opcionales)
- `limit`: Número de notificaciones (default: 20)
- `unread_only`: Solo no leídas (`true`/`false`)

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

### 41. Obtener Contador de No Leídas

**Endpoint:** `/notifications/unread-count`  
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
  "unreadCount": "integer"
}
```

---

### 42. Marcar Notificación como Leída

**Endpoint:** `/notifications/:id/read`  
**Método HTTP:** `PATCH`  
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token)

#### Cabeceras de entrada
```http
Authorization: Bearer {token}
```

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

### 43. Marcar Todas las Notificaciones como Leídas

**Endpoint:** `/notifications/read-all`  
**Método HTTP:** `PATCH`  
**Formato de serialización:** JSON  
**Autenticación requerida:** Sí (JWT Token)

#### Cabeceras de entrada
```http
Authorization: Bearer {token}
```

#### Estructura de datos de salida (caso exitoso - 200)
```json
{
  "message": "Todas las notificaciones marcadas como leídas"
}
```

---

## Tipos de Notificaciones

| Tipo | Descripción | Cuándo se genera |
|------|-------------|------------------|
| `service_request` | Nueva solicitud de servicio | Trabajador recibe solicitud |
| `service_accepted` | Servicio aceptado | Cliente cuando trabajador acepta |
| `service_rejected` | Servicio rechazado | Cliente cuando trabajador rechaza |
| `service_completed` | Servicio completado | Cliente cuando trabajador completa |
| `rating_received` | Nueva calificación recibida | Cualquier usuario recibe rating |
| `dispute_created` | Disputa creada contra ti | Usuario reportado |
| `dispute_response` | Respuesta a tu disputa | Usuario que reportó |
| `dispute_resolved` | Disputa resuelta | Ambas partes involucradas |
| `verification_code` | Código de verificación generado | Cliente recibe código |

---

## Estados del Sistema

### Estados de Servicios

| Estado | Descripción |
|--------|-------------|
| `pending` | Servicio pendiente de aceptación |
| `accepted` | Servicio aceptado por el trabajador |
| `rejected` | Servicio rechazado por el trabajador |
| `in_progress` | Servicio en progreso |
| `completed` | Servicio completado |
| `cancelled` | Servicio cancelado |

### Estados de Disputas

| Estado | Descripción |
|--------|-------------|
| `abierta` | Disputa creada, esperando respuesta de la otra parte |
| `en_revision` | Ambas partes respondieron, esperando decisión de administrador |
| `resuelta_cliente` | Administrador resolvió a favor del cliente |
| `resuelta_trabajador` | Administrador resolvió a favor del trabajador |
| `rechazada` | Administrador rechazó la disputa |

---

## Códigos de Estado HTTP

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
```http
Authorization: Bearer {tu_token_jwt}
```

### Expiración
Los tokens expiran en **24 horas**.

---

## Notas Importantes

- Todas las fechas están en formato **ISO 8601**
- Todas las respuestas son en formato **JSON**
- Las coordenadas geográficas usan el sistema **WGS84**
- Los códigos de verificación son **numéricos de 6 dígitos**
- Las calificaciones van de **1 a 5 estrellas**
- El campo `worker_response` en disputas almacena respuestas de ambas partes
- Los radios de cobertura están en **kilómetros**

---

**Fin de la documentación v1.1**