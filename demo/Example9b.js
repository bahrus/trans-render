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
            appendTo: 'tbody',
        }
    }
});
setTimeout(() => {
    console.log('update model');
    const list = [...model.list];
    list.push({
        myProp: 'row 3'
    });
    model.list = list;
}, 2000);
