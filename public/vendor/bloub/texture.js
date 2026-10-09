/* Bloub, Jérémy Perret, MIT. See ../BLOUB-LICENSE.txt. */
export const DEGRADE = {
    cx: -0.331,
    cy: -0.397,
    rayon: 1.589,
    milieu: 0.523
};
const CLAIR = {
    teinte: 14.09,
    saturation: -13.79,
    lumiere: 15.88
};
const SOMBRE = {
    teinte: -14.58,
    saturation: 0,
    lumiere: -12.35
};
const JAUNE = 60;
const clamp01 = (v)=>Math.max(0, Math.min(100, v));
export function litHex(valeur) {
    const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(valeur.trim());
    if (!m) return null;
    const c = m[1];
    const plein = c.length === 3 ? c.replace(/./g, (d)=>d + d) : c;
    const v = parseInt(plein, 16);
    return [
        v >> 16 & 255,
        v >> 8 & 255,
        v & 255
    ];
}
export function estHex(valeur) {
    return litHex(valeur) !== null;
}
export function normaliseHex(valeur) {
    const rvb = litHex(valeur);
    return rvb ? `#${rvb.map((x)=>x.toString(16).padStart(2, '0')).join('')}` : null;
}
export function versTsl(hex) {
    const rvb = litHex(hex) ?? [
        0,
        0,
        0
    ];
    const [r, v, b] = rvb.map((x)=>x / 255);
    const max = Math.max(r, v, b);
    const min = Math.min(r, v, b);
    const l = (max + min) / 2;
    const d = max - min;
    if (d === 0) return [
        0,
        0,
        l * 100
    ];
    const s = d / (1 - Math.abs(2 * l - 1));
    let t;
    if (max === r) t = (v - b) / d % 6;
    else if (max === v) t = (b - r) / d + 2;
    else t = (r - v) / d + 4;
    return [
        (t * 60 % 360 + 360) % 360,
        s * 100,
        l * 100
    ];
}
export function versHex(teinte, saturation, lumiere) {
    const t = (teinte % 360 + 360) % 360;
    const s = clamp01(saturation) / 100;
    const l = clamp01(lumiere) / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(t / 60 % 2 - 1));
    const m = l - c / 2;
    const [r, v, b] = t < 60 ? [
        c,
        x,
        0
    ] : t < 120 ? [
        x,
        c,
        0
    ] : t < 180 ? [
        0,
        c,
        x
    ] : t < 240 ? [
        0,
        x,
        c
    ] : t < 300 ? [
        x,
        0,
        c
    ] : [
        c,
        0,
        x
    ];
    return `#${[
        r,
        v,
        b
    ].map((n)=>Math.round((n + m) * 255).toString(16).padStart(2, '0')).join('')}`;
}
function versLeJaune(teinte) {
    const arc = (JAUNE - teinte + 540) % 360 - 180;
    return Math.sign(arc) || 1;
}
export function degradeDuCorps(hex) {
    const [t, s, l] = versTsl(normaliseHex(hex) ?? '#000000');
    const sens = versLeJaune(t);
    return [
        {
            offset: 0,
            couleur: versHex(t + sens * CLAIR.teinte, s + CLAIR.saturation, l + CLAIR.lumiere)
        },
        {
            offset: DEGRADE.milieu,
            couleur: normaliseHex(hex) ?? '#000000'
        },
        {
            offset: 1,
            couleur: versHex(t + sens * SOMBRE.teinte, s + SOMBRE.saturation, l + SOMBRE.lumiere)
        }
    ];
}
