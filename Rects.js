const Rect = class {
    constructor(presets, canvasContext) {
        //there is no startY ... set that were you use the class
//                this.numberInChain = numberInChain //1 = 1st from the bottom going up
        this.ctx = canvasContext;
        this.y = 200;
        this.goalY = 200;
        this.w = 100;
        this.h = 20;
        this.x = 150;
        this.color = "red";
        this.localRotation = -5 + Math.random() * 10; //gets inverted @ rotateFN ==> prefer clockwise

        Object.assign(this, presets) //merge into what's left
    }

    tick(STATE) {
        const S = Object.assign({}, STATE)
        const {playerX, NECK, gameUnitsToPixel} = S;
        this.adjust(Object.assign({}, NECK));
        this.x = playerX;

        if (this.goalY / this.y < 0.97 || this.goalY / this.y > 1.03) { //if the neck is moving
            this.localRotation = -10 + Math.random() * 30;
        }
        this.drawMe()

        return this;
    }

    setGoalY(start, end, count) {
        const percY = this.numberInChain / count;
        this.goalY = start + (end - start) * percY;
        return this.goalY;
    }

    adjustY(inSteps) { //will approach, but not reach...abschwaechende curve
        const delta = this.goalY - this.y; //linear: exchange currentY here with memory of y when it started
        this.y += delta / inSteps;
        return this.y;
    }

    adjust(neck) {
        const {startY, endY, rectCount} = neck;
        this.setGoalY(startY, endY, rectCount)
        this.adjustY(10);
        this.h = ((endY - startY) / rectCount)
    }

    blueprint() {
        const {x, y, w, h} = this;
        return [{
            method: "rect",
            vertices: [
                x - w / 2,
                y - h / 2,
                w,
                h
            ]
        }]
    }

    localRotate(ctx = this.ctx) {
        ctx.translate(this.x, this.y)
        ctx.rotate(-this.localRotation * Math.PI / 180)
        ctx.translate(-(this.x), -(this.y))
    }

    drawMe(ctx = this.ctx, padding = 1.1) {
        ctx.beginPath();
        ctx.fillStyle = NumberToHSLa(yToPitch(this.y, GAME.endY, STATE.NECK.startY, GAME.pitchRange));
        ctx.save();

        this.localRotate();

        this.blueprint().map(instruct => ctx[instruct.method](...instruct.vertices))

        ctx.fill();
        ctx.closePath();
        ctx.restore()
    }
}

class Head
    extends Rect {
    constructor(presets, canvasContext) {
        super();
        this.ctx = canvasContext;
        this.fireTimer = 0;
        Object.assign(this, presets);
    }

    tick(STATE) {
        const {playerX, fireOn} = STATE;
        const {neckT} = STATE.NECK;

        const lastNeckBone = neckT[neckT.length - 1];

        this.y = lastNeckBone.y + lastNeckBone.h / 2 + this.h / 2;
        this.x = playerX;
        this.fillColor(this.fireTimer)

        this.mouthHeight = this.mouthAnim(this.fireTimer) + 2;
        this.drawMe();

        if (fireOn) {
            this.fire()
        }

    }

    drawMe(ctx = this.ctx) { //override
        const {x, y, w, h, mouthHeight} = this;
        ctx.beginPath();
        ctx.moveTo(x - w / 2, y - h / 2)
        ctx.lineTo(x - w / 3, y)
        ctx.lineTo(x - w / 2, y + h / 2)
        ctx.lineTo(x + w / 2, y + h / 1.5)
        ctx.lineTo(x + w / 2, y - h / 1.5)
        ctx.fillStyle = this.color;
        //nose
        ctx.moveTo(x + w / 2, y - 12)
        ctx.lineTo(x + w / 2 + 15, y - 10)
        ctx.lineTo(x + w / 2, y + 15)

        ctx.fill()

        //eye
        ctx.fillStyle = "black"
        ctx.fillRect(x, y, 20, 20);

        ctx.fillRect(x + w / 4, y - 30 - mouthHeight / 2, w / 4, mouthHeight)

        //text
        ctx.fillStyle = "white";
        ctx.fillText(GAME.note, x - w / 4, y - h / 6);

    }

    mouthAnim(time) {
        return 15 * (Math.abs(Math.sin(Math.pow(time % 200 / 25, 1.5)) * 1.7))
    }

    fillColor(percent) {
        if (this.fireTimer !== 0) {
            this.color = NumberToHSLa(yToPitch(this.y, GAME.endY, STATE.NECK.startY, GAME.pitchRange), '100%', `${100 - percent}%`);
        }
        else {
            this.color = "white"
        }
    }

    spit(mouth, data, ctx = this.ctx) { //should draw after drawME!! <<<< to see otherwise mouth clips the flames off
        const colY = yToPitch(this.y, GAME.endY, STATE.NECK.startY, GAME.pitchRange);
        ctx.beginPath();
        const {w, h} = data;
        const {x, y} = mouth;
        ctx.moveTo(x, y);
        ctx.lineTo(x + w / 2, y - h / 7);
        ctx.lineTo(x + w / 2, y + h / 7);
        ctx.fillStyle = NumberToHSLa(colY - 0.5 + Math.random());
        ctx.closePath()
        ctx.fill();
    }

    fire() {
        this.fireTimer += 1 + this.fireTimer / 10;
        const mouth = {
            x: this.x + this.w / 3,
            y: this.y - this.h / 2.3,
        }
        const flameData = {h: 40, w: 80}

        let rounds = Math.floor(this.fireTimer / 10)

        for (let i = 0; i < rounds; i++) {
            const m = Object.assign({}, mouth)
            const d = Object.assign({}, flameData)
            m.x += 20 * i;
            d.h += 40 * i;
            this.spit(m, d)
        }
        if (this.fireTimer > 100) {
            this.fireTimer = 0;
            this.fireOn = false;
        }
    }
}