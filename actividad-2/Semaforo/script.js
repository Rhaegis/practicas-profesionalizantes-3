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
