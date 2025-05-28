class Rectangle {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.angle = 0; // en radianes
        this.speed = 5;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }

    advance() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    retreat() {
        this.x -= Math.cos(this.angle) * this.speed;
        this.y -= Math.sin(this.angle) * this.speed;
    }

    rotate(clockwise = true) {
        const rotationSpeed = 0.1; // radianes
        this.angle += clockwise ? rotationSpeed : -rotationSpeed;
    }
}

class RectangleController {
    constructor(rectangle) {
        this.rectangle = rectangle;
        this.keys = {};

        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
    }

    update() {
        if (this.keys['ArrowUp']) this.rectangle.advance();
        if (this.keys['ArrowDown']) this.rectangle.retreat();
        if (this.keys['ArrowLeft']) this.rectangle.rotate(false);
        if (this.keys['ArrowRight']) this.rectangle.rotate(true);
    }
}

// Setup canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const car = new Rectangle(canvas.width / 2, canvas.height / 2, 60, 30, 'blue');
const controller = new RectangleController(car);

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    controller.update();
    car.draw(ctx);
    requestAnimationFrame(gameLoop);
}

gameLoop();
