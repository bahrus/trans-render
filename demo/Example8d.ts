import {Transform} from '../Transform.js';

interface Props {
    booleanValue: boolean,
    stringValue: string,
}
interface Methods{
    
}
const model: Props & Methods = {
    booleanValue: false,
    stringValue: ''
}
const form = document.querySelector('form')!;
Transform<Props, Methods>(form, model, {
    input: {
        m:[
            {
                on: 'focus',
                toggle: 'booleanValue'
            },
            {
                on: 'input',
                s: 'stringValue',
                toValFrom: 'value'
            }
        ]
            
    },
    '. booleanValue': 0,
    '# stringValue': 0,
});