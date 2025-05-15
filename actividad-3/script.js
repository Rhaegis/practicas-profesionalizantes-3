class Semaforo {
    constructor() {
        this.estadoActual = "rojo";
        this.tiempos = {
            rojo: 5000,
            amarillo: 2000,
            verde: 4000
        };
        this.intervalo = null;
        this.activo = false;

        this.luces = {
            rojo: document.getElementById("luz-roja"),
            amarillo: document.getElementById("luz-amarilla"),
            verde: document.getElementById("luz-verde")
        };

        this.dibujar();
    }

    encender() {
        if (this.activo) return;
        this.activo = true;
        this.intervalo = setTimeout(() => this.cambiarEstado(), this.tiempos[this.estadoActual]);
    }

    apagar() {
        this.activo = false;
        clearTimeout(this.intervalo);
        this.estadoActual = "rojo";
        this.dibujar();
    }

    cambiarEstado() {
        if (!this.activo) return;

        switch (this.estadoActual) {
            case "rojo":
                this.estadoActual = "verde";
                break;
            case "verde":
                this.estadoActual = "amarillo";
                break;
            case "amarillo":
                this.estadoActual = "rojo";
                break;
        }

        this.dibujar();
        this.intervalo = setTimeout(() => this.cambiarEstado(), this.tiempos[this.estadoActual]);
    }

    dibujar() {
        for (const color in this.luces) {
            this.luces[color].classList.remove("activa");
        }
        this.luces[this.estadoActual].classList.add("activa");
    }
}

const semaforo = new Semaforo();

// -------------------------------
// Movimiento del círculo en canvas
// -------------------------------

const canvas = document.getElementById("canvasMovimiento");
const ctx = canvas.getContext("2d");

let x = 0;
const y = canvas.height / 2;
const radio = 20;
const velocidad = 2;

function dibujarCirculo() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(x, y, radio, 0, Math.PI * 2);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();
}

function actualizarMovimiento() {
    if (semaforo.estadoActual === "verde") {
        x += velocidad;
        if (x - radio > canvas.width) {
            x = -radio; // Reiniciar desde la izquierda
        }
    }
    dibujarCirculo();
    requestAnimationFrame(actualizarMovimiento);
}

// Iniciar la animación
requestAnimationFrame(actualizarMovimiento);
