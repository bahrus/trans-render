# trans-render


trans-render provides an alternative way of instantiating a template.  It draws inspiration from the (least) popular features of xslt.  Like xslt, trans-render performs transforms on elements matching tests.

## Syntax:

```html
<template id="test">
    <detail>
        <summary></summary>
    </detail>
    <script transform>
        ({
            'detail': i => {
                i.ctx.matchFirstChild = true;
            },
            'summary': i => {
                i.target.textContent = i.ctx.model.summaryText;
            },
        })
    </script>
</template>
<div id="target">

</div>
<script type="module">
    import { init } from '../trans-render-init.js';
    const ctx = {
        model: {
            summaryText: 'hello'
        }
    };
    init(test, ctx, target);
</script>
```

Produces

```html
<div id="target">
    <detail>
        <summary>hello</summary>
    </detail>
</div>
```


