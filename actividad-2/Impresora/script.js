class ImpresoraLaser {
    constructor() {
        this.encendida = false;
        this.estado = "apagada";
        this.nivelToner = 100;
        this.hojasDisponibles = 10;

        this.estadoEl = document.getElementById("estado");
        this.tonerEl = document.getElementById("toner");
        this.papelEl = document.getElementById("papel");

        this.actualizarVista();
    }

    encender() {
        if (this.encendida) return;
        this.encendida = true;
        this.estado = "lista";
        this.actualizarVista();
    }

    apagar() {
        this.encendida = false;
        this.estado = "apagada";
        this.actualizarVista();
    }

    imprimirPagina() {
        if (!this.encendida) {
            alert("¡La impresora está apagada!");
            return;
        }

        if (this.hojasDisponibles <= 0) {
            this.estado = "sin papel";
            this.actualizarVista();
            return;
        }

        if (this.nivelToner <= 0) {
            this.estado = "sin toner";
            this.actualizarVista();
            return;
        }

        this.estado = "imprimiendo";
        this.actualizarVista();

        setTimeout(() => {
            this.hojasDisponibles -= 1;
            this.nivelToner -= 10;
            this.estado = "lista";
            this.actualizarVista();
        }, 1500);
    }

    recargarPapel(cantidad) {
        this.hojasDisponibles += cantidad;
        if (this.estado === "sin papel" && this.encendida) {
            this.estado = "lista";
        }
        this.actualizarVista();
    }

    recargarToner() {
        this.nivelToner = 100;
        if (this.estado === "sin toner" && this.encendida) {
            this.estado = "lista";
        }
        this.actualizarVista();
    }

    actualizarVista() {
        this.estadoEl.textContent = `Estado: ${this.estado.charAt(0).toUpperCase() + this.estado.slice(1)}`;
        this.tonerEl.textContent = `${this.nivelToner}%`;
        this.papelEl.textContent = `${this.hojasDisponibles} hojas`;
    }
}

const impresora = new ImpresoraLaser();
