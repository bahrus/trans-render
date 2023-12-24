import {Transform} from '../../Transform.js';
import {ITransformer} from '../../types';

interface Props {
    isHappy: boolean,
}
interface Actions {
    handleInput: (e: Event, transformer: ITransformer<Props, Actions>) => void;
}
const model: Props & Actions = {
    isHappy: false,
    handleInput: (e: Event, {model, propagator}) => {
        model.isHappy = !model.isHappy;
        propagator?.dispatchEvent(new Event('isHappy'));
        
    }
}
const form = document.querySelector('form')!;
const propagator = new EventTarget();

Transform<Props, Actions>(form, model, {
    input: {
        a: 'handleInput'
    },
    span: 'isHappy'
}, propagator);