// particles.js — lightweight particle engine used by app.js
// particles.js — lightweight particle engine
(function(global){
  function Particles(canvas){
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.max = 100;
    this.running = true;
    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  Particles.prototype.spawn = function(x,y,strength){
    this.particles.push({
      x: x || this.canvas.width/2,
      y: y || this.canvas.height/2,
      vx: (Math.random()-0.5) * 1.8 * (strength||1),
      vy: (Math.random()-0.8) * 1.6 * (strength||1) - 0.6*(strength||1),
      life: Math.random()*60 + 40,
      size: Math.random()*2 + 0.8,
      alpha: 1
    });
    if(this.particles.length > this.max) this.particles.splice(0, this.particles.length - this.max);
  };

  Particles.prototype.update = function(){
    const ctx = this.ctx;
    ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    for(let i=this.particles.length-1;i>=0;i--){
      const p = this.particles[i];
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.03;
      p.life -= 1;
      p.alpha = Math.max(0, p.life / 100);
      ctx.globalCompositeOperation = 'lighter';
      ctx.beginPath();
      const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size*12);
      g.addColorStop(0, `rgba(170,255,200,${0.95*p.alpha})`);
      g.addColorStop(0.2, `rgba(120,255,170,${0.25*p.alpha})`);
      g.addColorStop(1, `rgba(0,0,0,0)`);
      ctx.fillStyle = g;
      ctx.arc(p.x,p.y,p.size*6,0,Math.PI*2);
      ctx.fill();
      p.size *= 0.998;
      if(p.life <= 0 || p.alpha <= 0.02) this.particles.splice(i,1);
    }
  };

  Particles.prototype._loop = function(){
    if(this.running) this.update();
    requestAnimationFrame(this._loop);
  };

  Particles.prototype.resize = function(w,h){ this.canvas.width = Math.max(1, Math.floor(w)); this.canvas.height = Math.max(1, Math.floor(h)); };

  global.Particles = Particles;
})(window);
