// Procedural generator: dungeon or wilderness with traps/treasure/enemies
import { roll } from './ui.js';

export class Generator {
  constructor(map, tokens, fog) { this.map = map; this.tokens = tokens; this.fog = fog; }

  seedRand(seed) { // simple mulberry32
    let a = 0;
    for (let i=0;i<(seed||'seed').length;i++) a = (a ^ seed.charCodeAt(i) + 0x9e3779b9 + (a<<6) + (a>>2))>>>0;
    return function() { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }

  generate({ w=50, h=50, biome='dungeon', difficulty='normal', seed='' }={}) {
    this.map.w = w; this.map.h = h; this.map.tiles = new Array(w*h).fill(null).map(()=>({type:'floor'}));
    this.map.meta = { biome, difficulty, seed: seed||null };
    this.map.triggers = {};

    const rand = this.seedRand(seed||String(Date.now()));

    if (biome === 'dungeon') this._genDungeon(rand, w, h);
    else this._genWilderness(rand, w, h);

    // place traps/treasures/enemies
    const dens = { easy: 0.01, normal: 0.02, hard: 0.03, deadly: 0.04 }[difficulty] || 0.02;
    this._placeTraps(rand, dens);
    this._placeTreasures(rand, dens*0.8);
    this._spawnEnemies(rand, dens*0.8);

    // reveal start area
    this.fog.revealed.clear();
  }

  _genDungeon(rand, w, h) {
    // Rooms and corridors
    const tiles = this.map.tiles;
    // fill walls
    for (let i=0;i<tiles.length;i++) tiles[i] = { type:'wall' };
    const rooms = [];
    const roomCount = 12;
    for (let r=0;r<roomCount;r++){
      const rw = 4 + Math.floor(rand()*8); const rh = 4 + Math.floor(rand()*8);
      const rx = 1 + Math.floor(rand()*(w - rw - 2)); const ry = 1 + Math.floor(rand()*(h - rh - 2));
      rooms.push({x:rx,y:ry,w:rw,h:rh});
      for (let y=ry;y<ry+rh;y++) for (let x=rx;x<rx+rw;x++) tiles[y*w+x] = { type:'floor' };
    }
    // connect rooms
    rooms.sort((a,b)=>a.x-b.x);
    for (let i=0;i<rooms.length-1;i++){
      const a = rooms[i], b = rooms[i+1];
      const ax = Math.floor(a.x + a.w/2), ay = Math.floor(a.y + a.h/2);
      const bx = Math.floor(b.x + b.w/2), by = Math.floor(b.y + b.h/2);
      // carve L corridor
      for (let x=Math.min(ax,bx); x<=Math.max(ax,bx); x++) this.map.tiles[ay*w+x] = { type:'floor' };
      for (let y=Math.min(ay,by); y<=Math.max(ay,by); y++) this.map.tiles[y*w+bx] = { type:'floor' };
    }
    // start position
    this.start = { i: Math.floor(rooms[0].x + rooms[0].w/2), j: Math.floor(rooms[0].y + rooms[0].h/2) };
  }

  _genWilderness(rand, w, h) {
    // Perlin-ish blobs for trees/rocks (simplified)
    const tiles = this.map.tiles;
    for (let j=0;j<h;j++) for (let i=0;i<w;i++) {
      const v = this._noise(rand, i, j);
      tiles[j*w+i] = { type: v > 0.6 ? 'tree' : 'floor' };
    }
    this.start = { i: Math.floor(w/2), j: Math.floor(h/2) };
  }

  _noise(rand, x, y) { return (rand()+rand()+rand()+rand())/4; }

  _placeTraps(rand, density) {
    const types = [
      { name:'Pressure Plate', dc: 14, dmg:'2d6', dmgType:'piercing', text:'Dex Save DC 14 or take 2d6 piercing damage' },
      { name:'Poison Darts', dc: 13, dmg:'1d10', dmgType:'poison', text:'Dex Save DC 13 or take 1d10 poison damage' },
      { name:'Pit', dc: 12, dmg:'2d6', dmgType:'bludgeoning', text:'Dex Save DC 12 or fall and take 2d6 bludgeoning' }
    ];
    const w = this.map.w, h = this.map.h; const tiles = this.map.tiles;
    for (let j=1;j<h-1;j++) for (let i=1;i<w-1;i++) {
      if (tiles[j*w+i].type !== 'floor') continue; if (Math.random() < density) {
        const trap = types[Math.floor(rand()*types.length)];
        this.map.triggers[j*w+i] = { type:'trap', data: trap };
      }
    }
  }
  _placeTreasures(rand, density) {
    const w = this.map.w, h = this.map.h; const tiles = this.map.tiles;
    for (let j=1;j<h-1;j++) for (let i=1;i<w-1;i++) {
      if (tiles[j*w+i].type !== 'floor') continue; if (Math.random() < density*0.6) {
        this.map.triggers[j*w+i] = { type:'treasure', data: { gold: 5+Math.floor(rand()*50) } };
      }
    }
  }
  _spawnEnemies(rand, density) {
    // Basic bestiary (SRD-like placeholders)
    const mobs = [
      { name:'Goblin', hp:7, ac:15, cr:0.25, friendly:false },
      { name:'Kobold', hp:5, ac:12, cr:0.125, friendly:false },
      { name:'Bandit', hp:11, ac:12, cr:0.125, friendly:false },
      { name:'Wolf', hp:11, ac:13, cr:0.25, friendly:false },
    ];
    const s =  this.tokens.vtt.state.gridSize;
    for (let j=1;j<this.map.h-1;j++) for (let i=1;i<this.map.w-1;i++){
      if (this.map.tiles[j*this.map.w+i].type !== 'floor') continue; if (rand() < density*0.3){
        const m = mobs[Math.floor(rand()*mobs.length)];
        const { x, y } = { x: i*s, y: j*s };
        this.tokens.addToken({ ...m, x, y, size:1 });
      }
    }
  }

  handleStepOn(i,j, token, log) {
    const idx = j*this.map.w+i; const trig = this.map.triggers[idx]; if (!trig) return;
    if (trig.type === 'trap'){
      const d = trig.data;
      const save = roll('1d20') + 2; // assume Dex +2 for demo
      const passed = save >= d.dc;
      const dmg = passed ? 0 : roll(d.dmg);
      log(`[Trap] ${token.name} triggers ${d.name}. ${d.text}. Save=${save}${passed?' (success)':' (fail)'}; Damage=${dmg}`);
      if (!passed) token.hp = Math.max(0, token.hp - dmg);
      delete this.map.triggers[idx];
    } else if (trig.type === 'treasure'){
      log(`[Treasure] ${token.name} finds ${trig.data.gold} gp!`);
      delete this.map.triggers[idx];
    }
  }
}
