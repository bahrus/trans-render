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
    list: Array<MedalCountRank>,
    totalMedalCount?: number,
    itemCount?: number,
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
    '| list':{
        $: {
            name: 'WorldRankingList',
            config:{
                ishListCountProp: 'itemCount',
                propInfo: {
                    totalMedalCount: {
                        def: 0,
                    },
                    itemCount:{}
                },
                actions:{
                    calcTotal: {
                        do: (self) => ({
                            totalMedalCount: Array.from(self).reduce((acc, item) => acc + (item as any).total, 0)
                        }),
                        ifKeyIn: ['itemCount']
                    }
                },
                xform:{
                    '-o totalMedalCount': 0,
                    '* tbody>tr:first-child': {
                        $$: {
                            config: {
                                propInfo:{
                                    rank: {}, noc: {}, gold: {}, silver: {}, bronze: {}, total: {}, idx: {},
                                },
                                xform: {
                                    ':root': [
                                        {o: 'idx', s: 'ariaRowIndex'},
                                    ],
                                    '| rank': 0, '| noc': 0, '| gold': 0, '| silver': 0, '| bronze': 0, '| total': 0,
                                },
                                inScopeXForms: {
                                    '.totals': {
                                        '| total': 0
                                    }
                                }                
                            },
                            options: {
                                itemScopes: ['CountryMedalCount'],

                            }
                        }
                    },
                }                
                    
            }
        }
    },

});

setTimeout(() => {
    model.list[0].gold = 12345678;
}, 2000);