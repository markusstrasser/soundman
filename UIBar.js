const UI = class {
    constructor(canvContext) {
        this.ctx = canvContext;
        this.w = 300;
        this.h = 100;
        this.y = this.ctx.canvas.height;
        this.x = 0;
        this.userData = {
            points: 0,
            superPoints: 0
        };
        this.gradient = this.ctx.createLinearGradient(0, 0, this.w, 0);
        this.gradient.addColorStop("0", "magenta")
        this.gradient.addColorStop("0.5", "blue")
        this.gradient.addColorStop("1.0", "red");
        this.margin = 50;
    }

    addPoint() {
        this.userData.points++;
        this.drawMe();
        if (this.userData.points=== 5) {
            this.addSuperPoint();
        }
    }

    addSuperPoint() {
        let padding = 50;
        const that = this;
        return new Promise(function (resolve, reject) {
            const anim = window.setInterval(function () {
                if (padding < 0) {
                    resolve();
                    window.clearInterval(anim)
                }
                that.drawMe(padding);
                padding--;
            }, 20)
        })
            .then(() => {
                this.userData.superPoints++;
                this.userData.points -= 5;
                this.drawMe()
            })
    }

    drawMe(padding = 50, ctx = this.ctx) {
        this.y = this.ctx.canvas.height;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.beginPath();
        ctx.strokeStyle = this.gradient;
        ctx.lineWidth = 8;

        //Superpoints
        for (let i = 0; i < this.userData.superPoints; i++) {
            const startX = this.x + 20;
            ctx.strokeRect(startX + i * 50, this.y - this.h / 2, this.w / 10, 30)
        }

        //normal Points
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 5;

        for (let j = 0; j < this.userData.points; j++) {
            const startX = this.x + 30 + this.margin * this.userData.superPoints;
            ctx.strokeRect(startX + j * padding, this.y - this.h / 3, this.w / 20, 15)
        }
        ctx.closePath();

    }
}