class CustomCursor {
    static lastX = 0;
    static lastY = 0;
    static rotation = 0;
    static colorOffset = 0;
    static isSpinning = false;
    static spinStartTime = 0;
    static spinDuration = 1500;
    static trailPositions = [];
    static isActive = false;  // Keep state tracking

    static easeInOutQuart(x) {
        return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
    }

    static draw() {
        noCursor();  // Always ensure system cursor is hidden
        document.body.style.cursor = 'none';

        if (!this.isActive) {
            this.activate();
        }

        let dx = mouseX - this.lastX;
        let dy = mouseY - this.lastY;
        let speed = sqrt(dx * dx + dy * dy);

        // Store positions for trail with velocity
        if (abs(dx) > 0 || abs(dy) > 0) {
            this.trailPositions.unshift({
                x: mouseX,
                y: mouseY,
                rotation: this.rotation,
                dx: dx,
                dy: dy
            });
            if (this.trailPositions.length > 5) {
                this.trailPositions.pop();
            }
        }

        // Update trail positions even when cursor stops
        for (let i = this.trailPositions.length - 1; i >= 0; i--) {
            let pos = this.trailPositions[i];
            let targetX = i === 0 ? mouseX : this.trailPositions[i - 1].x;
            let targetY = i === 0 ? mouseY : this.trailPositions[i - 1].y;

            // Smooth movement towards target
            pos.x = lerp(pos.x, targetX, 0.3);
            pos.y = lerp(pos.y, targetY, 0.3);

            // Remove trail position if it's very close to its target
            if (i > 0 && dist(pos.x, pos.y, targetX, targetY) < 1) {
                this.trailPositions.splice(i, 1);
            }
        }

        let r = map(mouseX, 0, width, 50, 255);
        let g = map(mouseY, 0, height, 50, 255);
        let b = map(sin(this.colorOffset), -1, 1, 50, 255);

        let strokeR = r * 0.6;
        let strokeG = g * 0.6;
        let strokeB = b * 0.6;

        // Draw trail
        for (let i = 0; i < this.trailPositions.length; i++) {
            let pos = this.trailPositions[i];
            let alpha = map(i, 0, this.trailPositions.length, 160, 0);

            push();
            translate(pos.x, pos.y);
            rotate(pos.rotation);
            strokeWeight(2);
            stroke(strokeR, strokeG, strokeB, alpha * 0.5);
            fill(r, g, b, alpha * 0.3);
            rect(-15, -15, 30, 30, 3);
            pop();
        }

        // Normal rotation from movement
        if (abs(dx) > 0 || abs(dy) > 0 && !this.isSpinning) {
            this.rotation += (dx + dy) * map(speed, 0, 50, 0.03, 0.12);
        }

        // Special spin animation when clicked with easing
        if (this.isSpinning) {
            let elapsed = millis() - this.spinStartTime;
            if (elapsed < this.spinDuration) {
                let progress = elapsed / this.spinDuration;
                let easedProgress = this.easeInOutQuart(progress);
                this.rotation = map(easedProgress, 0, 1, 0, TWO_PI * 3);
            } else {
                this.isSpinning = false;
            }
        }

        // Handle mouse click
        if (mouseIsPressed && !this.isSpinning) {
            this.isSpinning = true;
            this.spinStartTime = millis();
        }

        this.lastX = mouseX;
        this.lastY = mouseY;
        this.colorOffset += 0.02;

        // Main cursor
        push();
        translate(mouseX, mouseY);
        rotate(this.rotation);

        drawingContext.shadowBlur = 40;
        drawingContext.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
        drawingContext.shadowBlur = 60;
        drawingContext.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;

        strokeWeight(2);
        stroke(strokeR, strokeG, strokeB);
        fill(r, g, b, 255);
        rect(-15, -15, 30, 30, 3);

        // Face features
        noStroke();
        fill(0);

        ellipse(-5, -3, 2.5, 10);
        ellipse(5, -3, 2.5, 10);
        rect(-2, 7, 4, 1.5);

        pop();
    }

    static activate() {
        if (!this.isActive) {
            this.isActive = true;
            noCursor();
            document.body.style.cursor = 'none';
            this.trailPositions = [];
            this.rotation = 0;
            this.lastX = mouseX;
            this.lastY = mouseY;
        }
    }

    static deactivate() {
        this.isActive = false;
        this.trailPositions = [];
    }
}
