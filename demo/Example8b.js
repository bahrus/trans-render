import { Transform } from '../Transform.js';
const model = {
    selectedItem: 'sandwich'
};
const div = document.querySelector('div');
const propagator = new EventTarget();
Transform(div, model, {
    button: {
        m: {
            on: 'click',
            s: 'selectedItem',
            toValFrom: '.dataset.val'
        }
    },
    '$ selectedItem': 0
}, propagator);
