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
        <template id="F">
            It's Friday I'm in love
        </template>
        <template id="Opening">
            <span jsname="YS01Ge">I don't care if |.Day1|'s blue</span><br>
            <span jsname="YS01Ge">|.Day2|'s gray and |.Day3| too</span><br>
            <span jsname="YS01Ge">|.Day4| I don't care about you</span><br>
            <span jsname="YS01Ge">It's Friday I'm in love</span>
        </template>
        <template id="MF">
            <div jsname="U8S5sf" class="UH8R2 opening"></div>
            <div jsname="U8S5sf" class="UH8R2">
                <span jsname="YS01Ge">|.Day1| you can fall apart</span><br>
                <span jsname="YS01Ge">|.Day2| |.Day3| break my heart</span><br>
                <span jsname="YS01Ge">Oh, |.Day4| doesn't even start</span><br>
                <span jsname="YS01Ge" class="F"></span>
            </div>
            <div jsname="U8S5sf" class="UH8R2">
                <span jsname="YS01Ge">|.Day6| wait</span><br>
                <span jsname="YS01Ge">And |.Day7| always comes too late</span><br>
                <span jsname="YS01Ge">But |.Day5| never hesitate</span>
            </div>

            <div jsname="U8S5sf" class="UH8R2">
                <span jsname="YS01Ge">I don't care if |.Day1|'s black</span><br>
                <span jsname="YS01Ge">Tuesday, Wednesday heart attack</span><br>
                <span jsname="YS01Ge">Thursday never looking back</span><br>
                <span jsname="YS01Ge" class="F"></span>
            </div>
            <div jsname="U8S5sf" class="UH8R2">
                <span jsname="YS01Ge">|.Day1| you can hold your head</span><br>
                <span jsname="YS01Ge">|.Day2|, |.Day3| stay in bed</span><br>
                <span jsname="YS01Ge">Or |.Day4| watch the walls instead</span><br>
                <span jsname="YS01Ge" class="F"></span>
            </div>
            <div jsname="U8S5sf" class="UH8R2">
                <span jsname="YS01Ge">|.Day6| wait</span><br>
                <span jsname="YS01Ge">And |.Day7| always comes too late</span><br>
                <span jsname="YS01Ge">But |.Day5| never hesitate</span>
            </div>
            <div jsname="U8S5sf" class="UH8R2">
                <span jsname="YS01Ge">Dressed up to the eyes</span><br>
                <span jsname="YS01Ge">It's a wonderful surprise</span><br>
                <span jsname="YS01Ge">To see your shoes and your spirits rise</span><br>
                <span jsname="YS01Ge">Throwing out your frown</span><br>
                <span jsname="YS01Ge">And just smiling at the sound</span><br>
                <span jsname="YS01Ge">And as sleek as a shriek</span><br>
                <span jsname="YS01Ge">Spinning round and round</span><br>
                <span jsname="YS01Ge">Always take a big bite</span><br>
                <span jsname="YS01Ge">It's such a gorgeous sight</span><br>
                <span jsname="YS01Ge">To see you in the middle of the night</span><br>
                <span jsname="YS01Ge">You can never get enough</span><br>
                <span jsname="YS01Ge">Enough of this stuff</span><br>
                <span jsname="YS01Ge">It's |.Day5|</span><br>
                <span jsname="YS01Ge">I'm in love</span>
            </div>
            <div jsname="U8S5sf" class="UH8R2 opening"></div>
            <div jsname="U8S5sf" class="UH8R2">
                <span jsname="YS01Ge">|.Day1| you can fall apart</span><br>
                <span jsname="YS01Ge">|.Day2|, |.Day3| break my heart</span><br>
                <span jsname="YS01Ge">|.Day4| doesn't even start</span><br>
                <span jsname="YS01Ge" class="F"></span>
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
                    '.F': i => {
                        i.ctx.init(F, {}, i.ctx.leaf);

                    },
                    'div': i => {
                        i.ctx.matchFirstChild = true;
                        i.ctx.matchNextSib = true;
                    },
                    'span': i => {
                        i.ctx.leaf.textContent = i.ctx.interpolate(i.ctx.leaf.innerText, i.ctx);
                        i.ctx.matchNextSib = true;
                    },
                    'br': i => {
                        i.ctx.matchNextSib = true;
                    }
                })
            </script>
        </template>
        <div id="target">

        </div>
        <script type="module">
            import { init } from 'https://cdn.jsdelivr.net/npm/trans-render@0.0.2/trans-render-init.js';
            import { interpolate } from 'https://cdn.jsdelivr.net/npm/trans-render@0.0.2/string-interpolate.js';
            init(MF, {
                Day1: 'Monday', Day2: 'Tuesday', Day3: 'Wednesday', Day4: 'Thursday', Day5: 'Friday',
                Day6: 'Saturday', Day7: 'Sunday',
                interpolate: interpolate
            }, target);
        </script>
    </div>
</template>
</custom-element-demo>
```
-->
