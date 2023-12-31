import { Transform } from '../Transform.js';
const model = {
    booleanValue: false
};
const div = document.querySelector('div');
Transform(div, model, {
    button: {
        m: {
            on: 'click',
            toggle: 'booleanValue'
        }
    },
    '# booleanValue': 0
});
