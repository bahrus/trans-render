import { Transform } from '../Transform.js';
const model = {
    booleanValue: false,
    stringValue: ''
};
const form = document.querySelector('form');
Transform(form, model, {
    input: {
        m: [
            {
                on: 'focus',
                toggle: 'booleanValue'
            },
            {
                on: 'input',
                s: 'stringValue',
                toValFrom: 'value'
            }
        ]
    },
    '. booleanValue': 0,
    '# stringValue': 0,
});
