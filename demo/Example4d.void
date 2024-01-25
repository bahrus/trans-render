import {Transform} from '../Transform.js';
interface Props {
    isHappy: boolean,
    isVegetarian: boolean,
    isSad: boolean,
    isNeutral: boolean,
}
interface Actions {
}
const model: Props & Actions = {
    isHappy: true,
    isVegetarian: false,
    isSad: true,
    isNeutral: false,
}
const div = document.querySelector('div')!;

Transform<Props, Actions>(div, model, {
    '- -:x=:y': {
        forEachComboIn: [
            {x: 'aria-checked', y: ['isVegetarian', 'isHappy']},
            {x: 'aria-disabled', y: ['isSad', 'isNeutral']}
        ]
    }
});