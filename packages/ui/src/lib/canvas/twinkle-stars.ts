export interface StarConfig {
    x: number;
    y: number;
    radius: number;
    velocity: {
      x: number;
      y: number;
    };
    alpha: number;
  }
  
  export class Star {
    x: number;
    y: number;
    radius: number;
    velocity: {
      x: number;
      y: number;
    };
    alpha: number;
  
    constructor(config: StarConfig) {
      this.x = config.x;
      this.y = config.y;
      this.radius = config.radius;
      this.velocity = config.velocity;
      this.alpha = config.alpha;
    }
  
    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 6;
      ctx.imageSmoothingEnabled;
      ctx.fill();
      ctx.restore();
    }
  
    update(){
        this.x += this.velocity.x;
        this.y += this.velocity.y;
  
        this.alpha += (Math.random() - 0.5) * 0.1;
          this.alpha = Math.max(0, Math.min(1, this.alpha));
    }
  }
  