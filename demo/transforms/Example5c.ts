import {Transform} from '../../Transform.js';
import {ITransformer} from '../../types';

interface Props {
    isHappy: boolean,
}
interface Actions {
    handleChange: (e: Event, transformer: ITransformer<Props, Actions>) => void;
}
const model: Props & Actions = {
    isHappy: false,
    handleChange: (e: Event, {model, propagator}) => {
        model.isHappy = !model.isHappy;
        propagator?.dispatchEvent(new Event('isHappy'));
        
    }
}
const form = document.querySelector('form')!;
const propagator = new EventTarget();

Transform<Props, Actions>(form, model, {
    input: {
        a: {
            on: 'change',
            do: (e, {model, propagator}) => {
                model.isHappy = !model.isHappy;
                propagator?.dispatchEvent(new Event('isHappy'));
            }
        }
    },
    span: 'isHappy'
}, propagator);