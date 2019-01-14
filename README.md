# trans-render

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/trans-render)

<a href="https://nodei.co/npm/trans-render/"><img src="https://nodei.co/npm/trans-render.png"></a>

<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/trans-render@0.0.27/dist/init.min.js?compression=gzip">

trans-render provides an alternative way of instantiating a template.  It draws inspiration from the (least) popular features of xslt.  Like xslt, trans-render performs transforms on elements by matching tests on elements.  Whereas xslt uses xpath for its tests, trans-render uses css path tests via the element.matches() and element.querySelector() methods.

XSLT can take pure XML with no formatting instructions as its input.  Generally speaking, the XML that XSLT acts on isn't a bunch of semantically  meaningless div tags, but rather a nice semantic document, whose intrinsic structure is enough to go on, in order to formulate a "transform" that doesn't feel like a hack.  

Likewise, with the advent of custom elements, the template markup will tend to be much more semantic, like XML. trans-render tries to rely as much as possible on this intrinisic semantic nature of the template markup, to give enough clues on how to fill in the needed "potholes" like textContent and property setting.  But trans-render is completely extensible, so it can certainly accommodate custom markup (like string interpolation, or common binding attributes) by using additional, optional helper libraries.  

This leaves the template markup quite pristine, but it does mean that the separation between the template and the binding instructions will tend to require looking in two places, rather than one.

## Advantages

By keeping the binding separate, the same template can thus be used to bind with different object structures.

Providing the binding transform in JS form inside the init function signature has the advantage that one can benefit from TypeScript typing of Custom and Native DOM elements with no additional IDE support.  

Another advantage of separating the binding like this, is that one can insert comments, console.log's and/or breakpoints, in order to walk through the binding process.

## Workflow

trans-render provides helper functions for cloning a template, and then walking through the DOM, applying rules in document order.  Note that the document can grow, as processing takes place (due, for example, to cloning sub templates).  It's critical, therefore, that the processing occur in a logical order, and that order is down the document tree.  That way it is fine to append nodes before continuing processing.  

For each matching element, after modifying the node, you can instruct the processor to move to the next element sibling and/or the first child of the current one, where processing can continue.  You can also "cut to the chase" by "drilling" inside based on querySelector, but there's no going back to previous elements once that's done.  The syntax for the third option is shown below for the simplest example.  If you select the drill option, that trumps instructing trans-render to process the first child.

It is deeply unfortunate that the DOM Query Api doesn't provide a convenience function for [finding the next sibling](https://gomakethings.com/finding-the-next-and-previous-sibling-elements-that-match-a-selector-with-vanilla-js/) that matches a query, similar to querySelector. Just saying.  But some support for "cutting to the chase" laterally is planned [TODO].

At this point, only a synchronous workflow is provided.

## Syntax:

```html
<template id="test">
    <detail>
        ...
        <summary></summary>
        ...
    </detail>
</template>
<div id="target"></div>
<script type="module">
    import { init } from '../init.js';
    const model = {
        summaryText: 'hello'
    }
    const transform = {
        detail: x => ({
            drill: {
                summary: x => model.summaryText
            }
        })

    };
    init(test, { transform }, target);
</script>
```

Produces

```html
<div id="target">
    <detail>
        ...
        <summary>hello</summary>
        ...
    </detail>
</div>
```

"target" is the HTML element we are populating.  The transform matches can return a string, which will be used to set the textContent of the target.  Or the transform can do its own manipulations on the target element, and then return an object specifying where to go next.

By design, trans-render is loathe to do any unnessary work.  As mentioned earlier, each transform can specify whether to proceed to the next sibling, thusly:

```JavaScript
matchNextSib: true;
```

And/or it can specify to match the first child:

```JavaScript
matchFirstChild: true;
```

And, as we've seen, you can drill down until the first matching element is found (via querySelector)

```JavaScript
return {
    drill: {
        'myCssQuery':{
            ...
        }
    }
}

```

The first two match statements above can either be booleans, as illustrated above, or they can provide a new transform match:

```JavaScript
transform: {
    div: x => ({
        matchNextSib: true,
        matchFirstChild: {
            '*': x => ({
                 matchNextSib: true
            }),
            '[x-d]': ({ target}) => {
                interpolate(target, 'textContent', model);
            },
            '[data-init]': ({ target, ctx }) => {
                if (ctx.update !== undefined) {
                    return {
                        matchFirstChild: true
                    }
                } else {
                    init(self[target.dataset.init], {
                        transform: ctx.transform
                    }, target);
                }
            },
        }
    }),
}
```

# Use Case 1:  Applying the DRY principle to (post) punk rock lyrics

## Example 1a (only viewable at [webcomponents.org](https://www.webcomponents.org/element/trans-render) )

<!--
```
<custom-element-demo>
<template>
    <div>
        <a href="https://www.youtube.com/watch?v=2-Lb-JhsaEk" target="_blank">Something's gone wrong again</a>
        <template id="Title">Something's gone wrong again</template>
        <template id="Title2">Something goes wrong again</template>
        <template id="Again">And again</template>
        <template id="Again2">And again, and again, again and something's gone wrong again</template>
        <template id="Again3">And again, and again, again and something goes wrong again</template>
        <template id="Agains">
            <span data-init="Again"></span><br>
            <span data-init="Again2"></span><br>
            <span data-init="Title"></span>
        </template>
        <template id="Agains2">
            <span data-init="Title2"></span><br>
            <span data-init="Again"></span><br>
            <span data-init="Again3"></span><br>
            <span data-init="Title2"></span>
        </template>
        <template id="bus">
            <span>Nothing ever happens to people like us</span><br>
            <span>'Cept we miss the bus, something goes wrong again</span><br>
            <span>Need a smoke, use my last fifty P.</span><br>
            <span>But the machine is broke, something's gone wrong again</span>
        </template>
        <template id="Main">
            <div>
                <span>Tried to find my sock</span><br>
                <span>No good, it's lost</span><br>
                <span data-init="Title"></span><br>
                <span>Need a shave</span><br>
                <span>Cut myself, need a new blade</span><br>
                <span data-init="Title"></span>
            </div>
            <div data-init="Agains"></div>
            <div>
                <span>Tried to fry an egg</span><br>
                <span>Broke the yolk, no joke</span><br>
                <span data-init="Title"></span><br>
                <span>Look at my watch, just to tell the time but the hand's come off mine</span><br>
                <span data-init="Title"></span><br>
                <span data-init="Title"></span>
            </div>
            <div data-init="Agains"></div>
            <div data-init="bus"></div>
            <div data-init="Agains2"></div>
            <div data-init="Agains2"></div>
            <div data-init="bus"></div>
            <div data-init="Agains2"></div>
            <div>
                <span>I turned up early in time for our date</span><br>
                <span>But then you turn up late, something goes wrong again</span><br>
                <span>Need a drink, go to the pub</span><br>
                <span>But the bugger's shut, something goes wrong again</span>
            </div>
            <div>
                <span data-init="Title2"></span><br>
                <span data-init="Again"></span><br>
                <span data-init="Again3"></span><br>
                <span>Ah, something goes wrong again</span><br>
                <span data-init="Title2"></span><br>
                <span data-init="Title2"></span>
            </div>
            <style>
                div{
                    padding-top:20px;
                }
            </style>
        </template>
        <div id="target"></div>
        <script type="module">
            import { init } from 'https://cdn.jsdelivr.net/npm/trans-render@0.0.26/init.js';
            init(Main, {
                transform: {
                    '*': x  => ({
                        matchNextSib: true,
                        matchFirstChild: true
                    }),
                    '[data-init]': ({target, ctx}) =>{
                        ctx.init(self[target.dataset.init], {}, target);
                    }
                }
            }, target);
        </script>
    </div>
</template>
</custom-element-demo>
```
-->

## Example 1b (only viewable at [webcomponents.org](https://www.webcomponents.org/element/trans-render) )

<!--
```
<custom-element-demo>
<template>
    <div>
        <a href="https://www.youtube.com/watch?v=ucX9hVCQT_U" target="_blank">Friday I'm in Love</a><br>
        <button id="changeDays">Wi not trei a holiday in Sweeden this yer</button>
        <template id="Friday">
            <span x-d>It's |.Day5| I'm in love</span>
        </template>
        <template id="Opening">
            <span x-d>I don't care if |.Day1|'s blue</span><br>
            <span x-d>|.Day2|'s gray and |.Day3| too</span><br>
            <span x-d>|.Day4| I don't care about you</span><br>
            <span data-init="Friday"></span>
        </template>

        <template id="Main">
            <div data-init="Opening" class="stanza"></div>
            <div class="stanza">
                <span x-d>|.Day1| you can fall apart</span><br>
                <span x-d>|.Day2| |.Day3| break my heart</span><br>
                <span x-d>Oh, |.Day4| doesn't even start</span><br>
                <span data-init="Friday"></span>
            </div>
            <div class="stanza">
                <span x-d>|.Day6| wait</span><br>
                <span x-d>And |.Day7| always comes too late</span><br>
                <span x-d>But |.Day5| never hesitate</span>
            </div>

            <div class="stanza">
                <span x-d>I don't care if |.Day1|'s black</span><br>
                <span x-d>|.Day2|, |.Day3| heart attack</span><br>
                <span x-d>|.Day4| never looking back</span><br>
                <span data-init="Friday"></span>
            </div>
            <div class="stanza">
                <span x-d>|.Day1| you can hold your head</span><br>
                <span x-d>|.Day2|, |.Day3| stay in bed</span><br>
                <span x-d>Or |.Day4| watch the walls instead</span><br>
                <span data-init="Friday"></span>
            </div>
            <div class="stanza">
                <span x-d>|.Day6| wait</span><br>
                <span x-d>And |.Day7| always comes too late</span><br>
                <span x-d>But |.Day5| never hesitate</span>
            </div>
            <div class="stanza">
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
            <div data-init="Opening" class="stanza"></div>
            <div class="stanza">
                <span x-d>|.Day1| you can fall apart</span><br>
                <span x-d>|.Day2|, |.Day3| break my heart</span><br>
                <span x-d>|.Day4| doesn't even start</span><br>
                <span data-init="Friday"></span>
            </div>
            <style>
                .stanza{
                padding-top: 20px;
            }
        </style>
        </template>
        <div id="target"></div>

        <script type="module">
            import { init } from 'https://cdn.jsdelivr.net/npm/trans-render@0.0.26/init.js';
            import { interpolate } from 'https://cdn.jsdelivr.net/npm/trans-render@0.0.26/interpolate.js';
            import { update } from 'https://cdn.jsdelivr.net/npm/trans-render@0.0.26/update.js';
            let model = {
                Day1: 'Monday', Day2: 'Tuesday', Day3: 'Wednesday', Day4: 'Thursday', Day5: 'Friday',
                Day6: 'Saturday', Day7: 'Sunday',
            };
            const ctx = init(Main, {
                transform: {
                    div: ({ ctx }) => ({
                        matchNextSib: true,
                        matchFirstChild: {
                            '*': x => ({
                                matchNextSib: true
                            }),
                            '[x-d]': ({ target }) => {
                                interpolate(target, 'textContent', model);
                            },
                            '[data-init]': ({ target, ctx }) => {
                                if (ctx.update !== undefined) {
                                    return {
                                        matchFirstChild: true
                                    }
                                } else {
                                    init(self[target.dataset.init], {
                                        transform: ctx.transform
                                    }, target);
                                }
                            },
                        }
                    }),
                }
            }, target);
            changeDays.addEventListener('click', e => {
                model = {
                    Day1: 'måndag', Day2: 'tisdag', Day3: 'onsdag', Day4: 'torsdag', Day5: 'fredag',
                    Day6: 'lördag', Day7: 'söndag',
                }
                update(ctx, target);
            })
        </script>
    </div>
</template>
</custom-element-demo>
```
-->

# Reapplying (some) of the transform

Often, we want to reapply a transform, after something changes -- typically the source data.

The ability to do this is illustrated in the previous example.  Critical syntax shown below:

```html
<script type="module">
    import { init } from '../init.js';
    import { interpolate } from '../interpolate.js';
    import {update} from '../update.js';
    const ctx = init(Main, {
        model:{
            Day1: 'Monday', Day2: 'Tuesday', Day3: 'Wednesday', Day4: 'Thursday', Day5: 'Friday',
            Day6: 'Saturday', Day7: 'Sunday',
        },
        interpolate: interpolate,
        $: id => window[id],
    }, target);
    changeDays.addEventListener('click', e=>{
        ctx.model = {
            Day1: 'måndag', Day2: 'tisdag', Day3: 'onsdag', Day4: 'torsdag', Day5: 'fredag',
            Day6: 'lördag', Day7: 'söndag',
        }
        update(ctx, target);
    })
</script>
```

#  Loop support (NB:  Not yet optimized.)

The next big use case for this library is using it in conjunction with a [virtual scroller](https://valdrinkoshi.github.io/virtual-scroller/#more-examples). As far as I can see, the performance of this library should work quite well in that scenario.

However, no self respecting rendering library would be complete without some internal support for repeating lists.  This library is no exception.  While the performance of the initial list is likely to be acceptable, no effort has yet been made to utilize state of the art tricks to make list updates keep the number of DOM changes at a minimum. 

Anyway the syntax is shown below:

```html
<div>
    <template id="itemTemplate">
        <li></li>
    </template>
    <template id="list">
        <ul id="container"></ul>
    </template>
    <div id="target"></div>
    <button id="addItems">Add items</button>
    <script type="module">
        import { init } from '../init.js';
        import {update} from '../update.js';
        import {repeatInit } from '../repeatInit.js';
        import {repeatUpdate} from '../repeatUpdate.js';
        const ctx = init(list, {
            transform: {
                'ul': ({target, ctx}) =>{
                    if(ctx.update !== undefined){
                        repeatInit(10, itemTemplate, target);
                    }
                    ctx.matchFirstChild = {
                        'li': ({target, ctx, idx}) =>{
                            target.textContent = 'Hello ' + idx;
                            ctx.matchNextSib = true;
                        }
                    }
                }
            }
        }, target);
        addItems.addEventListener('click', e =>{
            repeatUpdate(15, itemTemplate, container);
            update(ctx, target);
        });
    </script>
</div>
```


