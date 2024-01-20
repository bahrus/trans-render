import {Transform} from '../Transform.js';
interface Props {
    isHappy: boolean,
}
interface Actions {
}
const model: Props & Actions = {
    isHappy: false,
}
const div = document.querySelector('div')!;

Transform<Props, Actions>(div, model, {
    '- -some-bool-prop=isHappy': 0
});