import {Transform} from '../Transform.js';
import {ITransformer} from '../ts-refs/trans-render/types.js'; 

interface Props {
    isHappy: boolean,
}
interface Actions {
    handleInput: (e: Event, transformer: ITransformer<Props, Actions>) => void;
}
const model: Props & Actions = {
    isHappy: false,
    handleInput: (e: Event, {model}) => {
        model.isHappy = !model.isHappy;
    }
}
const form = document.querySelector('form')!;

Transform<Props, Actions>(form, model, {
    input: {
        a: ['handleInput', {
            on: 'change',
            do: (e, {model}) => {
                model.isHappy = !model.isHappy;
            }
        }]
    },
    span: 'isHappy'
});