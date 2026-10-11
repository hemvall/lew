/* Bloub, Jérémy Perret, MIT. See ../BLOUB-LICENSE.txt. */
import { PROFILE_SAMPLES } from './profiles.js';
import { estHex, normaliseHex } from './texture.js';
import { hullOfCircles, profileFromPolygon, regularPolygonProfile, superellipseProfile, unionOfCirclesProfile, unionOfEllipsesProfile } from './shape.js';
function normalize(radii, max = 1) {
    const peak = Math.max(...radii);
    if (peak <= 0) return radii;
    const k = max / peak;
    return radii.map((r)=>r * k);
}
const ANGLES = Array.from({
    length: PROFILE_SAMPLES
}, (_, i)=>i / PROFILE_SAMPLES * Math.PI * 2);
const pebble = normalize(ANGLES.map((a)=>1 + 0.075 * Math.cos(2 * a + 0.5) + 0.035 * Math.cos(3 * a + 2.1)), 1.02);
const cloud = normalize(unionOfCirclesProfile([
    {
        x: -0.44,
        y: 0.2,
        r: 0.54
    },
    {
        x: 0.46,
        y: 0.2,
        r: 0.5
    },
    {
        x: 0.02,
        y: 0.3,
        r: 0.6
    },
    {
        x: -0.24,
        y: -0.3,
        r: 0.48
    },
    {
        x: 0.3,
        y: -0.24,
        r: 0.44
    }
]), 1.02);
const droplet = normalize(profileFromPolygon(hullOfCircles(0, 0.28, 0.66, 0, -0.96, 0.05), 0, 0), 1.04);
const capsule = profileFromPolygon(hullOfCircles(-0.42, 0, 0.62, 0.42, 0, 0.62), 0, 0);
const UNITE_LABO = 120;
const bras = {
    a: 108.11015625 / 2 / UNITE_LABO,
    b: 81.6 / 2 / UNITE_LABO
};
const zh = normalize(unionOfEllipsesProfile([
    {
        x: 0,
        y: 0,
        a: 1,
        b: 1
    },
    {
        x: -103.30437876033604 / UNITE_LABO,
        y: 30.4449714479682 / UNITE_LABO,
        ...bras,
        rot: -14.843359375
    },
    {
        x: 98.15429266544173 / UNITE_LABO,
        y: 32.55003025735345 / UNITE_LABO,
        ...bras,
        rot: 15.175
    }
]), 1.15);
export const SHAPES = [
    {
        id: 'cercle',
        radii: new Array(PROFILE_SAMPLES).fill(1)
    },
    {
        id: 'galet',
        radii: pebble
    },
    {
        id: 'squircle',
        radii: normalize(superellipseProfile(4.2), 1.15)
    },
    {
        id: 'capsule',
        radii: capsule
    },
    {
        id: 'triangle',
        radii: regularPolygonProfile(3, 1.12, 0.34, -90)
    },
    {
        id: 'hexagone',
        radii: regularPolygonProfile(6, 1.04, 0.26, 0)
    },
    {
        id: 'nuage',
        radii: cloud
    },
    {
        id: 'goutte',
        radii: droplet
    },
    {
        id: 'zh',
        radii: zh
    }
];
export const SHAPE_BY_ID = new Map(SHAPES.map((s)=>[
        s.id,
        s
    ]));
export const DEFAULT_SHAPE = 'cercle';
export const COLORS = [
    {
        id: 'encre',
        hex: '#0a0a0c'
    },
    {
        id: 'brun',
        hex: '#8b5e3c'
    },
    {
        id: 'rouge',
        hex: '#e8483f'
    },
    {
        id: 'orange',
        hex: '#f08a24'
    },
    {
        id: 'mandarine',
        hex: '#ff8b00'
    },
    {
        id: 'ambre',
        hex: '#f0b429'
    },
    {
        id: 'vert',
        hex: '#3ecf8e'
    },
    {
        id: 'turquoise',
        hex: '#2fbfa0'
    },
    {
        id: 'bleu',
        hex: '#3b93f0'
    },
    {
        id: 'violet',
        hex: '#8b5cf6'
    },
    {
        id: 'rose',
        hex: '#e152b0'
    },
    {
        id: 'gris',
        hex: '#a3a3a3'
    },
    {
        id: 'creme',
        hex: '#f1efe9'
    }
];
export const COLOR_BY_ID = new Map(COLORS.map((c)=>[
        c.id,
        c
    ]));
export const DEFAULT_COLOR = 'encre';
export function resoudreCouleur(valeur) {
    if (!valeur) return COLOR_BY_ID.get(DEFAULT_COLOR).hex;
    const connue = COLOR_BY_ID.get(valeur);
    if (connue) return connue.hex;
    return normaliseHex(valeur) ?? COLOR_BY_ID.get(DEFAULT_COLOR).hex;
}
export function estCouleurValide(valeur) {
    return COLOR_BY_ID.has(valeur) || estHex(valeur);
}
export function mixHex(from, to, t) {
    const parse = (h)=>{
        const v = parseInt(h.slice(1), 16);
        return [
            v >> 16 & 255,
            v >> 8 & 255,
            v & 255
        ];
    };
    const a = parse(from);
    const b = parse(to);
    const c = a.map((x, i)=>Math.round(x + (b[i] - x) * t));
    return `#${c.map((x)=>x.toString(16).padStart(2, '0')).join('')}`;
}
