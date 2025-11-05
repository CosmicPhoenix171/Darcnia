// Networking adapter: Local (BroadcastChannel) and placeholder Firebase
export class Network {
  constructor() {
    this.session = 'local-demo';
    this.role = 'dm';
    this.clientId = Math.random().toString(36).slice(2,9);
    this.adapter = new LocalAdapter(this.session, this.clientId);
  }

  connect(session, role='dm') {
    this.session = session || 'local-demo';
    this.role = role; this.adapter = new LocalAdapter(this.session, this.clientId);
  }

  on(event, fn){ this.adapter.on(event, fn); }
  emit(event, data){ this.adapter.emit(event, { ...data, __from: this.clientId }); }
}

class LocalAdapter {
  constructor(name, clientId) { this.name = name; this.clientId = clientId; this.ch = new BroadcastChannel('darcnia-'+name); this.handlers = {}; this.ch.onmessage = (e)=>this._recv(e.data); }
  on(ev, fn){ (this.handlers[ev] ||= []).push(fn); }
  emit(ev, data){ this.ch.postMessage({ev, data}); }
  _recv({ev, data}){ if (data && data.__from === this.clientId) return; (this.handlers[ev]||[]).forEach(f=>f(data)); }
}

// Firebase placeholder showing expected interface
export class FirebaseAdapter {
  constructor(config) { this.config = config; /* TODO: implement */ }
  on(ev, fn){}
  emit(ev, data){}
}
