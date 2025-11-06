# Especificación de Requerimientos - Trabajapp

**Versión:** 1.0  
**Fecha:** 20 de Septiembre de 2024  
**Responsable:** Barrio Rodrigo

---

## 1. Requerimientos Funcionales

### RF-001: Sistema de Autenticación
**Prioridad:** Urgente
**Estado:** Completado
**Descripción:** El sistema debe permitir el registro y login de usuarios (clientes y trabajadores).

**Criterios de aceptación:**
- El usuario puede registrarse con email y contraseña
- El sistema valida que el email no esté duplicado
- Las contraseñas se almacenan encriptadas con bcrypt
- El login genera un token JWT válido por 24 horas
- El sistema diferencia entre roles (cliente, trabajador, admin)

---

### RF-002: Gestión de Perfiles
**Prioridad:** Muy Alta
**Estado:** Completado
**Descripción:** Los trabajadores deben poder crear y editar su perfil profesional.

**Criterios de aceptación:**
- El trabajador puede indicar su oficio
- Puede agregar matrícula/certificación
- Puede subir foto de perfil (futuro)
- La información es visible para los clientes

---

### RF-003: Creación de Solicitudes con GPS
**Prioridad:** Muy Alta
**Estado:** Completado
**Descripción:** Los clientes deben poder buscar trabajadores y crear solicitudes de servicio con detección automática de ubicación.

**Criterios de aceptación:**
- El sistema detecta la ubicación del cliente automáticamente
- El cliente puede ver trabajadores en un mapa interactivo
- El cliente puede crear una solicitud indicando título, descripción y fecha
- La solicitud se crea con estado "pending"
- El trabajador recibe notificación de la nueva solicitud

---

### RF-004: Aceptación de Solicitudes
**Prioridad:** Muy Alta
**Estado:** Completado
**Descripción:** Los trabajadores deben poder aceptar o rechazar solicitudes de clientes.

**Criterios de aceptación:**
- El trabajador ve solo solicitudes dentro de su zona de trabajo
- Puede aceptar una solicitud (cambia a estado "accepted")
- Puede rechazar una solicitud (cambia a estado "rejected")
- El cliente recibe notificación del estado actualizado

---

### RF-005: Agenda y Disponibilidad
**Prioridad:** Alta
**Estado:** Completado
**Descripción:** El sistema debe ofrecer una agenda de disponibilidad y permitir visitas programadas.

**Criterios de aceptación:**
- El trabajador puede configurar horarios semanales
- Puede bloquear días específicos
- Ve un calendario mensual con sus trabajos programados
- Los trabajos aceptados aparecen en el calendario

---

### RF-006: Verificación con Código Único
**Prioridad:** Alta
**Estado:** Completado
**Descripción:** Los trabajos deben cerrarse con doble verificación mediante código único.

**Criterios de aceptación:**
- Al completar el trabajo, se genera un código de 6 dígitos
- El código se muestra al cliente
- El trabajador ingresa el código para confirmar
- Solo con código correcto se marca como "completed"
- El código expira en 24 horas

---

### RF-007: Sistema de Calificación Bilateral
**Prioridad:** Media
**Estado:** Completado
**Descripción:** El sistema debe implementar calificación y reputación bilateral entre cliente y trabajador.

**Criterios de aceptación:**
- Ambas partes pueden calificar con estrellas (1-5)
- Se puede agregar comentario opcional
- Las calificaciones son visibles en los perfiles
- Se calcula promedio de calificaciones

---

### RF-008: Garantía Post-Servicio
**Prioridad:** Media
**Estado:** Completado
**Descripción:** Los trabajadores deben poder ofrecer una garantía post-servicio con período de reclamo.

**Criterios de aceptación:**
- El sistema permite reportar problemas (disputas)
- El cliente puede adjuntar evidencia (fotos/videos - futuro)
- El trabajador puede responder con su descargo
- Un administrador puede resolver la disputa

---

### RF-009: Registro de Trabajadores Subordinados
**Prioridad:** Baja
**Estado:** Pendiente
**Descripción:** El sistema debe permitir el registro de trabajadores subordinados a un profesional matriculado.

**Criterios de aceptación:**
- (Por implementar en versión futura)

---

### RF-010: Visitas de Inspección
**Prioridad:** Baja
**Estado:** Pendiente
**Descripción:** El sistema debe permitir que trabajadores realicen visitas de inspección.

**Criterios de aceptación:**
- (Por implementar en versión futura)

---

### RF-011: Notificaciones en Tiempo Real
**Prioridad:** Baja
**Estado:** Completado (Básico)  
**Descripción:** El sistema debe enviar notificaciones push en tiempo real.

**Criterios de aceptación:**
- El sistema crea notificaciones en la base de datos
- Se muestran en el centro de notificaciones
- Badge con contador de no leídas
- Se actualizan cada 30 segundos

---

## 2. Requerimientos No Funcionales

### RNF-001: Seguridad
- Las contraseñas deben estar hasheadas con bcrypt
- Uso de JWT para autenticación
- Validación de datos en backend
- Protección contra inyección SQL (usando Sequelize)

### RNF-002: Usabilidad
- Interfaz responsive (funciona en móviles)
- Diseño intuitivo con Bootstrap 5
- Mensajes de error claros
- Feedback visual de acciones

### RNF-003: Rendimiento
- Carga de página en menos de 3 segundos
- Búsquedas eficientes con índices en BD
- Caché de mapas para mejorar velocidad

### RNF-004: Escalabilidad
- Arquitectura modular (frontend/backend separados)
- Base de datos relacional normalizada
- API RESTful bien estructurada

---

## 3. Casos de Uso Principales

### CU-001: Cliente busca y contrata trabajador
1. Cliente inicia sesión
2. Sistema detecta ubicación automáticamente
3. Cliente ve trabajadores en mapa
4. Cliente crea solicitud
5. Trabajador recibe notificación
6. Trabajador acepta solicitud
7. Trabajador completa trabajo
8. Sistema genera código
9. Cliente entrega código al trabajador
10. Trabajador confirma con código
11. Ambos se califican mutuamente

### CU-002: Trabajador gestiona su zona y agenda
1. Trabajador inicia sesión
2. Configura su zona de trabajo en mapa
3. Define radio de cobertura
4. Configura horarios semanales
5. Bloquea días específicos
6. Ve solicitudes dentro de su zona
7. Acepta/rechaza solicitudes

### CU-003: Resolución de disputa
1. Cliente reporta problema
2. Sistema crea disputa
3. Trabajador recibe notificación
4. Trabajador agrega descargo
5. Administrador revisa ambas versiones
6. Administrador resuelve a favor de una parte
7. Ambas partes reciben notificación

---

## 4. Modelo de Datos

### Tablas Principales:
- `users`: Usuarios del sistema (clientes, trabajadores, admins)
- `services`: Solicitudes de servicio
- `verification_codes`: Códigos de verificación
- `ratings`: Calificaciones bilaterales
- `disputes`: Reportes de problemas
- `availability_blocks`: Días bloqueados por trabajadores
- `notifications`: Notificaciones del sistema

---

## 5. Arquitectura del Sistema
```
┌─────────────┐
│   Frontend  │  HTML, CSS, JS, Bootstrap
│  (Cliente)  │  Google Maps API
└──────┬──────┘
       │ HTTP/REST
       │
┌──────▼──────┐
│   Backend   │  Node.js + Express
│     API     │  JWT Auth
└──────┬──────┘
       │ Sequelize ORM
       │
┌──────▼──────┐
│    MySQL    │  Base de Datos
│  Relacional │
└─────────────┘
```

---

## 6. Estado Actual del Proyecto

### Completado:
Autenticación y usuarios
Gestión de servicios
Verificación con código
Calificaciones bilaterales
Sistema de disputas
Zona de trabajo con mapas
Agenda y calendario
Panel de administración
Notificaciones básicas

### Pendiente (Versión Futura):
Chat en tiempo real
Pagos integrados
Trabajadores subordinados
Videos/fotos en disputas
