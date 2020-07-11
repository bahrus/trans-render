import {createTemplate} from '../createTemplate.js';
import {PEATUnionSettings} from '../types2.d.js';

const itemTemplate = createTemplate(/* html */`
<g class="bar">
    <rect height="19"></rect>
    <text dy=".35em"></text>
</g>
`);

const figureTemplate = createTemplate(/* html */`
<figure>
    <figcaption>A graph that shows the number of fruit collected</figcaption>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="chart" width="420" height="150" aria-labelledby="title" role="img">
        <title id="title">A bart chart showing information</title>
    </svg>
</figure>
`);



