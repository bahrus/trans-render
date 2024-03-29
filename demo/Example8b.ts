import {Transform} from '../Transform.js';

interface Props {
    selectedItem: string,
}
interface Methods{
    
}
const model: Props & Methods = {
    selectedItem: 'sandwich'
}
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