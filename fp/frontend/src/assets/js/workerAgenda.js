// Sistema de agenda y calendario para trabajadores

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let services = [];
let blocks = [];

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('worker-agenda')) {
        loadAgenda();
        loadWeeklySchedule();
        setupScheduleForm();
    }
});

// Cargar agenda del mes actual
async function loadAgenda() {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(
            `http://localhost:3000/api/agenda/month?month=${currentMonth + 1}&year=${currentYear}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Error al cargar agenda');
        }

        const data = await response.json();
        console.log('📅 Agenda cargada:', data);

        services = data.services;
        blocks = data.blocks;

        renderCalendar();

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al cargar la agenda', 'error');
    }
}

// Renderizar calendario
function renderCalendar() {
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    // Actualizar título
    document.getElementById('currentMonthYear').textContent = `${monthNames[currentMonth]} ${currentYear}`;
    document.getElementById('calendarTitle').textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Calcular días del mes
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Lunes = 0

    const container = document.getElementById('calendarDays');
    container.innerHTML = '';

    // Días del mes anterior
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        const dayElement = createDayElement(day, true, null);
        container.appendChild(dayElement);
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayElement = createDayElement(day, false, date);
        container.appendChild(dayElement);
    }

    // Días del mes siguiente
    const remainingDays = 42 - (startingDayOfWeek + daysInMonth); // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
        const dayElement = createDayElement(day, true, null);
        container.appendChild(dayElement);
    }
}

// Crear elemento de día
function createDayElement(day, isOtherMonth, date) {
    const div = document.createElement('div');
    div.className = 'calendar-day';

    if (isOtherMonth) {
        div.classList.add('other-month');
    }

    // Verificar si es hoy
    const today = new Date();
    if (date &&
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()) {
        div.classList.add('today');
    }

    // Número del día
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    div.appendChild(dayNumber);

    // Eventos del día
    if (date && !isOtherMonth) {
        const dateStr = formatDateForComparison(date);

        // Verificar si está bloqueado
        const isBlocked = blocks.some(block => block.date === dateStr);
        if (isBlocked) {
            div.classList.add('blocked');
            const blockBadge = document.createElement('div');
            blockBadge.className = 'event-badge bg-danger text-white';
            blockBadge.textContent = '🚫 Bloqueado';
            div.appendChild(blockBadge);
        }

        // Servicios del día
        const dayServices = services.filter(service => {
            const serviceDate = new Date(service.scheduled_date);
            return serviceDate.getDate() === date.getDate() &&
                serviceDate.getMonth() === date.getMonth() &&
                serviceDate.getFullYear() === date.getFullYear();
        });

        const eventsDiv = document.createElement('div');
        eventsDiv.className = 'day-events';

        dayServices.forEach(service => {
            const badge = document.createElement('div');
            badge.className = `event-badge event-${service.status}`;
            badge.textContent = service.title.substring(0, 15) + (service.title.length > 15 ? '...' : '');
            badge.title = service.title;
            eventsDiv.appendChild(badge);
        });

        div.appendChild(eventsDiv);

        // Click para bloquear/desbloquear
        div.addEventListener('click', () => {
            if (!isOtherMonth) {
                handleDayClick(date, isBlocked);
            }
        });
    }

    return div;
}

// Manejar click en día
async function handleDayClick(date, isCurrentlyBlocked) {
    const dateStr = formatDateForComparison(date);
    const action = isCurrentlyBlocked ? 'desbloquear' : 'bloquear';

    if (!confirm(`¿Deseas ${action} el día ${date.getDate()} de ${getMonthName(date.getMonth())}?`)) {
        return;
    }

    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch('http://localhost:3000/api/agenda/toggle-block', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                date: dateStr,
                reason: 'Día no disponible'
            })
        });

        if (!response.ok) {
            throw new Error('Error al bloquear/desbloquear día');
        }

        const data = await response.json();
        showNotification(data.message, 'success');

        // Recargar agenda
        loadAgenda();

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al gestionar disponibilidad', 'error');
    }
}

// Navegación del calendario
function previousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    loadAgenda();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    loadAgenda();
}

function goToToday() {
    const today = new Date();
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();
    loadAgenda();
}

// Cargar horarios semanales
async function loadWeeklySchedule() {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch('http://localhost:3000/api/agenda/schedule', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar horarios');
        }

        const data = await response.json();
        console.log('⏰ Horarios cargados:', data);

        // Llenar formulario
        fillScheduleForm(data.schedule);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Llenar formulario de horarios
function fillScheduleForm(schedule) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    days.forEach(day => {
        if (schedule[day]) {
            document.getElementById(`${day}-enabled`).checked = schedule[day].enabled;
            document.getElementById(`${day}-start`).value = schedule[day].start;
            document.getElementById(`${day}-end`).value = schedule[day].end;
        }
    });
}

// Configurar formulario de horarios
function setupScheduleForm() {
    const form = document.getElementById('scheduleForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const schedule = {
            monday: {
                enabled: document.getElementById('monday-enabled').checked,
                start: document.getElementById('monday-start').value,
                end: document.getElementById('monday-end').value
            },
            tuesday: {
                enabled: document.getElementById('tuesday-enabled').checked,
                start: document.getElementById('tuesday-start').value,
                end: document.getElementById('tuesday-end').value
            },
            wednesday: {
                enabled: document.getElementById('wednesday-enabled').checked,
                start: document.getElementById('wednesday-start').value,
                end: document.getElementById('wednesday-end').value
            },
            thursday: {
                enabled: document.getElementById('thursday-enabled').checked,
                start: document.getElementById('thursday-start').value,
                end: document.getElementById('thursday-end').value
            },
            friday: {
                enabled: document.getElementById('friday-enabled').checked,
                start: document.getElementById('friday-start').value,
                end: document.getElementById('friday-end').value
            },
            saturday: {
                enabled: document.getElementById('saturday-enabled').checked,
                start: document.getElementById('saturday-start').value,
                end: document.getElementById('saturday-end').value
            },
            sunday: {
                enabled: document.getElementById('sunday-enabled').checked,
                start: document.getElementById('sunday-start').value,
                end: document.getElementById('sunday-end').value
            }
        };

        try {
            const token = localStorage.getItem('authToken');

            const response = await fetch('http://localhost:3000/api/agenda/schedule', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ schedule })
            });

            if (!response.ok) {
                throw new Error('Error al guardar horarios');
            }

            showNotification('✅ Horarios guardados correctamente', 'success');

        } catch (error) {
            console.error('❌ Error:', error);
            showNotification('Error al guardar horarios', 'error');
        }
    });
}

// Utilidades
function formatDateForComparison(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getMonthName(monthIndex) {
    const names = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return names[monthIndex];
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// Hacer funciones globales
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.goToToday = goToToday;