class Auto {
    constructor() {
        this.encendido = false;
        this.velocidad = 0;
        this.marchas = ["P", "R", "N", "D"];
        this.marchaActual = "P";

        this.estadoEl = document.getElementById("estado");
        this.velocidadEl = document.getElementById("velocidad");
        this.marchaEl = document.getElementById("marcha");

        this.actualizarVista();
    }

    encender() {
        if (!this.encendido) {
            this.encendido = true;
            this.actualizarVista();
        }
    }

    apagar() {
        this.encendido = false;
        this.velocidad = 0;
        this.marchaActual = "P";
        this.actualizarVista();
    }

    acelerar() {
        if (!this.encendido || this.marchaActual !== "D") {
            alert("Debes encender el auto y ponerlo en 'D' para acelerar.");
            return;
        }
        this.velocidad += 10;
        this.actualizarVista();
    }

    frenar() {
        if (!this.encendido) return;
        this.velocidad = Math.max(this.velocidad - 10, 0);
        this.actualizarVista();
    }

    cambiarMarcha() {
        if (!this.encendido) {
            alert("Primero enciende el auto.");
            return;
        }

        const actual = this.marchas.indexOf(this.marchaActual);
        const siguiente = (actual + 1) % this.marchas.length;
        this.marchaActual = this.marchas[siguiente];
        if (this.marchaActual !== "D") this.velocidad = 0;
        this.actualizarVista();
    }

    actualizarVista() {
        this.estadoEl.textContent = `Estado: ${this.encendido ? "Encendido" : "Apagado"}`;
        this.velocidadEl.textContent = this.velocidad;
        this.marchaEl.textContent = this.marchaActual;
    }
}

const auto = new Auto();
