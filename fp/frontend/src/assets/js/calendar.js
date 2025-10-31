// Calendario

let currentDate = new Date();

// Generar calendario del mes actual
function generateCalendar(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Nombres de meses
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    // Actualizar TODOS los títulos h5 que encuentre (para múltiples calendarios)
    document.querySelectorAll('h5.mb-0').forEach(title => {
        // Solo actualizar si está cerca de un calendario
        const parent = title.closest('.card-body');
        if (parent && parent.querySelector('.calendar-grid')) {
            title.textContent = `${monthNames[month]} ${year}`;
        }
    });

    // Actualizar título en calendar-header (para worker-agenda)
    const calendarHeaderTitle = document.querySelector('.calendar-header h5');
    if (calendarHeaderTitle) {
        calendarHeaderTitle.textContent = `${monthNames[month]} ${year}`;
    }

    // Obtener TODOS los contenedores de calendario
    const calendarGrids = document.querySelectorAll('.calendar-grid');

    calendarGrids.forEach(calendarGrid => {
        // Guardar los headers (días de la semana)
        const headers = [];
        calendarGrid.querySelectorAll('.fw-semibold').forEach(header => {
            headers.push(header.cloneNode(true));
        });

        // Limpiar todo el contenido
        calendarGrid.innerHTML = '';

        // Restaurar headers
        headers.forEach(header => calendarGrid.appendChild(header));

        // Agregar días vacíos al inicio
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'text-center p-2 text-muted opacity-50';
            emptyDay.textContent = '';
            calendarGrid.appendChild(emptyDay);
        }

        // Agregar días del mes
        const today = new Date();
        const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'text-center p-2 rounded';
            dayElement.textContent = day;
            dayElement.style.cursor = 'pointer';

            // Marcar día actual
            if (isCurrentMonth && day === today.getDate()) {
                dayElement.classList.add('bg-primary', 'text-white', 'fw-bold');
            }

            // Agregar hover effect (solo si no es el día actual)
            if (!dayElement.classList.contains('bg-primary')) {
                dayElement.addEventListener('mouseenter', function () {
                    this.classList.add('bg-light');
                });
                dayElement.addEventListener('mouseleave', function () {
                    this.classList.remove('bg-light');
                });
            }

            calendarGrid.appendChild(dayElement);
        }
    });
}

// Navegar al mes anterior
function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
}

// Navegar al mes siguiente
function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
}

// Ir al día de hoy
function goToToday() {
    currentDate = new Date();
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
}

// Hacer funciones globales
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.goToToday = goToToday;

// Inicializar calendario cuando carga la página
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para que el DOM esté completamente cargado
    setTimeout(() => {
        if (document.querySelector('.calendar-grid')) {
            generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
        }
    }, 100);
});