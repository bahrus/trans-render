import { Transform } from '../Transform.js';
const model = {
    isHappy: true,
};
const div = document.querySelector('div');
Transform(div, model, {
    '- isHappy': {
        bindsTo: 'ariaChecked'
    }
});
