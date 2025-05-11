import { Transform } from '../Transform.js';
const div = document.querySelector('div');
const model = {
    list: [
        { rank: 1, noc: 'United States', gold: 40, silver: 44, bronze: 42, total: 126 },
        { rank: 2, noc: 'China', gold: 40, silver: 27, bronze: 24, total: 91 },
        { rank: 3, noc: 'Japan', gold: 20, silver: 27, bronze: 13, total: 45 },
    ]
};
Transform(div, model, {});
