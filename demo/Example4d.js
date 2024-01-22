import { Transform } from '../Transform.js';
const model = {
    isHappy: true,
    isVegetarian: false,
    isSad: true,
    isNeutral: false,
};
const div = document.querySelector('div');
Transform(div, model, {
    '- -:x=:y': {
        forEachComboIn: [
            { x: 'aria-checked', y: ['isVegetarian', 'isHappy'] },
            { x: 'aria-disabled', y: ['isSad', 'isNeutral'] }
        ]
    }
});
