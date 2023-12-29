import {Transform, ITransformer} from '../Transform.js';

interface Props {
    isHappy: boolean,
}
interface Actions {
    handleChange: (e: Event, transformer: ITransformer<Props, Actions>) => void;
}
const model: Props & Actions = {
    isHappy: false,
    handleChange: (e: Event, {model}) => {
        model.isHappy = !model.isHappy;
        
    }
}
const form = document.querySelector('form')!;

Transform<Props, Actions>(form, model, {
    input: {
        a: {
            on: 'change',
            do: (e, {model}) => {
                model.isHappy = !model.isHappy;
            }
        }
    },
    span: 'isHappy'
});