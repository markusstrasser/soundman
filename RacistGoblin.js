const RacistGoblin = class {
    constructor(presets) {
        this.x = window.innerWidth * 0.75;
        this.y = 130;
        this.h = 700;
        this.w = 400;
        this.goalY = 130;
        this.emerged = false;
        this.mouthHeight =5;
        this.timer = 0;
        this.emerging = null;
        Object.assign(this, presets)
    }
    emerge() {
        this.emerging = true;
        let that = this;
        if (this.emerged) {
            return this.drawMe();
        }
        this.y = -300;
        let speed = 1;
        const anim = window.setInterval(function(){
            if (that.y - that.goalY < 0.99 || that.goalY/that.y > 1.1) { //strange logic
                speed += 0.1;
                that.y += 5 + speed //+ sin;

            }
            else {
                that.emerged = true;
                that.emerging = false;
                that.initOsc();
                that.playOsc(that.freq);

                window.clearInterval(anim)
            }
        }, 30)
    }

    tick(){
        if (this.emerged || this.emerging !== null) {
            this.ctx.clearRect(0,0, 2000,2000)
            this.drawMe();
        }
    }

    initOsc() {
        const {audioContext} = this;
        this.osc = audioContext.createOscillator();
        this.osc.connect(audioContext.destination);
    }
    playOsc(freq=this.freq, type ="sine", osc=this.osc) {
        osc.type = type;
        osc.frequency.value = freq;
        this.oscOn = true;
        osc.start();
        // this.osc.disconnect(audioContext.destination);
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
        this.drawMouth();
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
    }

    drawMouth() {
        const {x, w, y, h, ctx} = this;
        //mouth
        if (this.oscOn) {
            this.timer+= 0.1
            this.mouthHeight += Math.sin(Math.PI * this.timer) * 3
        }

        ctx.beginPath();
        ctx.fillStyle ="black"
        ctx.fillRect(x - w/7, y+h/3.5 -this.mouthHeight/1.3, h/25, this.mouthHeight)
        ctx.fillStyle = 'red'; //so that it doesn't override splinter --- they are using same canvas...
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