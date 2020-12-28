Take 3

```JavaScript
const newTemplate = createTemplate(...);
const idMaps = {id1: symbol(), id2: symbol()};
const partMaps = {part1: symbol(), part2: symbol()};
const classMaps = {class1: symbol(), class2: symbol()};
function myPlugin(ctx: RenderContext, pia: PlugInArgs){
    ...
}
const ctx = new RenderContext(host);
ctx[myPluginSymbol] = myPlugin;
templuck(newTemplate, {idMaps, partMaps, classMaps}, 'id', ctx.host | ctx.cache);

bind(newTemplate, ctx);



```

rules:  

bind only recognizes lhs of symbols

rhs:  string
      template shadow or simple slotted
      Peat
      that's it, rest is plugin

plugin:

```JavaScript


```