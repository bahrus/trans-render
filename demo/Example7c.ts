import {Transform} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

interface Props {
    typeToEditIsLimited: boolean,
}
interface Methods{
    
}
const model = {
    typeToEditIsLimited: true,
} as Props & Methods & RoundaboutReady;

const form = document.querySelector('form')!;

Transform<Props, Methods>(form, model, {
    input: [
        {
            o: 'typeToEditIsLimited', 
            i: {d: ({typeToEditIsLimited}: Props & Methods) => typeToEditIsLimited},
            s: {type: 'range'}
        },
        {
            o: 'typeToEditIsLimited', 
            i: {d: ({typeToEditIsLimited}: Props & Methods) => !typeToEditIsLimited},
            s: {type: 'number'}
        },
    ]
});