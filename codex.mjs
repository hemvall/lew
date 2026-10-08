import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

export class Codex {
  constructor(onEvent, command = process.env.LEW_CODEX_BIN || 'codex') {
    this.pending = new Map(); this.next = 0; this.onEvent = onEvent;
    this.process = spawn(command, ['app-server'], { stdio: ['pipe', 'pipe', 'pipe'] });
    this.process.stderr.on('data', () => {});
    createInterface({ input: this.process.stdout }).on('line', line => {
      let m; try { m = JSON.parse(line); } catch { return; }
      if (m.id !== undefined && !m.method) {
        const p = this.pending.get(m.id); if (!p) return;
        this.pending.delete(m.id); clearTimeout(p.timer);
        m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result);
      } else this.onEvent(m);
    });
    const fail = error => {
      if (this.dead) return;
      this.dead = true;
      for (const p of this.pending.values()) { clearTimeout(p.timer); p.reject(error); }
      this.pending.clear(); this.onEvent({ method: 'lew/workerError', params: { message: error.message } });
    };
    this.process.on('error', fail);
    this.process.on('exit', code => fail(new Error(`Le processus Codex s'est arrêté (${code}).`)));
  }
  send(m) { if (this.dead) throw new Error('Codex indisponible'); this.process.stdin.write(JSON.stringify(m) + '\n'); }
  request(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.next;
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`Délai dépassé : ${method}`)); }, 30000);
      this.pending.set(id, { resolve, reject, timer });
      try { this.send({ id, method, params }); } catch (e) { clearTimeout(timer); this.pending.delete(id); reject(e); }
    });
  }
  async initialize() {
    await this.request('initialize', { clientInfo: { name: 'lew', title: 'lew', version: '0.1.0' } });
    this.send({ method: 'initialized', params: {} });
  }
  close() { this.process.kill(); const timer=setTimeout(()=>this.process.kill('SIGKILL'),1500); timer.unref(); }
}
