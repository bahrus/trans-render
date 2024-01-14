import {Transform} from '../Transform.js';

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
const model: Props = {
    myDate: new Date(),
    myTemplate
};

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


