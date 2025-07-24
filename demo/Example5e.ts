import {Transform, ITransformer} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

interface Props {
    
}
interface Actions {
    openSesame: (e: Event, transformer: ITransformer<Props, Actions>) => void;
}
const model = {
    openSesame: (e: Event, {model}) => {
        console.log({e, model});
    }
} as Props & Actions & RoundaboutReady;
const oMenuItem = document.querySelector('menu-item')!;

Transform<Props, Actions>(oMenuItem, model, {
    '@ openSesame': {a: 0}
});