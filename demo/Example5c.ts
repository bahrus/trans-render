import {Transform, ITransformer} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

interface Props {
    isHappy: boolean,
}
interface Actions {
    handleChange: (e: Event, transformer: ITransformer<Props, Actions>) => void;
}
const model = {
    isHappy: false,
    handleChange: (e: Event, {model}) => {
        model.isHappy = !model.isHappy;
        
    }
} as Props & Actions & RoundaboutReady;

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