import {Transform, ITransformer} from '../Transform.js';

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
        a: 'handleInput'
    },
    span: 'isHappy'
});