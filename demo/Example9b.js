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
            each: 0,
            clone: '[aria-rowindex="0"]',
            xform: {
                '| myProp': 0
            },
            appendTo: 'tbody'
        }
    }
});
