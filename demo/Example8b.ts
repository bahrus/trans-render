import {Transform} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

interface Props {
    selectedItem: string,
}
interface Methods{
    
}
const model = {
    selectedItem: 'sandwich'
} as Props & Methods & RoundaboutReady;

const div = document.querySelector('div')!;
Transform<Props, Methods>(div, model, {
    button: {
        m:{
            on: 'click',
            s: 'selectedItem',
            toValFrom: '.dataset.val'
        }
    },
    '| selectedItem': 0
});