// Map data: tile grid and helpers
export class MapData {
  constructor(w = 50, h = 50) {
    this.w = w; this.h = h;
    this.tiles = new Array(w * h).fill({ type: 'floor' }); // default floor
    this.meta = { biome: 'dungeon', seed: null, difficulty: 'normal', markers: [] };
    this.version = 1;
    this.triggers = {}; // key: idx -> { type:'trap'|'treasure', data: {...} }
  }

  idx(i, j) { return j * this.w + i; }
  inBounds(i, j) { return i >= 0 && j >= 0 && i < this.w && j < this.h; }
  get(i, j) { return this.tiles[this.idx(i, j)]; }
  set(i, j, v) { this.tiles[this.idx(i, j)] = v; }

  toJSON() {
    return { w: this.w, h: this.h, tiles: this.tiles, meta: this.meta, triggers: this.triggers, version: this.version };
  }
  static fromJSON(json) {
    const m = new MapData(json.w, json.h); m.tiles = json.tiles; m.meta = json.meta || {}; if (!m.meta.markers) m.meta.markers = []; m.triggers = json.triggers || {}; m.version = json.version || 1; return m;
  }
}
