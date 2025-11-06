# Idea del Proyecto - Trabajapp

**Autor:** Barrio Rodrigo 
**Fecha:** 20 de Septiembre de 2025
**Materia:** Prácticas Profesionalizantes III
**Institución:** ISFT 151

---

## 1. Nombre del Proyecto

**Trabajapp** - Plataforma de Conexión entre Clientes y Trabajadores de Oficios

---

## 2. Problemática a Resolver

En la actualidad, existe una **desconexión** entre personas que necesitan servicios de oficios (plomería, electricidad, carpintería, etc.) y trabajadores calificados que ofrecen estos servicios. Los problemas principales incluyen:

- Dificultad para encontrar trabajadores confiables cerca de la ubicación del cliente
- Falta de transparencia en las calificaciones y reputación de los trabajadores
- Ausencia de un sistema de verificación que garantice la finalización correcta de los trabajos
- Dificultad para gestionar disputas cuando surgen problemas
- Falta de herramientas para que los trabajadores gestionen su disponibilidad y zona de trabajo

---

## 3. Solución Propuesta

**Trabajapp** es una plataforma web que conecta clientes con trabajadores de oficios mediante un sistema integral que incluye:

### Funcionalidades Principales:

1. **Sistema de Autenticación Dual**
   - Registro diferenciado para clientes y trabajadores
   - Login con JWT para seguridad

2. **Gestión de Servicios con Geolocalización**
   - Detección automática de ubicación del cliente mediante GPS
   - Filtrado de trabajadores por zona geográfica
   - Radio de cobertura configurable para cada trabajador

3. **Sistema de Verificación Único** (Diferenciador #1)
   - Código de 6 dígitos para validar la finalización del trabajo
   - Doble confirmación entre cliente y trabajador
   - Prevención de fraudes y calificaciones falsas

4. **Calificaciones Bilaterales** (Diferenciador #2)
   - Tanto clientes como trabajadores se califican mutuamente
   - Sistema de estrellas (1-5) con comentarios
   - Construcción de reputación transparente

5. **Sistema de Disputas** (Diferenciador #3)
   - Reporte de problemas por parte de los clientes
   - Respuesta/descargo del trabajador
   - Resolución administrativa por parte de moderadores

6. **Zona de Trabajo con Mapas** (Diferenciador #4)
   - Mapa interactivo con Google Maps
   - Configuración de radio de cobertura
   - Filtrado automático de solicitudes por distancia

7. **Agenda y Calendario**
   - Calendario mensual visual
   - Configuración de horarios semanales
   - Bloqueo de días específicos

8. **Panel de Administración**
   - Dashboard con métricas del sistema
   - Gestión de disputas
   - Gestión de usuarios
   - Activación/desactivación de cuentas

---

## 4. Usuarios del Sistema

### Cliente
Persona que necesita contratar servicios de oficios. Puede:
- Ver trabajadores disponibles en su zona
- Crear solicitudes de servicio
- Calificar trabajadores
- Reportar problemas

### Trabajador
Profesional que ofrece servicios de oficios. Puede:
- Configurar su zona de trabajo
- Ver y aceptar solicitudes
- Completar trabajos
- Calificar clientes
- Gestionar su agenda

### Administrador
Moderador del sistema que puede:
- Resolver disputas
- Gestionar usuarios
- Ver métricas globales
- Supervisar el funcionamiento del sistema

---

## 5. Tecnologías Utilizadas

### Backend
- **Node.js** con Express.js
- **MySQL** como base de datos relacional
- **Sequelize** como ORM
- **JWT** para autenticación
- **bcrypt** para encriptación de contraseñas

### Frontend
- **HTML5, CSS3, JavaScript vanilla**
- **Bootstrap 5** para diseño responsive
- **Bootstrap Icons** para iconografía
- **Google Maps API** para mapas interactivos

---

## 6. Diferenciadores Clave

1. **Código de verificación único** para garantizar finalización correcta
2. **Calificaciones bilaterales** (cliente ↔ trabajador)
3. **Sistema de disputas** con resolución administrativa
4. **Zona de trabajo con radio configurable** y filtrado por distancia

---

## 7. Alcance del Proyecto

### Incluido en el MVP:
- Autenticación y perfiles de usuario
- Gestión completa de servicios
- Sistema de verificación con código
- Calificaciones bilaterales
- Sistema de disputas
- Zona de trabajo con mapas
- Agenda y calendario
- Panel de administración
- Sistema de notificaciones

### Fuera del alcance (versión futura):
- Chat en tiempo real
- Pagos integrados (MercadoPago)
- Aplicación móvil nativa
- Notificaciones push

---

## 8. Valor Agregado

**Trabajapp** ofrece:
- **Confianza:** Sistema de verificación y calificaciones
- **Transparencia:** Reputación visible de ambas partes
- **Conveniencia:** Búsqueda por ubicación y disponibilidad
- **Seguridad:** Resolución de disputas y moderación administrativa
- **Eficiencia:** Gestión de agenda y zona de trabajo

---

## 9. Conclusión

Trabajapp es una solución integral que resuelve la problemática de conexión entre clientes y trabajadores de oficios, ofreciendo un sistema completo, seguro y transparente que beneficia a todas las partes involucradas.