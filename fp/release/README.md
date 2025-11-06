# 🧪 Guía de Pruebas - Trabajapp

---

## 🔐 Credenciales de Prueba

**IMPORTANTE:** Todos los usuarios de prueba tienen la contraseña: `test123`

### Administrador:
- **Email:** `admin@trabajapp.com`
- **Password:** `test123`

### Clientes:
- **Email:** `juan@cliente.com` | **Password:** `test123`
- **Email:** `maria@cliente.com` | **Password:** `test123`
- **Email:** `carlos@cliente.com` | **Password:** `test123`

### Trabajadores:
- **Roberto Martínez** (Plomero)
  - **Email:** `roberto@trabajador.com`
  - **Password:** `test123`
  
- **Ana López** (Electricista)
  - **Email:** `ana@trabajador.com`
  - **Password:** `test123`
  
- **Diego Fernández** (Carpintero)
  - **Email:** `diego@trabajador.com`
  - **Password:** `test123`
  
- **Laura Sánchez** (Pintor)
  - **Email:** `laura@trabajador.com`
  - **Password:** `test123`

---

## 📋 Checklist de Funcionalidades a Probar

### 1️⃣ **Sistema de Autenticación**

**Como Cliente:**
1. Ir a `login.html`
2. Login con: `juan@cliente.com` / `test123`
3. Verificar redirección a `dashboard-client.html`
4. Verificar mensaje de bienvenida con nombre del usuario

**Como Trabajador:**
1. Login con: `roberto@trabajador.com` / `test123`
2. Verificar redirección a `dashboard-worker.html`
3. Verificar que muestra estadísticas (trabajos completados, calificación)

**Como Admin:**
1. Login con: `admin@trabajapp.com` / `test123`
2. Verificar redirección a `dashboard-admin.html`
3. Verificar métricas globales del sistema

✅ **Resultado esperado:** Login exitoso con redirección según rol

---

### 2️⃣ **Buscar Trabajadores y Crear Solicitud** (Cliente)

**Login como:** `juan@cliente.com` / `test123`

1. En el dashboard, clic en "Nueva solicitud de servicio"
2. Observar mapa con trabajadores cercanos (marcadores)
3. Seleccionar un trabajador en el mapa
4. Llenar formulario:
   - Título: "Prueba de solicitud"
   - Descripción: "Servicio de prueba"
   - Fecha: Elegir fecha futura
5. Clic en "Enviar solicitud"

✅ **Resultado esperado:** 
- Modal se cierra
- Aparece notificación de éxito
- La solicitud aparece en "Mis Solicitudes" con estado "Pendiente"

---

### 3️⃣ **Ver y Aceptar Solicitudes** (Trabajador)

**Login como:** `roberto@trabajador.com` / `test123`

1. Ir a "Solicitudes Disponibles" (sidebar)
2. Ver la solicitud creada en el paso anterior
3. Verificar que muestra: título, descripción, distancia, cliente
4. Clic en "Aceptar Solicitud"

✅ **Resultado esperado:**
- La solicitud cambia de estado a "Aceptado"
- Aparece en "Mis Trabajos"
- El cliente recibe notificación

**Ahora volver como cliente:**
1. Login como `juan@cliente.com`
2. Ir a "Mis Solicitudes"
3. Verificar que el estado cambió a "Aceptado"
4. Ver el botón "Ver código" (aún deshabilitado)

---

### 4️⃣ **Completar Trabajo con Código de Verificación**

**Como Trabajador:** `roberto@trabajador.com`

1. Ir a "Mis Trabajos"
2. Encontrar el trabajo aceptado
3. Clic en "Iniciar Trabajo"
4. Ver que el estado cambió a "En Progreso"
5. Clic en "Completar Trabajo"
6. Copiar el código de 6 dígitos que aparece

**Como Cliente:** `juan@cliente.com`

1. Ir a "Mis Solicitudes"
2. Encontrar el trabajo
3. Clic en "Ver código"
4. Ver el código de 6 dígitos
5. Compartir este código con el trabajador

**Como Trabajador:** `roberto@trabajador.com`

1. En "Mis Trabajos", clic en "Verificar código"
2. Ingresar el código de 6 dígitos
3. Clic en "Verificar"

✅ **Resultado esperado:**
- El trabajo cambia a estado "Completado"
- Ambas partes pueden calificarse mutuamente

---

### 5️⃣ **Sistema de Calificaciones Bilaterales**

**Como Cliente:** `juan@cliente.com`

1. Ir a "Mis Solicitudes"
2. Encontrar el trabajo completado
3. Clic en "Calificar"
4. Elegir estrellas (1-5)
5. Escribir comentario
6. Enviar calificación

**Como Trabajador:** `roberto@trabajador.com`

1. Ir a "Mis Trabajos"
2. Encontrar el trabajo completado
3. Clic en "Calificar Cliente"
4. Elegir estrellas y comentario
5. Enviar

✅ **Resultado esperado:**
- Las calificaciones aparecen en los perfiles
- El promedio se actualiza
- Ambas partes reciben notificación

---

### 6️⃣ **Sistema de Disputas**

**Como Cliente:** `maria@cliente.com`

1. Login y ir a "Mis Solicitudes"
2. Buscar un servicio completado o en progreso
3. Clic en "Reportar Problema"
4. Describir el problema
5. Enviar disputa

✅ **Resultado esperado:**
- La disputa se crea con estado "Abierta"
- El trabajador recibe notificación
- Aparece en "Disputas" del cliente

**Como Trabajador:**

1. Ir a "Disputas" (sidebar)
2. Ver la disputa reportada
3. Clic en "Responder"
4. Escribir descargo
5. Enviar respuesta

✅ **Resultado esperado:**
- La disputa cambia a "En Revisión"
- El cliente ve la respuesta
- El admin recibe notificación

---

### 7️⃣ **Zona de Trabajo con Mapas** (Trabajador)

**Como Trabajador:** `ana@trabajador.com`

1. Ir a "Zona de Trabajo" (sidebar)
2. Ver mapa con marcador en ubicación actual
3. Mover el marcador a otra ubicación
4. Ajustar el radio (slider)
5. Guardar cambios

✅ **Resultado esperado:**
- El círculo azul se actualiza según el radio
- Solo verá solicitudes dentro de ese radio
- Puede pausar/reactivar disponibilidad

---

### 8️⃣ **Agenda y Calendario** (Trabajador)

**Como Trabajador:** `roberto@trabajador.com`

1. Ir a "Agenda" (sidebar)
2. Ver calendario mensual con trabajos programados
3. Ver códigos de colores por estado
4. Ir a pestaña "Horarios Semanales"
5. Configurar días y horarios de trabajo
6. Guardar

✅ **Resultado esperado:**
- Los trabajos aparecen en el calendario
- Puede bloquear días específicos
- Los horarios se guardan correctamente

---

### 9️⃣ **Panel de Administrador**

**Como Admin:** `admin@trabajapp.com`

**Dashboard:**
1. Ver métricas: usuarios, servicios, disputas
2. Verificar que los números son correctos

**Gestión de Disputas:**
1. Ir a "Gestionar Disputas"
2. Ver todas las disputas del sistema
3. Filtrar por estado
4. Seleccionar una disputa "En Revisión"
5. Clic en "Resolver Disputa"
6. Elegir resolución (a favor de cliente/trabajador)
7. Agregar notas administrativas
8. Resolver

✅ **Resultado esperado:**
- La disputa cambia de estado
- Ambas partes reciben notificación
- Se guarda en el historial

**Gestión de Usuarios:**
1. Ir a "Gestionar Usuarios"
2. Filtrar por rol (clientes/trabajadores)
3. Buscar por nombre
4. Ver detalles de un usuario (botón ojo)
5. Desactivar/activar cuenta (botón pausa/play)

✅ **Resultado esperado:**
- Muestra lista de usuarios
- Puede ver estadísticas de cada uno
- Puede desactivar cuentas (no admins)

---

### 🔟 **Sistema de Notificaciones**

**Con cualquier usuario:**

1. Observar campana (🔔) en el header
2. Ver badge rojo con número de no leídas
3. Clic en la campana
4. Ver dropdown con notificaciones
5. Clic en una notificación
6. Verificar redirección a la página correspondiente
7. La notificación se marca como leída

✅ **Resultado esperado:**
- Centro de notificaciones funcional
- Badge se actualiza
- Redirección correcta

---

## 🎯 Flujo Completo End-to-End

### Escenario: Cliente contrata plomero

1. **Cliente crea solicitud** → `juan@cliente.com`
2. **Trabajador ve y acepta** → `roberto@trabajador.com`
3. **Trabajador inicia trabajo** → Estado: "En Progreso"
4. **Trabajador completa y genera código** → Código: "123456"
5. **Cliente ve el código** → Lo entrega al trabajador
6. **Trabajador verifica código** → Estado: "Completado"
7. **Ambos se califican** → Estrellas y comentarios
8. **Cliente reporta problema** → Disputa abierta
9. **Trabajador responde** → Disputa en revisión
10. **Admin resuelve** → Disputa resuelta
