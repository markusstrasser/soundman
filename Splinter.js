const Splinter = class {
    constructor (canvCtx){
        this.x = 0;
        this.y = 400;
        this.h = 100;
        this.w = 50;
        this.ctx= canvCtx;
        this.localRotation = 0; //gets inverted @ rotateFN ==> prefer clockwise
    }
    drawMe(ctx=this.ctx){
        ctx.clearRect(0,0,2000,2000)
        const {x,y,w,h} = this;

        ctx.save();
        ctx.beginPath()
        this.localRotate();
        ctx.strokeStyle = "red";

        ctx.moveTo(x, y);
        ctx.lineTo(x + w/2, y + h);
        ctx.lineTo(x + w, y);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
    localRotate(ctx = this.ctx) {
        const center= {x: this.x + this.w/2, y: this.y + this.h/2}
        ctx.translate(center.x ,center.y)
        ctx.rotate((this.localRotation -90) * Math.PI / 180)
        ctx.translate(-center.x, -center.y)
    }

    moveTowards(target, steps){
        const that = this;
        const goalY = target.y;
        const goalX = target.x;

        let speed = 1;
        return new Promise(function(resolve, reject) {
            const attackAnim = window.setInterval(function(){

                if (speed < 5 || (goalX - that.x)/goalX < 0.97) { //not there yet -- don't slow down
                    speed+= 0.1 * speed/10;
                }
                //IF COLLISION w TARGET
                if (goalX / that.x > 0.9 &&
                    goalX / that.x < 1.1 &&
                    goalY/that.y > 0.9 &&
                    goalY/that.y < 1.1) {

                    console.log('resolved splinter')
                    resolve()
                    window.clearInterval(attackAnim);
                }
                that.localRotation = AngleBetweenPoints({x:goalX, y:goalY}, {x: that.x, y: that.y})

                that.x -= speed * (that.x - goalX) / steps;
                that.y -= speed * (that.y - goalY) / steps;
                //rotationhack
                that.drawMe();
            },30)
        })
    }
}
//        splinter.moveTowards({x:700, y:100}, 500)