import {Transform, XForm} from '../Transform.js';

interface ListItem{
    myProp: string,
}

interface Props{
    list: Array<ListItem>
}

interface Methods{

}

type Model = Props & Methods;

const model: Model = {
    list: [
        {
            myProp: 'row 1'
        },
        {
            myProp: 'row 2'
        }
    ]
};

const div = document.querySelector('div')!;

Transform<Props, Methods>(div, model, {
    '$ list': {
        f:{
            each: 0,
            clone: '[aria-rowindex="0"]',
            xform:{
                '| myProp': 0
            },
            appendTo: 'tbody',
            indexProp: 'ariaRowIndex',
            timestampProp: 'myProp',
        }
    }
});

setTimeout(() => {
    console.log('update model');
    const list = [
        {
            myProp: 'row 4'
        },
    ];
    model.list = list;
    
}, 2000);

