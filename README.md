# trans-render

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/trans-render)

<a href="https://nodei.co/npm/trans-render/"><img src="https://nodei.co/npm/trans-render.png"></a>

<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/trans-render@0.0.5/dist/trans-render-init.iife.min.js?compression=gzip">

trans-render provides an alternative way of instantiating a template.  It draws inspiration from the (least) popular features of xslt.  Like xslt, trans-render performs transforms on elements by matching tests on elements.  Whereas xslt uses xpath for its tests, trans-render uses the css matches() method.

XSLT can take pure XML with no formatting instructions as its input.  Generally, speaking, the XML that XSLT acts on isn't a bunch of meaningless div tag names, but rather a nice semantic document, whose intrinsic structure is enough to go on, in order to formulate a "transform" that doesn't feel like a hack.  

Likewise, with the advent of custom elements, the template markup will tend to be much more semantic, like XML. trans-render tries to rely as much as possible on this intrinisic semantic nature of the template markup, to give enough clues on how to fill in the needed "potholes" like innerText's and property setting.  But trans-render is completely extensible, so it can certainly accommodate custom markup (like string interpolation, or common binding attributes) by using additional, optional helper libraries.  

This leaves the template markup quite pristine, but it does mean that the binding instructions will tend to require looking in two places, rather one.

The transform can be provided in the function "init".  If the transform is not present in the call, then it looks for a script tag with attribute "transform" where it expects the instructions.



One distinct advantage of separating the binding like this, is that one can place console.log's and/or breakpionts, in order to walk through the binding process.

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

"ctx" stands for "context", a place to pass things throughout the processing process.  "target" is the HTML element we are populating.

The transform script can also be nested, and it should be noted that the matches() function works with *.  So the transform above could be mofied to:

```html
<template id="test">
    <detail>
        <summary></summary>
    </detail>
    <script transform>
        ({
            '*': ({ctx}) => {
                ctx.matchFirstChild = {
                    '*': ({target, ctx}) => {
                        target.textContent = ctx.model.summaryText;
                    },
                };
            },

        })
    </script>
</template>
```

By design, trans-render is loathe do any unnessary work.  Each transform can specify whether to proceed to the next sibling:

```JavaScript
cts.matchNextSib = true;
```

And/or it can specify to match the first child:

```JavaScript
cts.matchFirstChild = true;
```

These match statements can either be booleans, as illustrated above, or they can provide a new transform match:

```html
<script transform>
    ({
        '.opening': ({ target, ctx }) => {
            ctx.init(Opening, Object.assign({}, ctx), target);
            ctx.matchFirstChild = true;
        },

        'div': ({ ctx }) => {
            ctx.matchFirstChild = {
                'span.Friday': ({ target, ctx }) => {
                    ctx.init(Friday, {}, target);
                },
                'span[x-d]': ({ target, ctx }) => {
                    target.textContent = ctx.interpolate(target.innerText, ctx);
                },
                '*': ({ ctx }) => {
                    ctx.matchNextSib = true;
                },

            };
            ctx.matchNextSib = true;
        },


    })
</script>
```



## Example 1 (only viewable at [webcomponents.org](https://www.webcomponents.org/element/trans-render) )

<!--
```
<custom-element-demo>
<template>
    <div>
        <template id="Friday">
            It's Friday I'm in love
        </template>
        <template id="Opening">
            <span x-d>I don't care if |.Day1|'s blue</span><br>
            <span x-d>|.Day2|'s gray and |.Day3| too</span><br>
            <span x-d>|.Day4| I don't care about you</span><br>
            <span>It's Friday I'm in love</span>
        </template>
        <template id="Main">
            <div class="UH8R2 opening"></div>
            <div class="UH8R2">
                <span x-d>|.Day6| wait</span><br>
                <span x-d>And |.Day7| always comes too late</span><br>
                <span x-d>But |.Day5| never hesitate</span>
            </div>
            <div class="UH8R2">
                <span x-d>I don't care if |.Day1|'s black</span><br>
                <span>Tuesday, Wednesday heart attack</span><br>
                <span>Thursday never looking back</span><br>
                <span class="Friday"></span>
            </div>
            <div class="UH8R2">
                <span x-d>|.Day1| you can hold your head</span><br>
                <span x-d>|.Day2|, |.Day3| stay in bed</span><br>
                <span x-d>Or |.Day4| watch the walls instead</span><br>
                <span class="Friday"></span>
            </div>
            <div class="UH8R2">
                <span x-d>|.Day6| wait</span><br>
                <span x-d>And |.Day7| always comes too late</span><br>
                <span x-d>But |.Day5| never hesitate</span>
            </div>
            <div class="UH8R2">
                <span>Dressed up to the eyes</span><br>
                <span>It's a wonderful surprise</span><br>
                <span>To see your shoes and your spirits rise</span><br>
                <span>Throwing out your frown</span><br>
                <span>And just smiling at the sound</span><br>
                <span>And as sleek as a shriek</span><br>
                <span>Spinning round and round</span><br>
                <span>Always take a big bite</span><br>
                <span>It's such a gorgeous sight</span><br>
                <span>To see you in the middle of the night</span><br>
                <span>You can never get enough</span><br>
                <span>Enough of this stuff</span><br>
                <span x-d>It's |.Day5|</span><br>
                <span>I'm in love</span>
            </div>
            <div class="UH8R2 opening"></div>
            <div class="UH8R2">
                <span x-d>|.Day1| you can fall apart</span><br>
                <span x-d>|.Day2|, |.Day3| break my heart</span><br>
                <span x-d>|.Day4| doesn't even start</span><br>
                <span class="Friday"></span>
            </div>
            <style>
                .UH8R2{
                        padding-top: 20px;
                    }
                </style>
            <script transform>
                ({
                    '.opening': ({ target, ctx }) => {
                        ctx.init(Opening, Object.assign({}, ctx), target);
                        ctx.matchFirstChild = true;
                    },

                    'div': ({ ctx }) => {
                        ctx.matchFirstChild = {
                            'span.Friday': ({ target, ctx }) => {
                                ctx.init(Friday, {}, target);
                            },
                            'span[x-d]': ({ target, ctx }) => {
                                target.textContent = ctx.interpolate(target.innerText, ctx);
                            },
                            '*': ({ ctx }) => {
                                ctx.matchNextSib = true;
                            },

                        };
                        ctx.matchNextSib = true;
                    },


                })
            </script>
        </template>
        <div id="target2"></div>
        <script type="module">
            import { init } from 'https://cdn.jsdelivr.net/npm/trans-render@0.0.4/trans-render-init.js';
            import { interpolate } from 'https://cdn.jsdelivr.net/npm/trans-render@0.0.4/string-interpolate.js';
            init(Main, {
                Day1: 'Monday', Day2: 'Tuesday', Day3: 'Wednesday', Day4: 'Thursday', Day5: 'Friday',
                Day6: 'Saturday', Day7: 'Sunday',
                interpolate: interpolate
            }, target2);
        </script>
    </div>
</template>
</custom-element-demo>
```
-->
