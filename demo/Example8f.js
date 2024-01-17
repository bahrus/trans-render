import { Transform } from '../Transform.js';
const model = {};
const div = document.querySelector('div');
Transform(div, model, {
    span: {
        m: {
            on: 'load',
            s: 'greeting',
            toValFrom: 'textContent'
        }
    },
    "! greeting": 0
});
