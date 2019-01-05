# trans-render


trans-render provides an alternative way of instantiating a template.  It draws inspiration from the (least) popular features of xslt.  Like xslt, trans-render performs transforms on elements matching tests.

XSLT can take pure XML with no formatting instructions.  Generally, speaking, the XML that XSLT acts on isn't a bunch of meaningless div tag names.  

Likewise, with the advent of custom elements, the template markup will tend to be much more semantic, like XML. trans-render tries to rely as much as possible on this intrinisic semantic nature of the template markup, to give enough clues on how to fill in the needed "potholes" like innerText's and property setting.  But trans-render is completely extensible, so it can certainly accomodate custom markup (like string interpolation, or common binding attributes) by using additional, optional helper libraries.  

This leaves the template markup quite pristine, but it does mean that the binding instructions will tend to require looking in two places, rather one.

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

## Example 1

<!--
```
<custom-element-demo>
<template>
    <div>
        <template id="Friday">
            It's Friday I'm in love
        </template>
        <template id="Opening">
            <span>I don't care if |.Day1|'s blue</span><br>
            <span>|.Day2|'s gray and |.Day3| too</span><br>
            <span>|.Day4| I don't care about you</span><br>
            <span>It's Friday I'm in love</span>
        </template>
        <template id="Main">
            <div class="UH8R2 opening"></div>
            <div class="UH8R2">
                <span>|.Day6| wait</span><br>
                <span>And |.Day7| always comes too late</span><br>
                <span>But |.Day5| never hesitate</span>
            </div>
            <div class="UH8R2">
                <span>I don't care if |.Day1|'s black</span><br>
                <span>Tuesday, Wednesday heart attack</span><br>
                <span>Thursday never looking back</span><br>
                <span class="Friday"></span>
            </div>
            <div class="UH8R2">
                <span>|.Day1| you can hold your head</span><br>
                <span>|.Day2|, |.Day3| stay in bed</span><br>
                <span>Or |.Day4| watch the walls instead</span><br>
                <span class="Friday"></span>
            </div>
            <div class="UH8R2">
                <span>|.Day6| wait</span><br>
                <span>And |.Day7| always comes too late</span><br>
                <span>But |.Day5| never hesitate</span>
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
                <span>It's |.Day5|</span><br>
                <span>I'm in love</span>
            </div>
            <div class="UH8R2 opening"></div>
            <div class="UH8R2">
                <span>|.Day1| you can fall apart</span><br>
                <span>|.Day2|, |.Day3| break my heart</span><br>
                <span>|.Day4| doesn't even start</span><br>
                <span class="Friday"></span>
            </div>
            <style>
                .UH8R2{
                        padding-top: 20px;
                    }
                </style>
            <script transform>
                ({
                    '.opening': i => {
                        i.ctx.init(Opening, Object.assign({}, i.ctx), i.ctx.leaf);
                        i.ctx.matchFirstChild = true;
                    },

                    'div': i => {
                        i.ctx.matchFirstChild = {
                            'span': i => {
                                i.ctx.leaf.textContent = i.ctx.interpolate(i.ctx.leaf.innerText, i.ctx);
                            },
                            '*': i => {
                                i.ctx.matchNextSib = true;
                            },
                            '.Friday': i => {
                                i.ctx.init(Friday, {}, i.ctx.leaf);
                            },
                        };
                        i.ctx.matchNextSib = true;
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
