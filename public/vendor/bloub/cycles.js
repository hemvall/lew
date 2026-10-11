/* Bloub, Jérémy Perret, MIT. See ../BLOUB-LICENSE.txt. */
import { SEQUENCE, STATES, STATE_BY_ID } from './states.js';
export const MIN_BLOCK = Math.max(...STATES.map((s)=>s.morph));
export const MAX_BLOCK = 10;
export const MAX_BLOCS = 200;
export const MAX_CYCLES = 50;
export const STEP = 0.1;
const DEFAULT_CYCLE_ID = 'defaut';
export function minDurationOf(state) {
    return Math.max(MIN_BLOCK, STATE_BY_ID.get(state)?.minDuration ?? MIN_BLOCK);
}
export function clampDuration(state, seconds) {
    const snapped = Math.round(seconds / STEP) * STEP;
    const bounded = Math.min(MAX_BLOCK, Math.max(minDurationOf(state), snapped));
    return Math.round(bounded * 100) / 100;
}
export function makeBlock(state) {
    return {
        state,
        duration: clampDuration(state, STATE_BY_ID.get(state)?.duration ?? 2)
    };
}
export function defaultCycle() {
    return {
        name: '',
        id: DEFAULT_CYCLE_ID,
        blocks: SEQUENCE.map(makeBlock)
    };
}
export function totalDuration(blocks) {
    return blocks.reduce((sum, b)=>sum + b.duration, 0);
}
export function offsetOf(blocks, index) {
    let acc = 0;
    for(let i = 0; i < index && i < blocks.length; i++)acc += blocks[i].duration;
    return acc;
}
export function blockAt(blocks, t) {
    const total = totalDuration(blocks);
    if (!blocks.length || total <= 0) return {
        index: 0,
        elapsed: 0
    };
    const wrapped = t >= 0 && t < total ? t : (t % total + total) % total;
    let acc = 0;
    for(let i = 0; i < blocks.length; i++){
        const end = acc + blocks[i].duration;
        if (wrapped < end) return {
            index: i,
            elapsed: wrapped - acc
        };
        acc = end;
    }
    return {
        index: blocks.length - 1,
        elapsed: 0
    };
}
export function blocksWith(blocks, state) {
    if (blocks.length >= MAX_BLOCS) return blocks;
    return [
        ...blocks,
        makeBlock(state)
    ];
}
export function moveBlock(blocks, from, to) {
    const next = blocks.slice();
    const [moved] = next.splice(from, 1);
    if (!moved) return blocks;
    next.splice(Math.min(Math.max(to, 0), next.length), 0, moved);
    return next;
}
export function uniqueName(base, cycles) {
    const taken = new Set(cycles.map((c)=>c.name));
    if (!taken.has(base)) return base;
    let n = 2;
    while(taken.has(`${base} ${n}`))n++;
    return `${base} ${n}`;
}
export function nextCycleId(cycles) {
    const taken = new Set(cycles.map((c)=>c.id));
    let n = 1;
    while(taken.has(`c${n}`))n++;
    return `c${n}`;
}
function parseBlock(raw) {
    if (typeof raw !== 'object' || raw === null) return null;
    const { state, duration } = raw;
    if (typeof state !== 'string' || !SEQUENCE.includes(state)) return null;
    if (typeof duration !== 'number' || !Number.isFinite(duration)) return null;
    return {
        state: state,
        duration: clampDuration(state, duration)
    };
}
function parseCycle(raw, seen) {
    if (typeof raw !== 'object' || raw === null) return null;
    const { id, name, blocks } = raw;
    if (typeof id !== 'string' || !id) return null;
    if (typeof name !== 'string') return null;
    if (!Array.isArray(blocks)) return null;
    const kept = blocks.slice(0, MAX_BLOCS).map(parseBlock).filter((b)=>b !== null);
    if (!kept.length) return null;
    if (seen.some((c)=>c.id === id)) return null;
    return {
        id,
        name,
        blocks: kept
    };
}
export function parseCycles(raw) {
    if (!raw) return [];
    let data;
    try {
        data = JSON.parse(raw);
    } catch  {
        return [];
    }
    if (!Array.isArray(data)) return [];
    const out = [];
    for (const item of data.slice(0, MAX_CYCLES)){
        const cycle = parseCycle(item, out);
        if (cycle) out.push(cycle);
    }
    return out;
}
