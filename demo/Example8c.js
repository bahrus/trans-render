import { Transform } from '../Transform.js';
const model = {
    booleanValue: false
};
const div = document.querySelector('div');
const propagator = new EventTarget();
Transform(div, model, {
    button: {
        m: {
            on: 'click',
            toggle: 'booleanValue'
        }
    },
    '# booleanValue': 0
}, propagator);
