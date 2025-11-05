// Core engine: canvases, camera, grid rendering, input
export class VTT {
  constructor(gridCanvas, tokenCanvas, fogCanvas) {
    this.canvases = { grid: gridCanvas, token: tokenCanvas, fog: fogCanvas };
    this.ctx = {
      grid: gridCanvas.getContext('2d'),
      token: tokenCanvas.getContext('2d'),
      fog: fogCanvas.getContext('2d')
    };
    this.state = {
      gridSize: 50, // pixels per tile at scale 1
      gridType: 'square', // 'square' | 'hex'
      snapToGrid: true,
      camera: { x: 0, y: 0, scale: 1 },
      tool: 'pan',
      measuring: null,
      viewport: { w: 0, h: 0 },
    };

    // Resize handler
    const resize = () => {
      const wrap = gridCanvas.parentElement; // assumes all canvases same parent
      const dpr = window.devicePixelRatio || 1;
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      this.state.viewport = { w, h };
      for (const c of [gridCanvas, tokenCanvas, fogCanvas]) {
        c.width = Math.floor(w * dpr);
        c.height = Math.floor(h * dpr);
        c.style.width = w + 'px';
        c.style.height = h + 'px';
        const ctx = c.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      this.requestRender();
    };
    window.addEventListener('resize', resize);
    resize();

    // Input
    this._installInput();

    // Render loop throttle
    this._needsRender = false;
  }

  setGridType(type) { this.state.gridType = type; this.requestRender(); }
  setSnap(snap) { this.state.snapToGrid = !!snap; }
  setTool(tool) { this.state.tool = tool; }

  worldToScreen(x, y) {
    const { camera } = this.state; return { x: (x - camera.x) * camera.scale, y: (y - camera.y) * camera.scale };
  }
  screenToWorld(x, y) {
    const { camera } = this.state; return { x: x / camera.scale + camera.x, y: y / camera.scale + camera.y };
  }

  gridToWorld(i, j) { // top-left of cell
    const s = this.state.gridSize;
    if (this.state.gridType === 'square') return { x: i * s, y: j * s };
    // pointy-top hexes
    const r = s * 0.5; const h = Math.sqrt(3) * r;
    const wx = (i + (j % 2 ? 0.5 : 0)) * (r * 2 * 0.75);
    const wy = j * h * 0.5 + j * (h * 0.25);
    return { x: wx * 2, y: wy }; // keep similar scale to square
  }
  worldToGrid(x, y) {
    const s = this.state.gridSize;
    if (this.state.gridType === 'square') return { i: Math.floor(x / s), j: Math.floor(y / s) };
    // approx hex pick via axial rounding
    const r = s * 0.5; const q = (x * 2) / (r * 3); const p = (y) / (Math.sqrt(3) * r);
    return { i: Math.round(q), j: Math.round(p) };
  }

  snap(x, y) {
    if (!this.state.snapToGrid) return { x, y };
    const { i, j } = this.worldToGrid(x, y);
    const { x: sx, y: sy } = this.gridToWorld(i, j);
    return { x: sx, y: sy };
  }

  requestRender() {
    if (this._needsRender) return; this._needsRender = true; requestAnimationFrame(() => { this._needsRender = false; this.render(); });
  }

  renderGrid(map) {
    const ctx = this.ctx.grid; const { w, h } = this.state.viewport; const { camera, gridSize, gridType } = this.state;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(-camera.x * camera.scale, -camera.y * camera.scale); ctx.scale(camera.scale, camera.scale);

    // background
    ctx.fillStyle = '#e7dcc4'; ctx.fillRect(camera.x, camera.y, w / camera.scale + 2, h / camera.scale + 2);

    ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1; ctx.beginPath();
    if (gridType === 'square') {
      const step = gridSize; const minX = Math.floor(camera.x / step) * step - step; const minY = Math.floor(camera.y / step) * step - step;
      for (let x = minX; x < camera.x + w / camera.scale + step; x += step) { ctx.moveTo(x, camera.y - step); ctx.lineTo(x, camera.y + h / camera.scale + step); }
      for (let y = minY; y < camera.y + h / camera.scale + step; y += step) { ctx.moveTo(camera.x - step, y); ctx.lineTo(camera.x + w / camera.scale + step, y); }
    } else {
      // draw hex grid by tiling
      const r = gridSize * 0.5; const a = Math.sqrt(3) * r; const stepX = r * 1.5; const stepY = a;
      const startX = camera.x - stepX * 2; const endX = camera.x + w / camera.scale + stepX * 2;
      const startY = camera.y - stepY * 2; const endY = camera.y + h / camera.scale + stepY * 2;
      for (let y0 = startY, row = 0; y0 < endY; y0 += stepY, row++) {
        for (let x0 = startX + (row % 2 ? stepX * 0.5 : 0), x = x0; x < endX; x += stepX) {
          this._strokeHex(ctx, x, y0, r);
        }
      }
    }
    ctx.stroke();

    // draw map tiles (walls/floors) if provided
    if (map && map.tiles) {
      for (let j = 0; j < map.h; j++) {
        for (let i = 0; i < map.w; i++) {
          const t = map.tiles[j * map.w + i];
          if (!t || t.type === 'floor') continue;
          const { x, y } = this.gridToWorld(i, j);
          const s = gridSize;
          ctx.fillStyle = t.type === 'wall' ? '#808080' : t.type === 'tree' ? '#2e7d32' : '#795548';
          ctx.globalAlpha = 0.85;
          if (this.state.gridType === 'square') ctx.fillRect(x, y, s, s);
          else this._fillHex(ctx, x + s * 0.5, y + s * 0.5, s * 0.5);
          ctx.globalAlpha = 1;
        }
      }
    }

    ctx.restore();
  }

  renderTokens(tokens) {
    const ctx = this.ctx.token; const { w, h } = this.state.viewport; const { camera } = this.state; ctx.clearRect(0, 0, w, h);
    ctx.save(); ctx.translate(-camera.x * camera.scale, -camera.y * camera.scale); ctx.scale(camera.scale, camera.scale);
    tokens.forEach(t => {
      const size = this.state.gridSize * (t.size || 1);
      const x = t.x + size / 2; const y = t.y + size / 2;
      ctx.save();
      // selection shadow
      if (t.selected) { ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 10; }
      // token
      if (t.img && t._imgEl && t._imgEl.complete) {
        ctx.beginPath(); ctx.arc(x, y, size * 0.45, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
        ctx.drawImage(t._imgEl, t.x + size*0.05, t.y + size*0.05, size*0.9, size*0.9);
      } else {
        ctx.fillStyle = t.friendly ? '#1976d2' : '#c62828';
        ctx.beginPath(); ctx.arc(x, y, size * 0.45, 0, Math.PI * 2); ctx.fill();
      }
      // ring and label
      ctx.lineWidth = 2; ctx.strokeStyle = t.friendly ? '#64b5f6' : '#ef9a9a'; ctx.beginPath(); ctx.arc(x, y, size * 0.48, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'white'; ctx.font = `${Math.max(12, size*0.18)}px IM Fell DW Pica, serif`; ctx.textAlign = 'center';
      ctx.fillText(t.name || 'Token', x, y + size * 0.6);
      ctx.restore();
    });
    ctx.restore();
  }

  renderFog(fog) {
    const ctx = this.ctx.fog; const { w, h } = this.state.viewport; const { camera } = this.state; ctx.clearRect(0, 0, w, h);
    ctx.save(); ctx.translate(-camera.x * camera.scale, -camera.y * camera.scale); ctx.scale(camera.scale, camera.scale);
    fog.render(ctx, this.state.gridSize);
    ctx.restore();
  }

  renderAll({ map, tokens, fog }) {
    this.renderGrid(map);
    this.renderTokens(tokens);
    this.renderFog(fog);
  }

  render() {
    if (this._renderSource) this._renderSource();
  }

  bindRenderSource(source) {
    this._renderSource = () => this.renderAll(source());
    this.requestRender();
  }

  _installInput() {
    const cvs = this.canvases.token; // use token layer for input
    let dragging = null; let last = null; let panning = false;

    const getPos = (e) => {
      const rect = cvs.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      return this.screenToWorld(x, y);
    };

    const onWheel = (e) => {
      e.preventDefault();
      const delta = Math.sign(e.deltaY);
      const factor = delta > 0 ? 0.9 : 1.1;
      const before = getPos(e);
      this.state.camera.scale = Math.min(4, Math.max(0.25, this.state.camera.scale * factor));
      const after = getPos(e);
      // zoom to cursor: adjust camera to keep world point under cursor stable
      this.state.camera.x += before.x - after.x;
      this.state.camera.y += before.y - after.y;
      this.requestRender();
    };

    const onDown = (e) => {
      last = getPos(e);
      if (this.state.tool === 'pan' || e.button === 1 || e.spaceKey) { panning = true; return; }
      if (this.onPickToken) {
        const t = this.onPickToken(last.x, last.y, e);
        if (t) { dragging = t; dragging.dragOffset = { dx: last.x - t.x, dy: last.y - t.y }; }
      }
    };

    const onMove = (e) => {
      const pos = getPos(e);
      if (panning && last) {
        const dx = pos.x - last.x; const dy = pos.y - last.y;
        this.state.camera.x -= dx; this.state.camera.y -= dy; this.requestRender();
      } else if (dragging) {
        let nx = pos.x - dragging.dragOffset.dx; let ny = pos.y - dragging.dragOffset.dy;
        if (this.state.snapToGrid) { const s = this.snap(nx, ny); nx = s.x; ny = s.y; }
        if (this.onDragToken) this.onDragToken(dragging, nx, ny);
      }
      last = pos;
    };

    const onUp = (e) => { dragging = null; panning = false; };

    cvs.addEventListener('wheel', onWheel, { passive: false });
    cvs.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    cvs.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);

    // keyboard
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') { this.state.tool = 'pan'; e.spaceKey = true; }
      if (this.onKey) this.onKey(e);
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') { e.spaceKey = false; }
    });
  }

  _strokeHex(ctx, cx, cy, r) {
    const a = Math.sqrt(3) * r; // apothem vertical
    ctx.moveTo(cx + r, cy);
    ctx.lineTo(cx + r/2, cy + a/2);
    ctx.lineTo(cx - r/2, cy + a/2);
    ctx.lineTo(cx - r, cy);
    ctx.lineTo(cx - r/2, cy - a/2);
    ctx.lineTo(cx + r/2, cy - a/2);
    ctx.closePath();
  }
  _fillHex(ctx, cx, cy, r) {
    ctx.beginPath(); this._strokeHex(ctx, cx, cy, r); ctx.fill();
  }
}
