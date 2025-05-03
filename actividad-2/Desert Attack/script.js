class Helicoptero {
    constructor() {
        this.salud = 100;
        this.combustible = 100;
        this.enVuelo = false;
        this.misilesDisponibles = 5;

        this.estadoEl = document.getElementById("estado");
        this.saludEl = document.getElementById("salud");
        this.combustibleEl = document.getElementById("combustible");
        this.misilesEl = document.getElementById("misiles");

        this.actualizarEstado();
    }

    iniciarVuelo() {
        if (this.enVuelo || this.combustible <= 0) {
            alert("No puedes iniciar el vuelo. Asegúrate de tener combustible.");
            return;
        }

        this.enVuelo = true;
        this.combustible -= 10;
        this.actualizarEstado();
    }

    detenerVuelo() {
        this.enVuelo = false;
        this.actualizarEstado();
    }

    atacar() {
        if (!this.enVuelo) {
            alert("Debes estar en vuelo para atacar.");
            return;
        }

        if (this.misilesDisponibles <= 0) {
            alert("No tienes misiles disponibles.");
            return;
        }

        this.misilesDisponibles -= 1;
        alert("¡Ataque exitoso!");
        this.actualizarEstado();
    }

    recargarCombustible() {
        if (this.combustible === 100) {
            alert("Ya tienes el combustible lleno.");
            return;
        }

        this.combustible = 100;
        this.actualizarEstado();
    }

    recargarMisiles() {
        if (this.misilesDisponibles === 5) {
            alert("Ya tienes todos los misiles cargados.");
            return;
        }

        this.misilesDisponibles = 5;
        this.actualizarEstado();
    }

    actualizarEstado() {
        this.estadoEl.textContent = `Estado: ${this.enVuelo ? "En Vuelo" : "Detenido"}`;
        this.saludEl.textContent = `${this.salud}%`;
        this.combustibleEl.textContent = `${this.combustible}%`;
        this.misilesEl.textContent = this.misilesDisponibles;
    }
}

const helicoptero = new Helicoptero();
