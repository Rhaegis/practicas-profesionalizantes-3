// URL base del API
const MAP_API_BASE_URL = "http://localhost:3000/api";

// Inicialización del mapa
function initMap() {
    console.log("🗺️ Iniciando mapa...");

    if (!navigator.geolocation) {
        alert("La geolocalización no está disponible en este navegador.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const userLocation = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
            };

            console.log("📍 Tu ubicación:", userLocation);

            const map = new google.maps.Map(document.getElementById("map"), {
                center: userLocation,
                zoom: 13,
            });

            // Marcador del usuario (azul)
            new google.maps.Marker({
                position: userLocation,
                map,
                title: "Tu ubicación",
                icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            });

            // Obtener trabajadores cercanos
            try {
                const response = await fetch(
                    `${MAP_API_BASE_URL}/workers/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radio=15`
                );

                const data = await response.json();
                console.log("📍 Respuesta del servidor:", data);

                if (data.trabajadores && data.trabajadores.length > 0) {
                    console.log(`✅ ${data.trabajadores.length} trabajadores encontrados`);

                    data.trabajadores.forEach((trabajador) => {
                        // Validar que tenga coordenadas
                        if (!trabajador.lat || !trabajador.lng) {
                            console.warn("⚠️ Trabajador sin coordenadas:", trabajador);
                            return;
                        }

                        const marker = new google.maps.Marker({
                            position: {
                                lat: parseFloat(trabajador.lat),
                                lng: parseFloat(trabajador.lng)
                            },
                            map,
                            title: `${trabajador.full_name} - ${trabajador.trade}`,
                            icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                        });

                        // Escapar comillas para evitar errores
                        const safeName = trabajador.full_name.replace(/'/g, "\\'");
                        const safeTrade = trabajador.trade.replace(/'/g, "\\'");

                        // InfoWindow con botón
                        const infoWindow = new google.maps.InfoWindow({
                            content: `
                                <div style="padding: 12px; max-width: 250px;">
                                    <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">${trabajador.full_name}</h3>
                                    <p style="margin: 4px 0; color: #666;"><strong>Oficio:</strong> ${trabajador.trade}</p>
                                    <p style="margin: 4px 0; color: #666;"><strong>Zona:</strong> ${trabajador.work_area || 'No especificada'}</p>
                                    <button 
                                        onclick="solicitarServicio(${trabajador.id}, '${safeName}', '${safeTrade}')" 
                                        style="
                                            margin-top: 12px;
                                            padding: 10px 16px;
                                            background: #4CAF50;
                                            color: white;
                                            border: none;
                                            border-radius: 6px;
                                            cursor: pointer;
                                            width: 100%;
                                            font-weight: bold;
                                            font-size: 14px;
                                        "
                                        onmouseover="this.style.background='#45a049'"
                                        onmouseout="this.style.background='#4CAF50'"
                                    >
                                        📨 Solicitar Servicio
                                    </button>
                                </div>
                            `
                        });

                        marker.addListener("click", () => {
                            infoWindow.open(map, marker);
                        });
                    });
                } else {
                    console.log("⚠️ No hay trabajadores cercanos.");
                    alert("No se encontraron trabajadores cercanos en un radio de 15km.");
                }
            } catch (err) {
                console.error("❌ Error al cargar trabajadores:", err);
                alert("No se pudieron cargar los trabajadores cercanos. Verifica la consola.");
            }
        },
        (err) => {
            alert("No se pudo obtener tu ubicación. Habilitá los permisos de geolocalización.");
            console.error("Error de geolocalización:", err);
        }
    );
}

// Función para solicitar servicio
function solicitarServicio(workerId, workerName, workerTrade) {
    console.log("🔔 Solicitud de servicio:", { workerId, workerName, workerTrade });

    // Guardar datos del trabajador
    sessionStorage.setItem('selectedWorker', JSON.stringify({
        id: workerId,
        name: workerName,
        trade: workerTrade
    }));

    // Abrir modal
    openServiceModal();
}

// Hacer la función global para que Google Maps la encuentre
window.initMap = initMap;
window.solicitarServicio = solicitarServicio;