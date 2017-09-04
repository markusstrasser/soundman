const RacistGoblin = class {
    constructor(canvasCtx) {
        this.ctx = canvasCtx;
        this.x = 700;
        this.y = 130;
        this.h = 700;
        this.w = 400;
        this.emerged = false;
    }
    emerge() {
        const goalY = this.y;
        if (this.emerged) {
            return this.drawMe();
        }
        this.y = 0;
        const anim = window.setInterval(function(){
            if (this.y /goalY > 1.04 || this.y / goalY < 0.95) {
                this.y++;
            }
            else {
                this.emerged = true;
                window.clearInterval(anim)
            }
        })
    }

    drawMe() {
        this.drawLeg({
            w: this.w / 5,
            h: this.h / 5,
            y: this.y,
            x: this.x
        })
        this.drawLeg({
            w: -this.w / 5,
            h: this.h / 5,
            y: this.y,
            x: this.x
        })
        this.drawNeck();

        this.drawBelly();
        this.drawHead();
    }
    drawHead(ctx = this.ctx) {
        ctx.beginPath();
        const {x, w, y, h} = this;
        ctx.moveTo(x - w / 7, y + h / 4.2);
        ctx.lineTo(x + w / 6, y + h / 4);
        ctx.lineTo(x+w/18, y + h / 2.1); //triangle seat
        ctx.lineTo(x-w/23, y + h / 2.1); //


        ctx.lineTo(x - w / 7, y + h / 2.2);

        ctx.lineTo(x - w / 4.5, y + h / 3); //nosetop

        ctx.lineTo(x - w / 7, y + h / 2.8);
        ctx.fillStyle = "white";
        ctx.fill();

        //eye
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.rect(x - w/10, y+h/2.6, h/25, h/25)
        ctx.rect(x - w/10, y+h/2.6, h/34, h/34)
        ctx.rect(x - w/10, y+h/2.6, h/50, h/50)
        ctx.lineWidth= 2;
        ctx.stroke();

        //mouth
        ctx.beginPath();
        ctx.fillStyle ="red"
        ctx.fillRect(x - w/7, y+h/3.5, h/25, h/40)

    }

    drawNeck(ctx = this.ctx) {
        ctx.beginPath();
        const {x, w, y, h} = this;
        ctx.moveTo(x - w / 12, y + this.h / 5);
        ctx.lineTo(x + w / 12, y + this.h / 5);
        ctx.lineTo(x + w / 15, y + this.h / 4);
        ctx.lineTo(x - w / 15, y + this.h / 4);
        ctx.fillStyle = "white";
        ctx.fill();
    }

    drawLeg(dimensions, ctx = this.ctx) {
        ctx.beginPath();
        const {x, w, y, h} = dimensions;
        ctx.moveTo(x - w / 2, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x - w / 3, y - h);
        ctx.fillStyle = "white";
        ctx.fill();
    }

    drawBelly(ctx = this.ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.h / 10, this.h / 8, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
    }
}