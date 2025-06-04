// === Interfaces y Clases de Figura ===
class Figure {
    constructor(id, x, y, color) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.color = color;
    }

    draw(ctx) { }
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
}

class Rectangle extends Figure {
    constructor(id, x, y, width, height, color) {
        super(id, x, y, color);
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Circle extends Figure {
    constructor(id, x, y, radius, color) {
        super(id, x, y, color);
        this.radius = radius;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class Triangle extends Figure {
    constructor(id, x, y, side, color) {
        super(id, x, y, color);
        this.side = side;
    }

    draw(ctx) {
        const height = (Math.sqrt(3) / 2) * this.side;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.side / 2, this.y + height);
        ctx.lineTo(this.x - this.side / 2, this.y + height);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// === Controller para mover figuras ===
class FigureController {
    constructor() {
        this.activeFigure = null;
        window.addEventListener('keydown', (e) => this.handleKey(e));
    }

    handleKey(e) {
        if (!this.activeFigure) return;
        const step = 5;
        switch (e.key) {
            case 'ArrowUp':
                this.activeFigure.move(0, -step);
                break;
            case 'ArrowDown':
                this.activeFigure.move(0, step);
                break;
            case 'ArrowLeft':
                this.activeFigure.move(-step, 0);
                break;
            case 'ArrowRight':
                this.activeFigure.move(step, 0);
                break;
        }
    }

    setActiveFigure(figure) {
        this.activeFigure = figure;
        document.getElementById('selectedFigure').textContent = figure ? figure.id : 'Ninguna';
    }
}

// === Renderizador general ===
class GameEngineRenderer {
    constructor(canvas, figures) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.figures = figures;
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.figures.forEach(f => f.draw(this.ctx));
    }
}

// === Manejador de interfaz ===
class UIHandler {
    constructor(figures, controller, renderer) {
        this.figures = figures;
        this.controller = controller;
        this.renderer = renderer;
        this.table = document.getElementById('figureTable');

        document.getElementById('addRectangle').addEventListener('click', () => this.addRectangle());
        document.getElementById('addCircle').addEventListener('click', () => this.addCircle());
        document.getElementById('addTriangle').addEventListener('click', () => this.addTriangle());
    }

    getColor() {
        return document.getElementById('colorPicker').value;
    }

    addRectangle() {
        const id = prompt('ID único del rectángulo:');
        const width = parseInt(prompt('Ancho:'), 10);
        const height = parseInt(prompt('Alto:'), 10);
        const x = parseInt(prompt('Coordenada X:'), 10);
        const y = parseInt(prompt('Coordenada Y:'), 10);
        const color = this.getColor();

        const rect = new Rectangle(id, x, y, width, height, color);
        this.addFigure(rect, 'Rectángulo');
    }

    addCircle() {
        const id = prompt('ID único del círculo:');
        const radius = parseInt(prompt('Radio:'), 10);
        const x = parseInt(prompt('Coordenada X:'), 10);
        const y = parseInt(prompt('Coordenada Y:'), 10);
        const color = this.getColor();

        const circle = new Circle(id, x, y, radius, color);
        this.addFigure(circle, 'Círculo');
    }

    addTriangle() {
        const id = prompt('ID único del triángulo:');
        const side = parseInt(prompt('Lado:'), 10);
        const x = parseInt(prompt('Coordenada X:'), 10);
        const y = parseInt(prompt('Coordenada Y:'), 10);
        const color = this.getColor();

        const triangle = new Triangle(id, x, y, side, color);
        this.addFigure(triangle, 'Triángulo');
    }

    addFigure(figure, type) {
        this.figures.push(figure);
        const row = document.createElement('tr');
        row.innerHTML = `<td>${type}</td><td>${figure.id}</td>`;
        row.addEventListener('click', () => {
            [...this.table.children].forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');
            this.controller.setActiveFigure(figure);
        });
        this.table.appendChild(row);
    }
}

// === Inicialización ===
const figures = [];
const canvas = document.getElementById('canvas');
const renderer = new GameEngineRenderer(canvas, figures);
const controller = new FigureController();
const ui = new UIHandler(figures, controller, renderer);

function gameLoop() {
    renderer.render();
    requestAnimationFrame(gameLoop);
}

gameLoop();
