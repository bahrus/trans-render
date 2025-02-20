import {Transform} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

interface Props{
    myDate: Date;
    myTemplate: HTMLTemplateElement;
}

interface Methods{
}

const div = document.querySelector('div')!;
const myTemplate = document.createElement('template');
myTemplate.innerHTML = String.raw `
<div>
    <span>Some Template Content</span>
</div>
`;
const model ={
    myDate: new Date(),
    myTemplate
} as Props & RoundaboutReady;

Transform<Props & Methods>(div, model, {
    span: {
        o: 'myDate',
        d: {
            path: 'getTime|.toPrecision|2'
        }
    },
    section: {
        o: 'myTemplate',
        d: {
            path: 'content.cloneNode|true',
        },
        invoke: 'appendChild'
    }
});


