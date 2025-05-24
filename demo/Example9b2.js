import { Transform } from '../Transform.js';
const div = document.querySelector('div');
const model = {
    list: [
        { rank: 1, noc: 'United States', gold: 40, silver: 44, bronze: 42, total: 126 },
        { rank: 2, noc: 'China', gold: 40, silver: 27, bronze: 24, total: 91 },
        { rank: 3, noc: 'Japan', gold: 20, silver: 27, bronze: 13, total: 45 },
    ]
};
Transform(div, model, {
    '| list': {
        $: {
            name: 'NationalMedalList',
            config: {
                ishListCountProp: 'itemCount',
                propInfo: {
                    totalMedalCount: {
                        def: 0,
                    },
                    itemCount: {}
                },
                // compacts:{
                //     when_ishList_changes_dispatch: 'ishListChanged'
                // },
                actions: {
                    calcTotal: {
                        do: (self) => ({
                            totalMedalCount: Array.from(self).reduce((acc, item) => acc + item.total, 0)
                        }),
                        ifKeyIn: ['itemCount']
                    }
                },
                xform: {
                    '-o totalMedalCount': 0,
                }
            }
        }
    },
    '* tbody>tr:first-child': {
        $$: {
            config: {
                propInfo: {
                    rank: {}, noc: {}, gold: {}, silver: {}, bronze: {}, total: {}, idx: {},
                },
                xform: {
                    ':root': [
                        { o: 'idx', s: 'ariaRowIndex' },
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
                itemProp: 'CountryMedalCount',
            }
        }
    }
});
