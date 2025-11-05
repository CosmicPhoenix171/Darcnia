// Networking adapter: Local (BroadcastChannel) and placeholder Firebase
export class Network {
  constructor() {
    this.session = 'local-demo';
    this.role = 'dm';
    this.clientId = Math.random().toString(36).slice(2,9);
    this.adapter = selectAdapter(this.session, this.clientId);
  }

  connect(session, role='dm') {
    this.session = session || 'local-demo';
    this.role = role; this.adapter = selectAdapter(this.session, this.clientId);
  }

  on(event, fn){ this.adapter.on(event, fn); }
  emit(event, data){ this.adapter.emit(event, { ...data, __from: this.clientId, __role: this.role }); }
}

class LocalAdapter {
  constructor(name, clientId) { this.name = name; this.clientId = clientId; this.ch = new BroadcastChannel('darcnia-'+name); this.handlers = {}; this.ch.onmessage = (e)=>this._recv(e.data); }
  on(ev, fn){ (this.handlers[ev] ||= []).push(fn); }
  emit(ev, data){ this.ch.postMessage({ev, data}); }
  _recv({ev, data}){ if (data && data.__from === this.clientId) return; (this.handlers[ev]||[]).forEach(f=>f(data)); }
}

// Firebase adapter using Realtime Database (compat API loaded on page)
export class FirebaseAdapter {
  constructor(name, clientId) {
    this.name = name; this.clientId = clientId; this.handlers = {};
    this.db = (typeof window !== 'undefined') ? window.database : null;
    this.firebaseNS = (typeof window !== 'undefined') ? window.firebase : null;
    if (!this.db) throw new Error('Firebase database not available');
    this.eventsRef = this.db.ref(`sessions/${name}/events`);
    // presence (best-effort)
    try {
      const presRef = this.db.ref(`sessions/${name}/presence/${clientId}`);
      presRef.onDisconnect().remove();
      presRef.set({ at: this.firebaseNS?.database?.ServerValue?.TIMESTAMP || Date.now() });
    } catch(_){}
    // listen to new events
    this._onChild = (snap)=>{
      const payload = snap.val(); if (!payload) return;
      const { ev, data } = payload;
      if (data && data.__from === this.clientId) return;
      (this.handlers[ev]||[]).forEach(fn=> fn(data));
    };
    this.eventsRef.limitToLast(200).on('child_added', this._onChild);
  }
  on(ev, fn){ (this.handlers[ev] ||= []).push(fn); }
  emit(ev, data){
    try {
      const p = this.eventsRef.push({ ev, data });
      if (p && typeof p.catch === 'function') p.catch((e)=>console.warn('[FirebaseAdapter] emit failed', ev, e));
    } catch(e){ console.warn('[FirebaseAdapter] emit error', ev, e); }
  }
}

function selectAdapter(session, clientId){
  try {
    if (typeof window !== 'undefined' && window.database) {
      return new FirebaseAdapter(session, clientId);
    }
  } catch(_){}
  return new LocalAdapter(session, clientId);
}
