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

Transform<Props, Actions, ARIAMixin>(div, model, {
    '-o isVegetarian -s ariaChecked': 0,
    '-o isHappy -s ariaDisabled': 0
});