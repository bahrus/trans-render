import { Transform } from '../Transform.js';
const model = {
    isHappy: true,
    isVegetarian: false,
    isSad: true,
    isNeutral: false,
};
const div = document.querySelector('div');
Transform(div, model, {
    '-o isVegetarian -s ariaChecked': 0,
    '-o isHappy -s ariaDisabled': 0
});
