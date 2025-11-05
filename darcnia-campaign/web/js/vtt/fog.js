// Fog of War
export class FogOfWar {
  constructor(vtt, map, tokens) {
    this.vtt = vtt; this.map = map; this.tokens = tokens; this.revealed = new Set(); // store tile indices
    this.radius = 3; // tiles
    tokens.onMoved = (t)=>{ this.revealAround(t); };
  }

  key(i,j){ return j*this.map.w + i; }

  revealAround(t) {
    const s = this.vtt.state.gridSize; const size = (t.size||1);
    const cx = Math.floor((t.x + s*size*0.5)/s); const cy = Math.floor((t.y + s*size*0.5)/s);
    const R = this.radius;
    for (let j = cy - R; j <= cy + R; j++) {
      for (let i = cx - R; i <= cx + R; i++) {
        if (!this.map.inBounds(i,j)) continue;
        const dx = i - cx, dy = j - cy; if (dx*dx + dy*dy <= R*R) this.revealed.add(this.key(i,j));
      }
    }
    if (this.onReveal) this.onReveal();
    this.vtt.requestRender();
  }

  dmReveal(i,j, R=3) {
    for (let y = j - R; y <= j + R; y++) for (let x = i - R; x <= i + R; x++) {
      if (!this.map.inBounds(x,y)) continue; const dx = x - i, dy = y - j; if (dx*dx+dy*dy<=R*R) this.revealed.add(this.key(x,y));
    }
    this.vtt.requestRender();
  }
  dmHide(i,j, R=3) {
    for (let y = j - R; y <= j + R; y++) for (let x = i - R; x <= i + R; x++) {
      if (!this.map.inBounds(x,y)) continue; const dx = x - i, dy = y - j; if (dx*dx+dy*dy<=R*R) this.revealed.delete(this.key(x,y));
    }
    this.vtt.requestRender();
  }

  render(ctx, gridSize) {
    const w = this.map.w, h = this.map.h;
    ctx.save();
    // global dark overlay
    ctx.fillStyle = 'rgba(10, 10, 10, 0.95)';
    ctx.fillRect(0,0, w*gridSize, h*gridSize);
    // punch holes for revealed cells
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    for (let j=0;j<h;j++) for (let i=0;i<w;i++) {
      if (!this.revealed.has(this.key(i,j))) continue;
      const x = i*gridSize, y = j*gridSize;
      ctx.beginPath(); ctx.arc(x+gridSize/2, y+gridSize/2, gridSize*0.9, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  toJSON(){ return Array.from(this.revealed); }
  static fromJSON(vtt, map, tokens, arr){ const f=new FogOfWar(vtt,map,tokens); f.revealed = new Set(arr||[]); return f; }
}
