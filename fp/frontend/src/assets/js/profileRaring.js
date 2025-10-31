// frontend/src/assets/js/profileRating.js
// Sistema para mostrar promedio de calificaciones en perfiles

// Obtener y mostrar promedio de calificaciones
async function loadUserRating(userId, containerId) {
    try {
        const response = await fetch(`http://localhost:3000/api/ratings/user/${userId}/average`);

        if (!response.ok) {
            console.error('Error al obtener promedio');
            return;
        }

        const data = await response.json();
        displayRating(data, containerId);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Mostrar rating en el DOM
function displayRating(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const { average, count } = data;

    if (count === 0) {
        container.innerHTML = `
            <div class="text-center text-muted">
                <i class="bi bi-star" style="font-size: 2rem;"></i>
                <p class="mb-0 mt-2">Sin calificaciones aún</p>
            </div>
        `;
        return;
    }

    const starsHTML = generateStarsHTML(average);

    container.innerHTML = `
        <div class="text-center">
            <div class="display-4 fw-bold text-primary mb-2">${average.toFixed(1)}</div>
            <div class="mb-2" style="font-size: 1.5rem;">
                ${starsHTML}
            </div>
            <p class="text-muted mb-0">
                ${count} ${count === 1 ? 'calificación' : 'calificaciones'}
            </p>
        </div>
    `;
}

// Generar estrellas HTML
function generateStarsHTML(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Estrellas llenas
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="bi bi-star-fill text-warning"></i>';
    }

    // Media estrella
    if (hasHalfStar) {
        stars += '<i class="bi bi-star-half text-warning"></i>';
    }

    // Estrellas vacías
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="bi bi-star text-warning"></i>';
    }

    return stars;
}

// Cargar historial de calificaciones
async function loadRatingHistory(userId, containerId) {
    try {
        const response = await fetch(`http://localhost:3000/api/ratings/user/${userId}`);

        if (!response.ok) {
            console.error('Error al obtener historial');
            return;
        }

        const data = await response.json();
        displayRatingHistory(data.ratings, containerId);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Mostrar historial de calificaciones
function displayRatingHistory(ratings, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (ratings.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                <p>No hay calificaciones recibidas aún</p>
            </div>
        `;
        return;
    }

    container.innerHTML = ratings.map(rating => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <strong>${rating.rater.full_name}</strong>
                        <small class="text-muted d-block">${formatDate(rating.createdAt)}</small>
                    </div>
                    <div>
                        ${generateStarsHTMLSmall(rating.rating)}
                    </div>
                </div>
                ${rating.comment ? `
                    <p class="mb-0 text-muted">"${rating.comment}"</p>
                ` : ''}
                <small class="text-muted">
                    <i class="bi bi-briefcase me-1"></i>
                    ${rating.service.title}
                </small>
            </div>
        </div>
    `).join('');
}

// Generar estrellas pequeñas
function generateStarsHTMLSmall(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="bi bi-star-fill text-warning" style="font-size: 0.9rem;"></i>';
        } else {
            stars += '<i class="bi bi-star text-warning" style="font-size: 0.9rem;"></i>';
        }
    }
    return stars;
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Hacer funciones globales
window.loadUserRating = loadUserRating;
window.loadRatingHistory = loadRatingHistory;