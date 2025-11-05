// UI wiring and small utilities
export class UI {
  constructor({ vtt, map, tokens, fog, gen, net, els }){
    this.vtt = vtt; this.map = map; this.tokens = tokens; this.fog = fog; this.gen = gen; this.net = net; this.els = els;

    // Bind render source
    vtt.bindRenderSource(() => ({ map, tokens: tokens.list, fog }));

    // Auth: read current site login (localStorage) and set initial role
    this.currentUser = (localStorage.getItem('loggedInCharacter') || 'Guest');
    this.dmOverride = localStorage.getItem('vttDmOverride') === 'true';
    this.isDM = this._isDmUser(this.currentUser) || this.dmOverride;
    const userEl = document.getElementById('userDisplay'); if (userEl) userEl.textContent = this.isDM ? `${this.currentUser} (DM)` : this.currentUser;
    if (this.isDM) { els.roleSelect.value = 'dm'; tokens.setRole('dm'); } else { els.roleSelect.value = 'player'; tokens.setRole('player'); }

    // Default map
    gen.generate({ w: 50, h: 50, biome: 'dungeon', difficulty: 'normal' });
    // Spawn a player/DM token at start using character sheet data when available
    {
      const s = vtt.state.gridSize; const start = gen.start || { i: 2, j: 2 };
      const ch = this._readCharacterFromLocal();
      const name = ch.name || this.currentUser || 'Hero';
  const hp = ch.hpCurrent ?? ch.hpMax ?? 10; // prefer current HP, fallback to max
  const ac = ch.armorClass ?? 10;
  const hpMax = ch.hpMax ?? hp;
  const t = tokens.addToken({ name, x: start.i * s, y: start.j * s, friendly: true, owner: tokens.control.playerId, hp, hpMax, ac });
      // Fog initial reveal around token
      fog.revealAround(t);
    }

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
  // Zoom buttons
  const zin = document.getElementById('zoomInBtn'); if (zin) zin.addEventListener('click', ()=> this.vtt.zoomIn());
  const zout = document.getElementById('zoomOutBtn'); if (zout) zout.addEventListener('click', ()=> this.vtt.zoomOut());
  const zreset = document.getElementById('resetViewBtn'); if (zreset) zreset.addEventListener('click', ()=> this.vtt.resetView());
    // Prevent switching to DM without DM login
    els.roleSelect.addEventListener('change', (e)=>{
      const val = e.target.value;
      if (val === 'dm' && !this.isDM) {
        e.target.value = 'player';
        this.tokens.setRole('player');
        alert('DM login required to select DM role.');
      } else {
        this.tokens.setRole(val);
      }
    });

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
      else { net.emit('hello', { who: this.currentUser||'player' }); }
      const dmBtn = document.getElementById('dmViewToggle'); if (dmBtn) dmBtn.disabled = net.role !== 'dm';
      // If a player connects, ensure their token exists on the board and announce it
      if (net.role === 'player') {
        this._ensurePlayerTokenSpawned(true);
      }
    });

    // Save / Load
    els.saveBtn.addEventListener('click', ()=>this.saveAsJSON());
    els.loadBtn.addEventListener('click', ()=>this.loadFromJSON());
    // Cloud save (Firebase)
    const saveCloudBtn = document.getElementById('saveCloudBtn');
    if (saveCloudBtn){
      saveCloudBtn.addEventListener('click', ()=> this.saveToFirebase());
      saveCloudBtn.disabled = !this.isDM; // DM-only action
    }
    const newMapBtn = document.getElementById('newMapBtn');
    if (newMapBtn){
      newMapBtn.addEventListener('click', ()=>{
        if (!this.isDM) { alert('DM only'); return; }
        const ok = confirm('Generate a new random map now? This will reposition the hero token.');
        if (!ok) return;
        this._randomizeMap();
        if (this.net && this.net.role === 'dm') this._broadcastState();
      });
      newMapBtn.disabled = !this.isDM;
    }

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

    // DM View toggle (local-only, not broadcast)
    const dmBtn = document.getElementById('dmViewToggle');
    if (dmBtn){
      dmBtn.disabled = !this.isDM;
      dmBtn.addEventListener('click', ()=>{
        if (!this.isDM) return;
        fog.dmSeeAll = !fog.dmSeeAll;
        dmBtn.classList.toggle('active', fog.dmSeeAll);
        dmBtn.textContent = fog.dmSeeAll ? 'DM View: On' : 'DM View: Off';
        this.vtt.requestRender();
      });
    }

    // DM login button
    const dmLoginBtn = document.getElementById('dmLoginBtn');
    if (dmLoginBtn) {
      dmLoginBtn.addEventListener('click', ()=>{
        if (this.isDM && this.dmOverride) {
          // logout only if DM came from override (do not log out site DM)
          this.dmOverride = false; localStorage.removeItem('vttDmOverride');
          this.isDM = this._isDmUser(this.currentUser);
          if (!this.isDM) { this.tokens.setRole('player'); this.els.roleSelect.value='player'; }
          const userEl = document.getElementById('userDisplay'); if (userEl) userEl.textContent = this.isDM ? `${this.currentUser} (DM)` : this.currentUser;
          if (!this.isDM) { const dmBtn = document.getElementById('dmViewToggle'); if (dmBtn) dmBtn.disabled = true; fog.dmSeeAll = false; }
          this.log('[system] DM override removed.');
          return;
        }
        if (this.isDM) { this.log('[system] Already logged in as DM.'); return; }
        const pass = prompt('Enter DM password');
        if (!pass) return;
        if (pass === 'dmpass2025') {
          this.dmOverride = true; localStorage.setItem('vttDmOverride','true');
          this.isDM = true; this.tokens.setRole('dm'); this.els.roleSelect.value='dm';
          const userEl = document.getElementById('userDisplay'); if (userEl) userEl.textContent = `${this.currentUser} (DM)`;
          const dmBtn = document.getElementById('dmViewToggle'); if (dmBtn) dmBtn.disabled = false;
          this.log('[system] DM login successful.');
        } else {
          alert('Incorrect DM password.');
        }
      });
    }

    // Token details panel
    this._setupTokenPanel();

    // Optional: live character sync from Firebase if available
    this._maybeSetupFirebaseCharacterSync();
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

  async saveToFirebase(){
    if (!this.isDM) { alert('DM only'); return; }
    const db = (typeof window !== 'undefined') ? window.database : null;
    if (!db) { alert('Firebase not available on this page.'); return; }
    const session = (this.els.sessionId.value || 'local-demo').trim();
    const state = {
      map: this.map.toJSON(),
      tokens: this.tokens.toJSON(),
      fog: this.fog.toJSON(),
      initiative: this.initiative||[],
      meta: { savedAt: Date.now(), app: 'Darcnia VTT', v: 1, savedBy: this.currentUser||'unknown' }
    };
    try {
      await db.ref(`sessions/${session}/state`).set(state);
      this.log(`[system] Saved session '${session}' to cloud.`);
      alert('✅ Saved to cloud');
    } catch (e) {
      console.error('Save cloud error', e); alert('❌ Failed to save to cloud.');
    }
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
    net.on('hello', ()=>{ if (net.role === 'dm') this._broadcastState(); });
    net.on('state', (s)=>{ if (net.role === 'dm') return; this._applyLoad(s); this._ensurePlayerTokenSpawned(true); });
    net.on('move', (m)=>{ const t = tokens.list.find(t=>t.id===m.id); if (!t) return; t.x = m.x; t.y = m.y; this.vtt.requestRender(); });
    net.on('spawn', ({ token })=>{ if (net.role==='dm') return; tokens.addToken(token); this.vtt.requestRender(); });
    net.on('erase', ({ id })=>{ if (net.role==='dm') return; tokens.removeToken(id); this.vtt.requestRender(); });
    net.on('fog', ({ op, i, j, r })=>{ if (net.role==='dm') return; if (op==='reveal') fog.dmReveal(i,j,r); else fog.dmHide(i,j,r); });
    net.on('tokenUpdate', (u)=>{ const t = tokens.list.find(t=>t.id===u.id); if (!t) return; Object.assign(t, u.patch||{}); this.vtt.requestRender(); if (this.selectedToken && this.selectedToken.id===t.id) this._refreshTokenPanel(); });
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

  _isDmUser(name){
    const n = String(name||'').toLowerCase();
    return n === 'dm' || n === 'dungeon master';
  }

  _setupTokenPanel(){
    this.selectedToken = null;
    const $ = (id)=>document.getElementById(id);
    const info = $('tokenSelectInfo');
    const nameEl = $('tokenName'); const acEl = $('tokenAC');
    const hpCurEl = $('tokenHpCurrent'); const hpMaxEl = $('tokenHpMax');
    const condEl = $('tokenConditions'); const applyBtn = $('applyTokenEdits');
    const dmgBtn = $('btnDamage'); const healBtn = $('btnHeal'); const deltaEl = $('tokenHpDelta');

    const canEdit = ()=>{
      const t = this.selectedToken; if (!t) return false;
      return this.tokens.canControl(t) || this.isDM;
    };

    this._refreshTokenPanel = ()=>{
      const t = this.selectedToken;
      if (!t){ info.textContent = 'No token selected'; [nameEl, acEl, hpCurEl, hpMaxEl, condEl, applyBtn, dmgBtn, healBtn, deltaEl].forEach(el=>{ if (el) el.disabled = true; }); return; }
      info.textContent = `${t.name} ${t.friendly?'(friendly)':'(hostile)'} ${this.tokens.canControl(t)?'• yours':''}`;
      [nameEl, acEl, hpCurEl, hpMaxEl, condEl, applyBtn, dmgBtn, healBtn, deltaEl].forEach(el=>{ if (el) el.disabled = !canEdit(); });
      if (nameEl) nameEl.value = t.name||'';
      if (acEl) acEl.value = t.ac||0;
      if (hpCurEl) hpCurEl.value = t.hp||0;
      if (hpMaxEl) hpMaxEl.value = t.hpMax||t.hp||0;
      if (condEl) condEl.value = (t.conditions||[]).join(', ');
    };

    const applyPatch = (patch)=>{
      const t = this.selectedToken; if (!t) return;
      if (!canEdit()) return;
      const oldHp = t.hp;
      Object.assign(t, patch);
      // Clamp hp
      t.hpMax = Math.max(0, parseInt(t.hpMax||0,10));
      t.hp = Math.max(0, Math.min(parseInt(t.hp||0,10), t.hpMax||t.hp||0));
      this.vtt.requestRender();
      this._refreshTokenPanel();
      // Broadcast
      this.net.emit('tokenUpdate', { id: t.id, patch });
      // Chat for HP changes
      if (typeof oldHp === 'number' && typeof t.hp === 'number' && oldHp !== t.hp){
        const diff = t.hp - oldHp;
        const verb = diff < 0 ? 'takes' : 'heals';
        const amt = Math.abs(diff);
        this.log(`${t.name} ${verb} ${amt} HP, HP ${t.hp}/${t.hpMax||t.hp}`);
      }
    };

    if (applyBtn){ applyBtn.addEventListener('click', ()=>{
      const t = this.selectedToken; if (!t) return;
      const conds = (condEl?.value||'').split(',').map(s=>s.trim()).filter(Boolean);
      applyPatch({ name: nameEl?.value||t.name, ac: parseInt(acEl?.value||t.ac||0,10), hp: parseInt(hpCurEl?.value||t.hp||0,10), hpMax: parseInt(hpMaxEl?.value||t.hpMax||0,10), conditions: conds });
    }); }
    if (dmgBtn){ dmgBtn.addEventListener('click', ()=>{
      const t = this.selectedToken; if (!t) return; const n = parseInt(deltaEl?.value||'0',10)||0; if (n<=0) return; applyPatch({ hp: Math.max(0, (t.hp||0)-n) }); }); }
    if (healBtn){ healBtn.addEventListener('click', ()=>{
      const t = this.selectedToken; if (!t) return; const n = parseInt(deltaEl?.value||'0',10)||0; if (n<=0) return; applyPatch({ hp: Math.min((t.hpMax||t.hp||0), (t.hp||0)+n) }); }); }

    // Update panel on selection change
    this.tokens.onSelected = (t)=>{ this.selectedToken = t; this._refreshTokenPanel(); };
    // Initialize disabled state
    this._refreshTokenPanel();
  }

  _maybeSetupFirebaseCharacterSync(){
    try {
      const db = (typeof window !== 'undefined') ? window.database : null; if (!db) return;
      const user = (this.currentUser||'').trim(); if (!user || user.toLowerCase()==='guest') return;
      const sanitized = user.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const ref = db.ref(`characters/${sanitized}/characterSheet`);
      ref.on('value', (snap)=>{
        const data = snap.val(); if (!data) return;
        // Find or create the player's token
        let t = this.tokens.list.find(t=> t.owner === this.tokens.control.playerId);
        if (!t){ this._ensurePlayerTokenSpawned(false); t = this.tokens.list.find(t=> t.owner === this.tokens.control.playerId); }
        if (!t) return;
        const patch = {};
        if (data.characterName && data.characterName !== t.name) patch.name = data.characterName;
        if (typeof data.armorClass === 'number' && data.armorClass !== t.ac) patch.ac = data.armorClass;
        let hpCur = (typeof data.hpCurrent === 'number') ? data.hpCurrent : undefined;
        let hpMax = (typeof data.hpMax === 'number') ? data.hpMax : undefined;
        if (typeof hpMax === 'number' && hpMax !== t.hpMax) patch.hpMax = hpMax;
        if (typeof hpCur === 'number' && hpCur !== t.hp) patch.hp = hpCur;
        if (Object.keys(patch).length){ Object.assign(t, patch); this.vtt.requestRender(); if (this.selectedToken && this.selectedToken.id===t.id) this._refreshTokenPanel(); }
      });
      this.log('[system] Firebase character sync active.');
    } catch(e) { /* ignore */ }
  }

  // Read character sheet data from localStorage (fallback when Firebase not wired in this page)
  _readCharacterFromLocal(){
    try {
      const raw = localStorage.getItem('dnd2024CharacterSheet');
      if (!raw) return {};
      const data = JSON.parse(raw);
      return {
        name: data.characterName,
        armorClass: data.armorClass,
        hpCurrent: data.hpCurrent,
        hpMax: data.hpMax,
      };
    } catch(_) { return {}; }
  }

  // Ensure a token controlled by this player exists; optionally broadcast spawn
  _ensurePlayerTokenSpawned(broadcast=false){
    if (this.isDM || this.tokens.control.role !== 'player') return; // players only
    const { tokens, vtt, gen } = this;
    // If a token owned by this player already exists, do nothing
    if (tokens.list.some(t=> t.owner === tokens.control.playerId)) return;
    const s = vtt.state.gridSize; const start = gen.start || { i: 2, j: 2 };
    const ch = this._readCharacterFromLocal();
    const name = ch.name || this.currentUser || 'Hero';
    const hp = ch.hpCurrent ?? ch.hpMax ?? 10; const ac = ch.armorClass ?? 10;
    const t = tokens.addToken({ name, x: start.i*s, y: start.j*s, friendly: true, owner: tokens.control.playerId, hp, ac });
    this.fog.revealAround(t);
    this.vtt.requestRender();
    if (broadcast) this.net.emit('spawn', { token: t });
  }
}

// simple dice roller with NdM (+K) support
export function roll(expr){
  const m = String(expr).trim().match(/^(\d+)?d(\d+)([+\-]\d+)?$/i); if (!m) return 0;
  const c = parseInt(m[1]||'1',10); const s = parseInt(m[2],10); const k = parseInt(m[3]||'0',10);
  let t = 0; for (let i=0;i<c;i++) t += 1 + Math.floor(Math.random()*s); return t + k;
}
