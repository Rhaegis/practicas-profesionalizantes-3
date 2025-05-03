class Ventilador {
    constructor() {
        this.encendido = false;
        this.velocidad = "apagado";
        this.oscilando = false;

        this.estadoEl = document.getElementById("estado");
        this.velocidadEl = document.getElementById("velocidad");
        this.oscilacionEl = document.getElementById("oscilacion");

        this.actualizarVista();
    }

    encender() {
        if (!this.encendido) {
            this.encendido = true;
            this.velocidad = "baja";
            this.actualizarVista();
        }
    }

    apagar() {
        this.encendido = false;
        this.velocidad = "apagado";
        this.oscilando = false;
        this.actualizarVista();
    }

    cambiarVelocidad() {
        if (!this.encendido) {
            alert("Primero debes encender el ventilador.");
            return;
        }

        switch (this.velocidad) {
            case "baja":
                this.velocidad = "media";
                break;
            case "media":
                this.velocidad = "alta";
                break;
            case "alta":
                this.velocidad = "baja";
                break;
        }

        this.actualizarVista();
    }

    alternarOscilacion() {
        if (!this.encendido) {
            alert("Primero debes encender el ventilador.");
            return;
        }

        this.oscilando = !this.oscilando;
        this.actualizarVista();
    }

    actualizarVista() {
        this.estadoEl.textContent = `Estado: ${this.encendido ? "Encendido" : "Apagado"}`;
        this.velocidadEl.textContent = this.velocidad.charAt(0).toUpperCase() + this.velocidad.slice(1);
        this.oscilacionEl.textContent = this.oscilando ? "Sí" : "No";
    }
}

const ventilador = new Ventilador();
