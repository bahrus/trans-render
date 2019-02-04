# trans-render

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/trans-render)

<a href="https://nodei.co/npm/trans-render/"><img src="https://nodei.co/npm/trans-render.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/trans-render">

trans-render provides an alternative way of instantiating a template.  It draws inspiration from the (least) popular features of xslt.  Like xslt, trans-render performs transforms on elements by matching tests on elements.  Whereas xslt uses xpath for its tests, trans-render uses css path tests via the element.matches() and element.querySelector() methods.

XSLT can take pure XML with no formatting instructions as its input.  Generally speaking, the XML that XSLT acts on isn't a bunch of semantically  meaningless div tags, but rather a nice semantic document, whose intrinsic structure is enough to go on, in order to formulate a "transform" that doesn't feel like a hack.  

Likewise, with the advent of custom elements, the template markup will tend to be much more semantic, like XML. trans-render tries to rely as much as possible on this intrinisic semantic nature of the template markup, to give enough clues on how to fill in the needed "potholes" like textContent and property setting.  But trans-render is completely extensible, so it can certainly accommodate custom markup (like string interpolation, or common binding attributes) by using additional, optional helper libraries.  

This leaves the template markup quite pristine, but it does mean that the separation between the template and the binding instructions will tend to require looking in two places, rather than one.  And if the template document structure changes, separate adjustments may be needed to make the binding rules in sync.  Much like how separate style rules often need adjusting when the document structure changes.

## Advantages

By keeping the binding separate, the same template can thus be used to bind with different object structures.

Providing the binding transform in JS form inside the init function signature has the advantage that one can benefit from TypeScript typing of Custom and Native DOM elements with no additional IDE support.  

Another advantage of separating the binding like this, is that one can insert comments, console.log's and/or breakpoints, in order to walk through the binding process.

For more musings on the question of what is this good for, please see the [rambling section](https://github.com/bahrus/trans-render#ramblings-from-the-department-of-faulty-analogies) below.


## Workflow

trans-render provides helper functions for cloning a template, and then walking through the DOM, applying rules in document order.  Note that the document can grow, as processing takes place (due, for example, to cloning sub templates).  It's critical, therefore, that the processing occur in a logical order, and that order is down the document tree.  That way it is fine to append nodes before continuing processing.  

### Drilling down to children

For each matching element, after modifying the node, you can instruct the processor which node(s) to consider next.  

Most of the time, especially during initial development, you won't need / want to be so precise about where to go next.  Generally, the pattern, as we will see, is just to define transform rules that match the HTML Template document structure pretty closely.

So, in the example we will see below, this notation:

```JavaScript
const Transform = {
    details: {
        summary: x => model.summaryText
    }
};
```

means "if a node has tag name "details", then continue processing the next siblings of details, but also, find the first descendent of the node that has tag name "summary", and set its textContent property to model.summaryText."

If most of the template is static, but there's a deeply nested element that needs modifying, it is possible to drill straight down to that element by specifying a "Select" string value, which invokes querySelector.  But beware: there's no going back to previous elements once that's done.  If your template is dense with dynamic pockets, you will more likely want to navigate to the first child by setting Select = '*'.

So the syntax shown above is equivalent to:

```JavaScript
const Transform = {
    details: {
        Select: 'summary',
        Transform: {
            summary: x => model.summaryText
        }
    }
};
```

In this case, the details property is a "NextStep" JS Object.  

Clearly, the first example is easier, but you need to adopt the second way if you want to fine tune the next processing steps.


### Matching next siblings

We most likely will also want to check the next siblings down for matches.  Previously, in order to do this, you had to make sure "matchNextSibling" was passed back for every match.  But that proved cumbersome.  The current implementation checks for matches on the next sibling(s) by default.  You can halt going any further by specifying "SkipSibs" in the "NextStep" object, something to strongly consider when looking for optimization opportunities.

It is deeply unfortunate that the DOM Query Api doesn't provide a convenience function for [finding the next sibling](https://gomakethings.com/finding-the-next-and-previous-sibling-elements-that-match-a-selector-with-vanilla-js/) that matches a query, similar to querySelector. Just saying.  But some support for "cutting to the chase" laterally is also provided, via the "NextMatch" property in the NextStep object.


At this point, only a synchronous workflow is provided.

## Syntax Example:

```html
<template id="sourceTemplate">
    <details>
        ...
        <summary></summary>
        ...
    </details>
</template>
<div id="target"></div>
<script type="module">
    import { init } from '../init.js';
    const model = {
        summaryText: 'hello'
    }
    const Transform = {
        details: {
            summary: x => model.summaryText
        }
    };
    init(sourceTemplate, { Transform }, target);
</script>
```

Produces

```html
<div id="target">
    <details>
        ...
        <summary>hello</summary>
        ...
    </details>
</div>
```

"target" is the HTML element we are populating.  The transform matches can return a string, which will be used to set the textContent of the target.  Or the transform can do its own manipulations on the target element, and then return a "NextStep" object specifying where to go next, or it can return a new Transform, which will get applied the first child by default.

Note the unusual property name casing, in the JavaScript arena for the NextStep object:  Transform, Select, SkipSibs, etc.  As we will see, this pattern is to allow the interpreter to distinguish between css matches for a nested Transform, vs a "NextStep" JS object.


# Use Case 1:  Applying the DRY principle to (post) punk rock lyrics

## Example 1a (only viewable at [webcomponents.org](https://www.webcomponents.org/element/trans-render) )

Demonstrates including sub templates.

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
            import { init } from 'https://cdn.jsdelivr.net/npm/trans-render@0.0.44/init.js';
            init(Main, {
                Transform: {
                    '*': x  => ({
                        Select: '*'
                    }),
                    '[data-init]': ({target, ctx}) =>{
                        init(self[target.dataset.init], {}, target);
                    }
                }
            }, target);
        </script>
    </div>
</template>
</custom-element-demo>
```
-->

Note the transform rule above (if viewed from webcomponents.org):

```JavaScript
Transform: {
    '*': x  => ({
        Select: '*'
    }),
```

"*" is a match for all css elements.  What this is saying is "for any element regardless of css-matching characteristics, continue processing its first child (Select => querySelector).  This, combined with the default setting to match all the next siblings means that, for a "sparse" template with very few pockets of dynamic data, you will be doing a lot more processing than needed, as every single HTMLElement node will be checked for a match.  But for initial, pre-optimization work, this transform rule can be a convenient way to get things done more quickly.  

## Example 1b (only viewable at [webcomponents.org](https://www.webcomponents.org/element/trans-render) )

Demonstrates use of update, rudimentary interpolation, recursive select.

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
            import { init } from 'https://cdn.jsdelivr.net/npm/trans-render@0.0.54/init.js';
            import { interpolate } from 'https://cdn.jsdelivr.net/npm/trans-render@0.0.54/interpolate.js';
            import { update } from 'https://cdn.jsdelivr.net/npm/trans-render@0.0.54/update.js';

            let model = {
                Day1: 'Monday', Day2: 'Tuesday', Day3: 'Wednesday', Day4: 'Thursday', Day5: 'Friday',
                Day6: 'Saturday', Day7: 'Sunday',
            };
            const ctx = init(Main, {
                Transform: {
                    '*': x  => ({
                        Select: '*'
                    }),
                    '[x-d]': ({ target }) => {
                        interpolate(target, 'textContent', model);
                    },
                    '[data-init]': ({ target, ctx }) => {
                        if (ctx.update !== undefined) {
                            return {}
                        } else {
                            init(self[target.dataset.init], {}, target);
                        }
                    },
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



## Reapplying (some) of the transform

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


##  Loop support (NB:  Not yet optimized)

The next big use case for this library is using it in conjunction with a [virtual scroller](https://valdrinkoshi.github.io/virtual-scroller/#more-examples). As far as I can see, the performance of this library should work quite well in that scenario.

However, no self respecting rendering library would be complete without some internal support for repeating lists.  This library is no exception.  While the performance of the initial list is likely to be acceptable, no effort has yet been made to utilize state of the art tricks to make list updates keep the number of DOM changes at a minimum. 

Anyway the syntax is shown below.  What's notable is a sub template is cloned repeatedly, then populated using the simple init / update methods.

```html
    <div>
        <template id="itemTemplate">
            <li></li>
        </template>
        <template id="list">
            <ul id="container"></ul>
            <button id="addItems">Add items</button>
            <button id="removeItems">Remove items</button>
        </template>
        <div id="target"></div>

        <script type="module">
            import { init } from '../init.js';
            import { repeatInit } from '../repeatInit.js';
            import {repeatUpdate} from '../repeatUpdate.js';
            import {update} from '../update.js';
            const options = {matchNext: true};
            const ctx = init(list, {
                Transform: {
                    ul: ({ target, ctx }) => {
                        if (!ctx.update) {
                            repeatInit(10, itemTemplate, target);
                        }
                        return ({
                            li: ({ idx }) => 'Hello ' + idx,
                        });
                    }
                }
            }, target, options);
            addItems.addEventListener('click', e => {
                repeatUpdate(15, itemTemplate, container);
                update(ctx, target, options);
            });
            removeItems.addEventListener('click', e =>{
                repeatUpdate(5, null,  container);
            })
        </script>
    </div>
```

## Ramblings From the Department of Faulty Analogies

When defining an HTML based user interface, the question arises whether styles should be inlined in the markup or kept separate in style tags and/or CSS files.

The ability to keep the styles separate from the HTML does not invalidate support for inline styles.  The browser supports both, and probably always will.

Likewise, arguing for the benefits of this library is not in any way meant to disparage the usefulness of the current prevailing orthodoxy of including the binding / formatting instructions in the markup.  I would be delighted to see the [template instantiation proposal](https://github.com/w3c/webcomponents/blob/gh-pages/proposals/Template-Instantiation.md), with support for inline binding, added to the arsenal of tools developers could use.  Should that proposal come to fruition, this library, hovering under 1KB, would be in mind-share competition (my mind anyway) with one that is 0KB, with the full backing / optimization work of Chrome, Safari, Firefox.  Why would anyone use this library then?

And in fact, the library described here is quite open ended.  Until template instantiation becomes built into the browser, this library could be used as a tiny stand-in.  Once template instantiation is built into the browser, this library could continue to supplement the native support (or the other way around, depending.)

For example, in the second example above, the core "init" function described here has nothing special to offer in terms of string interpolation, since CSS matching provides no help:

```html
<div>Hello {{Name}}</div>
```

We provide a small helper function "interpolate" for this purpose, but as this is a fundamental use case for template instantiation, and as this library doesn't add much "value-add" for that use case, native template instantiation could be used as a first round of processing.  And where it makes sense to tightly couple the binding to the template, use it there as well, followed by a binding step using this library.  Just as use of inline styles, supplemented by css style tags/files (or the other way around) is something seen quite often.

A question in my mind, is how does this rendering approach fit in with web components (I'm going to take a leap here and assume that [HTML Modules / Imports](https://github.com/w3c/webcomponents/issues/645) in some form makes it into browsers, even though I think the discussion still has some relevance without that).

I think this alternative approach can provide value, by providing a process for "Pipeline Rendering":  Rendering starts with an HTML template element, which produces transformed markup using init or native template instantiation.  Then consuming / extending web components could insert additional bindings via the CSS-matching transformations this library provides.

To aid with this process, the init and update functions provide a rendering options parameter, which contains an optional "initializedCallback" and "updatedCallback" option.  This allows a pipeline processing sequence to be set up, similar in concept to [Apache Cocoon](http://cocoon.apache.org/2.2/1290_1_1.html).

**NB**  In re-reading the [template instantiation proposal](https://github.com/w3c/webcomponents/blob/gh-pages/proposals/Template-Instantiation.md) with a fresh set of eyes, I see now that there has in fact [been some careful thought](https://github.com/w3c/webcomponents/blob/gh-pages/proposals/Template-Instantiation.md#32-template-parts-and-custom-template-process-callback) given to the idea of providing a kind of pipeline of binding.  And as mentioned above, this library provides little help when it comes to string interpolation, so the fact that the proposal provides some hooks for callbacks is really nice to see.

I may not yet fully grasp the proposal, but it still does appear to me that the template instantiation proposal is only useful if one defines regions ahead of time in the markup where dynamic content may go.  

This library, on the other hand, considers the entire template document open for amendment.  This may be alarming, if as me, you find yourself comparing this effort to the constructible stylesheet proposal, where authors need to specify which elements can be themed.

However, the use case is quite different.  In the case of stylesheets, we are talking about global theming, affecting large numbers of elements at the same time.  The use case I'm really considering is one web component extending another.  It doesn't seem that unreasonable to provide maximum flexibility in that circumstance.  Yes, I suppose the ability to mark some tags as "undeletable / non negotiable" might be nice, but I see no way to enforce that.

## Client-side JS faster than SSR?

Another interesting case to consider is this [Periodic Table Codepen](https://codepen.io/mikegolus/pen/OwrPgB) example.  Being what it is, it is no suprise that there's a lot of repetitive HTML markup needed to define the table.  

An intriguing question, is this:  Could this be the first known scenario in the history of the planet, where rendering time (including first paint) would be *improved* rather than *degraded* with the help of client-side JavaScript? 

The proper, natural instinct of a good modern developer, including the author of the codepen, is to generate the HTML from a concise data format using a server-side language (pug). 

But using this library, and cloning some repetitive templates on the client side, reduces download size from 16kb to 14kb, and may improve other performance metrics as well.  These are the performance results my copy of chrome captures, after opening in an incognito window, and throttling cpu to 6x and slow 3g network.

Trans-Rendering:

<img src="https://bahrus.github.io/periodicTable/Periodic.png" alt="Trans Rendered">

Original:

<img src="https://bahrus.github.io/periodicTable/Original2.png" alt="Original">

You can compare the two here:  This [link uses client-side trans-rendering](https://bahrus.github.io/periodicTable/PeriodicTable.html).  This [link uses all static html](https://bahrus.github.io/periodicTable/OriginalPeriodicTable.html)

Results are a bit unpredictable, sometimes the differences are less dramatic.

Lighthouse scrores are also little better.

Trans-Rendering:

![Trans Rendered Lighthouse](https://bahrus.github.io/periodicTable/PeriodiLightHouse2.png)


Original:

<img src="https://bahrus.github.io/periodicTable/OriginalLightHouse.png" alt="Original Lighthouse">

Once in a while the scores match, but most of the time the scores above are what is seen.

So the difference isn't dramatic, but it statistically significant, in my opinion.