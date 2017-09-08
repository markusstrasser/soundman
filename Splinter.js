const Splinter = class {
    constructor (canvCtx){
        this.x = 0;
        this.y = 400;
        this.h = 100;
        this.w = 50;
        this.ctx= canvCtx;
        this.collidedAtPos = [];
        this.localRotation = 45; //gets inverted @ rotateFN ==> prefer clockwise

    }

    tick(binded) {
        if (binded.emerging) {
            this.y = binded.y + 300
            this.drawMe()
        }
        else if(binded.emerged) {
            this.drawMe()
        }
    }
    drawMe(ctx=this.ctx){
        ctx.clearRect(0,0,2000,2000)
        const {x,y,w,h} = this;

        ctx.save();
        ctx.beginPath()
        this.localRotate();
        ctx.strokeStyle = "red";
        ctx.fillStyle= 'red'

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
        // console.log(this.localRotation)
    }

    moveTowards(target, steps = 400){
        const that = this;
        window.clearInterval(window.attackAnim) //change direction without doubting yourself splinterboy
        let speed = 1;
        return new Promise(function(resolve, reject) {
            window.attackAnim = window.setInterval(function(){
                let goalY = target.y;
                let goalX = target.x;
                if (speed < 5 || (goalX - that.x)/goalX < 0.97) { //not there yet -- don't slow down
                    speed+= 0.1 * speed/10;
                }
                //IF COLLISION w TARGET


                if (goalX / that.x > 0.99 &&
                    goalX / that.x < 1.01 &&
                    goalY/ that.y > 0.99 &&
                    goalY/ that.y < 1.01) {

                    console.log('resolved splinter')
                    resolve()
                    that.collidedAtPos.push({x: that.x, y: that.y})
                    window.clearInterval(attackAnim);
                }
                if (!goalX || !goalY) {
                    console.alert("goalPos bug")
                }
                that.localRotation = that.AngleBetweenPoints({x:goalX, y:goalY}, {x: that.x, y: that.y})

                that.x -= speed * (that.x - goalX) / steps;
                that.y -= speed * (that.y - goalY) / steps;
                //rotationhack
                // that.drawMe();
            },30)
        })
    }
    AngleBetweenPoints(a, b={x: 1, y:0}) {
        let deltaY = a.y - b.y;
        let deltaX = a.x - b.x;

        let lineAngle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

        if (deltaY < 0) {
            lineAngle = lineAngle + 360;
        }
        return Math.round(lineAngle);

    }
}