// Tokens and movement
export class TokenManager {
  constructor(vtt, map) {
    this.vtt = vtt; this.map = map; this.tokens = [];
    this.control = { role: 'dm', playerId: randomId() };

    vtt.onPickToken = (x, y, e) => this._pick(x, y, e);
    vtt.onDragToken = (t, nx, ny) => { t.x = nx; t.y = ny; this._onTokenMoved(t); vtt.requestRender(); };
    vtt.onKey = (e) => this._onKey(e);
  }

  setRole(role) { this.control.role = role; }

  addToken({ id=null, name='Token', x=0, y=0, size=1, hp=10, hpMax=null, ac=10, init=10, img=null, friendly=true, owner=null, conditions=[] }) {
    // Preserve provided id (from server/network/JSON) to keep token identity consistent across clients
    const t = { id: (id || randomId()), name, x, y, size, hp, hpMax: (hpMax ?? hp), ac, init, img, friendly, owner, conditions };
    if (img) { const el = new Image(); el.src = img; t._imgEl = el; }
    this.tokens.push(t); return t;
  }

  removeToken(id) { const i = this.tokens.findIndex(t => t.id === id); if (i>=0) this.tokens.splice(i,1); }

  get list() { return this.tokens; }

  canControl(t) {
    if (this.control.role === 'dm') return true;
    return t.owner === this.control.playerId; // player can move own token
  }

  _pick(x, y, e) {
    // highest on top: last wins
    for (let i = this.tokens.length - 1; i >= 0; i--) {
      const t = this.tokens[i];
      if (!this.canControl(t)) continue;
      const s = this.vtt.state.gridSize * (t.size || 1);
      const cx = t.x + s/2, cy = t.y + s/2; const dx = x - cx, dy = y - cy; const r = s*0.48;
      if (dx*dx + dy*dy <= r*r) { this.tokens.forEach(k=>k.selected=false); t.selected = true; if (this.onSelected) this.onSelected(t); return t; }
    }
    this.tokens.forEach(k=>k.selected=false);
    if (this.onSelected) this.onSelected(null);
    return null;
  }

  _onTokenMoved(t) {
    // optional: snapping already applied by engine
    // trigger checks handled externally (fog, traps)
    if (this.onMoved) this.onMoved(t);
  }

  _onKey(e) {
    const t = this.tokens.find(t=>t.selected && this.canControl(t)); if (!t) return;
    const key = (e.key||'').toLowerCase();
    // Determine intended cell delta
    let dx = 0, dy = 0;
    if (e.code === 'ArrowUp' || key === 'w') { dy = -1; }
    else if (e.code === 'ArrowDown' || key === 'x' || key === 's') { dy = 1; }
    else if (e.code === 'ArrowLeft' || key === 'a') { dx = -1; }
    else if (e.code === 'ArrowRight' || key === 'd') { dx = 1; }
    else if (key === 'q') { dx = -1; dy = -1; }
    else if (key === 'e') { dx = 1; dy = -1; }
    else if (key === 'z') { dx = -1; dy = 1; }
    else if (key === 'c') { dx = 1; dy = 1; }
    else return;

    e.preventDefault();
    const gs = this.vtt.state.gridSize;
    if (this.vtt.state.snapToGrid && !e.shiftKey) {
      // Grid-step by whole cells to avoid floor bias issues
      const { i, j } = this.vtt.worldToGrid(t.x, t.y);
      const next = this.vtt.gridToWorld(i + dx, j + dy);
      t.x = next.x; t.y = next.y;
    } else {
      // Free/fine movement (half-cell default)
      const step = (e.shiftKey? 1 : 0.5) * gs;
      t.x += dx * step; t.y += dy * step;
      if (this.vtt.state.snapToGrid) { const s = this.vtt.snap(t.x, t.y); t.x = s.x; t.y = s.y; }
    }
    this._onTokenMoved(t); this.vtt.requestRender();
  }

  toJSON() { return this.tokens.map(({_imgEl, ...t}) => t); }
  static fromJSON(vtt, map, arr) { const tm = new TokenManager(vtt, map); tm.tokens = []; arr.forEach(t=>tm.addToken(t)); return tm; }
}

function randomId() { return Math.random().toString(36).slice(2,9); }
