// UI wiring and small utilities
export class UI {
  constructor({ vtt, map, tokens, fog, gen, net, els }){
    this.vtt = vtt; this.map = map; this.tokens = tokens; this.fog = fog; this.gen = gen; this.net = net; this.els = els;

    // Bind render source
    vtt.bindRenderSource(() => ({ map, tokens: tokens.list, fog }));

    // Default map
    gen.generate({ w: 50, h: 50, biome: 'dungeon', difficulty: 'normal' });
    // Spawn sample player token at start
    const s = vtt.state.gridSize; const start = gen.start || { i: 2, j: 2 };
    tokens.addToken({ name: 'Hero', x: start.i * s, y: start.j * s, friendly: true, owner: tokens.control.playerId });

    // Fog initial reveal around hero
    fog.revealAround(tokens.list[0]);

    // Controls
    document.querySelectorAll('.tool').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        document.querySelectorAll('.tool').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        vtt.setTool(btn.dataset.tool);
      })
    });

    document.getElementById('gridType').addEventListener('change', (e)=>{ vtt.setGridType(e.target.value); });
    document.getElementById('snapToggle').addEventListener('change', (e)=>{ vtt.setSnap(e.target.checked); });

    document.getElementById('addToInit').addEventListener('click', ()=>{
      const n = document.getElementById('initName').value || 'Creature';
      const s = parseInt(document.getElementById('initScore').value||'10',10);
      this.addInitiative({ name:n, init:s });
    });
    document.getElementById('sortInit').addEventListener('click', ()=>this.sortInitiative());
    document.getElementById('clearInit').addEventListener('click', ()=>{ this.initiative = []; this.renderInitiative(); });

    // Chat
    document.getElementById('chatSend').addEventListener('click', ()=>{
      const input = document.getElementById('chatInput');
      const txt = input.value.trim(); if (!txt) return;
      const payload = { text: txt, who: net.role, ts: Date.now() };
      this.log(`${payload.who}: ${payload.text}`, 'chat');
      net.emit('chat', payload);
      input.value='';
    });

    // Connect
    els.connectBtn.addEventListener('click', ()=>{
      net.connect(els.sessionId.value, els.roleSelect.value);
      tokens.setRole(els.roleSelect.value);
      this._installNetHandlers();
      this.log(`[system] Connected to session ${els.sessionId.value} as ${els.roleSelect.value}`);
      if (net.role === 'dm') this._broadcastState();
    });

    // Save / Load
    els.saveBtn.addEventListener('click', ()=>this.saveAsJSON());
    els.loadBtn.addEventListener('click', ()=>this.loadFromJSON());

    // Stage interactions per tool
    this._installStageTools();

    // React to token movement: fog and traps
    tokens.onMoved = (t)=>{
      fog.revealAround(t);
      const s = vtt.state.gridSize;
      const i = Math.floor(t.x/s), j = Math.floor(t.y/s);
      gen.handleStepOn(i,j,t,(m)=>this.log(m));
      // broadcast move
      net.emit('move', { id: t.id, x: t.x, y: t.y });
    };
  }

  _installStageTools(){
    const tokenLayer = this.vtt.canvases.token;
    tokenLayer.addEventListener('click', (e)=>{
      const pos = this._eventWorld(e);
      const { i, j } = this.vtt.worldToGrid(pos.x, pos.y);
      const s = this.vtt.state.gridSize; const x = i*s, y=j*s;
      const tool = this.vtt.state.tool;
      if (tool === 'spawn' && this.tokens.control.role === 'dm'){
        const t = this.tokens.addToken({ name:'Enemy', x, y, friendly:false });
        this.vtt.requestRender();
        this.log(`[DM] Spawned ${t.name} at ${i},${j}`);
        this.net.emit('spawn', { token: t });
      } else if (tool === 'erase' && this.tokens.control.role === 'dm'){
        // erase top-most token in that cell
        const top = [...this.tokens.list].reverse().find(t=> Math.abs(t.x - x) < 1e-3 && Math.abs(t.y - y) < 1e-3);
        if (top){ this.tokens.removeToken(top.id); this.vtt.requestRender(); this.log(`[DM] Removed token ${top.name}`); this.net.emit('erase', { id: top.id }); }
      } else if (tool === 'reveal' && this.tokens.control.role === 'dm'){
        this.fog.dmReveal(i,j, 4); this.net.emit('fog', { op:'reveal', i, j, r:4 });
      } else if (tool === 'hide' && this.tokens.control.role === 'dm'){
        this.fog.dmHide(i,j, 4); this.net.emit('fog', { op:'hide', i, j, r:4 });
      } else if (tool === 'randomize' && this.tokens.control.role === 'dm'){
        this._randomizeMap(); this._broadcastState();
      }
    });
  }

  _eventWorld(e){
    const rect = this.vtt.canvases.token.getBoundingClientRect();
    const x = (e.clientX - rect.left); const y = (e.clientY - rect.top);
    return this.vtt.screenToWorld(x, y);
  }

  _randomizeMap(){
    const w = Math.max(10, Math.min(200, parseInt(document.getElementById('mapW').value||'50',10)));
    const h = Math.max(10, Math.min(200, parseInt(document.getElementById('mapH').value||'50',10)));
    const biome = document.getElementById('biome').value;
    const diff = document.getElementById('difficulty').value;
    const seed = document.getElementById('seedInput').value.trim();

    // clear tokens except friendly if desired
    this.tokens.tokens = this.tokens.tokens.filter(t=>t.friendly);

    this.gen.generate({ w, h, biome, difficulty: diff, seed });
    const s = this.vtt.state.gridSize; const start = this.gen.start || { i: 2, j: 2 };
    const hero = this.tokens.tokens.find(t=>t.friendly) || this.tokens.addToken({ name:'Hero', friendly:true });
    hero.x = start.i * s; hero.y = start.j * s;
    this.fog.revealed.clear(); this.fog.revealAround(hero);
    this.vtt.requestRender();
    this.log(`[DM] Generated ${biome} ${w}x${h} map (${diff}) ${seed?`seed=${seed}`:''}`);
  }

  addInitiative(entry){ (this.initiative ||= []).push(entry); this.renderInitiative(); }
  sortInitiative(){ (this.initiative ||= []).sort((a,b)=>b.init-a.init); this.renderInitiative(); }
  renderInitiative(){
    const el = document.getElementById('initiativeList'); el.innerHTML = '';
    (this.initiative||[]).forEach(it=>{
      const li = document.createElement('li'); li.textContent = `${it.name} (${it.init})`; el.appendChild(li);
    });
  }

  log(text, kind='system'){
    const log = document.getElementById('chatLog');
    const div = document.createElement('div');
    const time = new Date().toLocaleTimeString();
    div.textContent = `[${time}] ${text}`; log.appendChild(div); log.scrollTop = log.scrollHeight;
  }

  saveAsJSON(){
    const data = {
      map: this.map.toJSON(),
      tokens: this.tokens.toJSON(),
      fog: this.fog.toJSON(),
      initiative: this.initiative||[],
      meta: { savedAt: Date.now(), app: 'Darcnia VTT', v: 1 }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'darcnia-map.json'; a.click(); URL.revokeObjectURL(url);
  }

  loadFromJSON(){
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'application/json';
    input.onchange = (e)=>{
      const file = e.target.files[0]; if (!file) return;
      file.text().then(txt=>{
        try { const data = JSON.parse(txt); this._applyLoad(data); this.log('[system] Loaded map from JSON'); }
        catch(err){ alert('Invalid JSON'); }
      });
    };
    input.click();
  }

  _applyLoad(data){
    this.map.w = data.map.w; this.map.h = data.map.h; this.map.tiles = data.map.tiles; this.map.triggers = data.map.triggers||{}; this.map.meta = data.map.meta||{};
    this.tokens.tokens = []; data.tokens.forEach(t=>this.tokens.addToken(t));
    this.fog.revealed = new Set(data.fog||[]);
    this.initiative = data.initiative||[]; this.renderInitiative();
    this.vtt.requestRender();
  }

  _installNetHandlers(){
    const { net, tokens, fog } = this;
    net.on('chat', (p)=>{ this.log(`${p.who}: ${p.text}`, 'chat'); });
    net.on('state', (s)=>{ if (net.role === 'dm') return; this._applyLoad(s); });
    net.on('move', (m)=>{ const t = tokens.list.find(t=>t.id===m.id); if (!t) return; t.x = m.x; t.y = m.y; this.vtt.requestRender(); });
    net.on('spawn', ({ token })=>{ if (net.role==='dm') return; tokens.addToken(token); this.vtt.requestRender(); });
    net.on('erase', ({ id })=>{ if (net.role==='dm') return; tokens.removeToken(id); this.vtt.requestRender(); });
    net.on('fog', ({ op, i, j, r })=>{ if (net.role==='dm') return; if (op==='reveal') fog.dmReveal(i,j,r); else fog.dmHide(i,j,r); });
  }

  _broadcastState(){
    const state = {
      map: this.map.toJSON(),
      tokens: this.tokens.toJSON(),
      fog: this.fog.toJSON(),
      initiative: this.initiative||[],
    };
    this.net.emit('state', state);
  }
}

// simple dice roller with NdM (+K) support
export function roll(expr){
  const m = String(expr).trim().match(/^(\d+)?d(\d+)([+\-]\d+)?$/i); if (!m) return 0;
  const c = parseInt(m[1]||'1',10); const s = parseInt(m[2],10); const k = parseInt(m[3]||'0',10);
  let t = 0; for (let i=0;i<c;i++) t += 1 + Math.floor(Math.random()*s); return t + k;
}
