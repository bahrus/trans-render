import { Transform } from '../Transform.js';
const model = {
    greeting: ''
};
const div = document.querySelector('div');
Transform(div, model, {
    "| greeting": {
        y: 0
    }
});
