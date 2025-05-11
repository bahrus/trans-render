import {Transform, XForm} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

const div = document.querySelector('div')!;

interface MedalCountRank{
    rank: number,
    noc: string,
    gold: number,
    silver: number,
    bronze: number
    total: number

}

interface Props{
    list: Array<MedalCountRank>
}

interface Methods{

}

type Model = Props & Methods;

const model= {
    list: [
        {rank: 1, noc: 'United States', gold: 40, silver: 44, bronze: 42, total: 126},
        {rank: 2, noc: 'China', gold: 40, silver: 27, bronze: 24, total: 91},
        {rank: 3, noc: 'Japan', gold: 20, silver: 27, bronze: 13, total: 45},
    ]
} as Model & RoundaboutReady;

Transform<Props, Methods>(div, model, {
});