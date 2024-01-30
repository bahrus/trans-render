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
        '$ itemListElement': {
            '| prop1': 0,
            411: {
                idxFrom: 'ariaRowIndex'
            }
        }
    }
});
