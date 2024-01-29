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

const div = document.querySelector('div');



