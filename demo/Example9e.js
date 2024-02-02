import { Transform } from '../Transform.js';
const model = {
    list: [
        {
            myProp: 'row 1'
        },
        {
            myProp: 'row 2'
        }
    ]
};
const div = document.querySelector('div');
Transform(div, model, {
    '$ list': {
        f: {
            xform: {
                '| myProp': 0
            },
            timestampProp: 'myProp',
            outOfRangeProp: 'hidden',
        }
    }
});
setTimeout(() => {
    console.log('update model');
    const list = [
        {
            myProp: 'row 4'
        },
    ];
    model.list = list;
}, 2000);
setTimeout(() => {
    console.log('update model');
    const list = [
        ...model.list,
        {
            myProp: 'row 5'
        },
    ];
    model.list = list;
}, 4000);
