Take 3



```JavaScript
import {clone, bySymbol, pinTheDomKeys, byCSS} from 'somewhere';
const p = Symbol('placeholder');
const idMaps = {id1: p, id2: p};
const partMaps = {part1: p, part2: p};
const classMaps = {class1: p, class2: p};
const templates = {main: p};
const ctx = new RenderContext(host, {clone, bySymbol, pinTheDomKeys, byCSS}); 

propActions: [
    ({self, mainTemplate}) => {
        self.clonedTemplate = ...
        await import(clone, bySymbol, pinTheDomKeys, byCSS);
        self.ctx = new RenderContext(host, {clone, bySymbol...});
    },
    ({ctx, clonedTemplate}) => {
        pinTheDomKeys(clonedTemplate, ctx.host, {idMaps, partMaps, classMaps});
    }
]

({clonedTemplate, ctx}) => { //initialize
    requires: {

    },  //any function which returns false, stops
    clone:{
        template: templates.main
    },
    pinTheDomKeys:[
         //turns p into unique symbols
    ],
    bySymbol:[
        {[id1]: ...},
        {[part1]: ...}
    ]
    byCSS:{

    },
    setRoot:{

    }
}



```

rules:  

sole only recognizes lhs of symbols

rhs:  string
      Peat
      templates with slots
      replace
      that's it

multiple:

```JavaScript


```