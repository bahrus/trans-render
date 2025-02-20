import {Transform} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';
interface Props {
    isHappy: boolean,
    isVegetarian: boolean,
    isSad: boolean,
    isNeutral: boolean,
}
interface Actions {
}
const model = {
    isHappy: true,
    isVegetarian: false,
    isSad: true,
    isNeutral: false,
} as Props & Actions & RoundaboutReady;

const div = document.querySelector('div')!;

Transform<Props, Actions, ARIAMixin>(div, model, {
    '-o isVegetarian -s ariaChecked': 0,
    '-o isHappy -s ariaDisabled': 0
});