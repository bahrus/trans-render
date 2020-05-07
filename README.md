# trans-render

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/trans-render)

<a href="https://nodei.co/npm/trans-render/"><img src="https://nodei.co/npm/trans-render.png"></a>

[![Actions Status](https://github.com/bahrus/trans-render/workflows/CI/badge.svg)](https://github.com/bahrus/trans-render/actions?query=workflow%3ACI)

Size of web component, with all optional processors included:

<img src="https://badgen.net/bundlephobia/minzip/trans-render">


trans-render provides a methodical way of instantiating a template.  It draws inspiration from the (least) popular features of XSLT.  Like XSLT, trans-render performs transforms on elements by matching tests on elements.  Whereas XSLT uses XPath for its tests, trans-render uses css path tests via the element.matches() and element.querySelector() methods.

XSLT can take pure XML with no formatting instructions as its input.  Generally speaking, the XML that XSLT acts on isn't a bunch of semantically  meaningless div tags, but rather a nice semantic document, whose intrinsic structure is enough to go on, in order to formulate a "transform" that doesn't feel like a hack.  

Likewise, with the advent of custom elements, the template markup will tend to be much more semantic, like XML. trans-render's usefulness grows as a result of the increasingly semantic nature of the template markup, because often the markup semantics provide enough clues on how to fill in the needed "potholes," like textContent and property setting, without the need for custom markup, like binding attributes.  But trans-render is completely extensible, so it can certainly accommodate custom binding attributes by using additional, optional helper libraries.  

This can leave the template markup quite pristine, but it does mean that the separation between the template and the binding instructions will tend to require looking in two places, rather than one.  And if the template document structure changes, separate adjustments may be needed to keep the binding rules in sync.  Much like how separate style rules often need adjusting when the document structure changes.

## Advantages

By keeping the binding separate, the same template can thus be used to bind with different object structures.

Providing the binding transform in JS form inside the init function signature has the advantage that one can benefit from TypeScript typing of Custom and Native DOM elements with no additional IDE support.  

Another advantage of separating the binding like this is that one can insert comments, console.log's and/or breakpoints, making it easier to walk through the binding process.

For more musings on the question of what is this good for, please see the [rambling section](https://github.com/bahrus/trans-render#ramblings-from-the-department-of-faulty-analogies) below.

**NB**  It's come to my attention (via [template discussions found here](https://github.com/w3c/webcomponents/issues/704#issuecomment-459290999)) that there are some existing libraries which have explored similar ideas:

1.  [pure-js](https://pure-js.com/)
2.  [weld](https://github.com/tmpvar/weld)


## Workflow

trans-render provides helper functions for cloning a template, and then walking through the DOM, applying rules in document order.  Note that the document can grow, as processing takes place (due, for example, to cloning sub templates).  It's critical, therefore, that the processing occur in a logical order, and that order is down the document tree.  That way it is fine to append nodes before continuing processing.  

## Drilling down to children

For each matching element, after modifying the node, you can instruct the processor which node(s) to consider next.  

Most of the time, especially during initial development, you won't need / want to be so precise about where to go next.  Generally, the pattern, as we will see, is just to define transform rules that match the HTML Template document structure pretty closely.

So, in the example we will see below, this notation:

```JavaScript
const Transform = {
    details: {
        summary: 'Hallå'
    }
};
```

means "if a node has tag name 'details', then find any direct children of the details tag that has tag name 'summary', and set its textContent property to 'Hallå'."  Let's show the full syntax for a minimal working example:

## Syntax Example:

```html
<template id="sourceTemplate">
    <details>
        ...
        <summary>E pluribus unum</summary>
        ...
    </details>
</template>
<div id="target"></div>
<script type="module">
    import { init } from 'trans-render/init.js';
    const model = {
        summaryText: 'hello'
    }
    const Transform = {
        details: {
            summary: model.summaryText
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

## Arbitrary queries.

If most of the template is static, but there's a deeply nested element that needs modifying, it is possible to drill straight down to that element by specifying a "Select" string value, which invokes querySelector.  But beware: there's no going back to previous elements once that's done.  If your template is dense with dynamic pockets, you will more likely want to navigate to the first child by setting Select = '*'. 

Jumping arbitrarily down the document tree can be done with a "NextStep" object:


```JavaScript
const Transform = {
    article: {
        Select: 'footer',
        Transform: {
            'p.contact': model.author.email
        }

    }
};
```

In the example above, when the transformer encounters an article tag, it will then do a querySelect for the first element matching "footer".

It then checks within the direct children of footer for elements matching css selector "p.contact".  If such an element is found, then the textContent is set to model.author.email (where "model" is assumed to be some object in scope).

The object:

```JavaScript
{
    Select: ...
    Transform: ...
}
```

is a "NextStep" object, and can be easily distinguished from a nested transform object with CSS selector keys (as the previous examples showed) by the presence of capital letters for the keys.  The options of the NextStep object are as shown:

```TypeScript
export interface NextStep {
    Transform?: TransformRules,
    NextMatch?: string,
    Select?: TransformRules | null,
    MergeTransforms?: boolean,
    SkipSibs?: boolean,
}
```

## Matching next siblings

We most likely will also want to check the next siblings down for matches.  Previously, in order to do this, you had to make sure "matchNextSibling" was passed back for every match.  But that proved cumbersome.  The current implementation checks for matches on the next sibling(s) by default.  You can halt going any further by specifying "SkipSibs" in the "NextStep" object discussed above, something to strongly consider when looking for optimization opportunities.

It is deeply unfortunate that the DOM Query Api doesn't provide a convenience function for [finding](https://discourse.wicg.io/t/proposal-support-query-for-nearest-sibling-matching-a-selector/3521) [the next sibling](https://gomakethings.com/finding-the-next-and-previous-sibling-elements-that-match-a-selector-with-vanilla-js/) that matches a query, similar to querySelector or closest. Just saying.  But some support for "cutting to the chase" laterally is also provided, via the "NextMatch" property in the NextStep object.

## Matching everything

Note the transform rule:

```JavaScript
Transform: {
    '*': {
        Select: '*'
    },
```

The expression "\*" is a match for all HTML elements.  What this is saying is "for any element regardless of css-matching characteristics, continue processing its first child (Select => querySelector('*')).  This, combined with the default setting to match all the next siblings means that, for a "sparse" template with very few pockets of dynamic data, you will be doing a lot more processing than needed, as every single HTMLElement node will be checked for a match.  But for initial, pre-optimization work, this transform rule can be a convenient way to get things done more quickly.  

At this point, only a synchronous workflow is provided (except when piercing into ShadowDOM).

## Conditional Display

If a matching node returns a boolean value of *false*, the node is removed.  For example [TODO:  simpler example]:

```TypeScript
...
"section[data-type='attributes']":({ target, ctx}) => {
    const attribs = tags[idx].attributes;
    if (attribs === undefined) return false;
    return {
        details: {
            dl: ({ target, ctx}) => {
                repeat(attributeItemTemplate, ctx, attribs.length, target, {
                    dt: ({ idx }) => attribs[Math.floor(idx / 2)].name,
                    dd: ({ idx }) => ({
                        'hypo-link[data-bind="description"]': attribs[Math.floor(idx / 2)].description,
                    }) 
                } as TransformRules);
            }
        }
    }
},
...
```

Here the tag "section" will be removed if attributes is undefined.

**NB:**  Be careful when using this technique.  Once a node is removed, there's no going back -- it will no longer match any css if you use trans-render updating (discussed below).  If your use of trans-render is mostly to display something once, and you recreate everything from scratch when your model changes, that's fine.  However, if you want to apply incremental updates, and need to display content conditionally, it would be better to use a [custom element](https://polymer-library.polymer-project.org/3.0/docs/devguide/templates#dom-if) [for that](https://github.com/bahrus/if-diff) [purpose](https://github.com/matthewp/if-else).


## What does wdwsf stand for?

As you may have noticed, some abbreviations are used by this library:

* init = initialize
* ctx = (rendering) context
* idx = (numeric) index of array
* SkipSibs = Skip Siblings
* attribs = attributes
* props = properties
* refs = references

## Reapplying (some) of the transform

Often, we want to reapply a transform, after something changes -- typically the source data.

The ability to do this is illustrated below:

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

## Use Case 1:  Applying the DRY principle to (post) punk rock lyrics

### Example 1a

[Demo](https://jsfiddle.net/bahrus/gc58Ldkp/)

Demonstrates including sub templates.

If you are [here](https://www.webcomponents.org/element/trans-render), the demo appears below:
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
            import { init } from 'https://cdn.jsdelivr.net/npm/trans-render@0.0.61/init.js';
            init(Main, {
                Transform: {
                    '*': {
                        Select: '*'
                    },
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



## Example 1b

[Demo](https://jsfiddle.net/bahrus/ktpjyLvc/)

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
            import { init } from 'https://cdn.jsdelivr.net/npm/trans-render@0.0.61/init.js';
            import { interpolate } from 'https://cdn.jsdelivr.net/npm/trans-render@0.0.61/interpolate.js';
            import { update } from 'https://cdn.jsdelivr.net/npm/trans-render@0.0.61/update.js';

            let model = {
                Day1: 'Monday', Day2: 'Tuesday', Day3: 'Wednesday', Day4: 'Thursday', Day5: 'Friday',
                Day6: 'Saturday', Day7: 'Sunday',
            };
            const ctx = init(Main, {
                Transform: {
                    '*': {
                        Select: '*'
                    },
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



## Simple Template Insertion, Part I

A template can be inserted directly inside the target element as follows:

```html
<template id="summaryTemplate">
My summary Text
</template>
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
    const Transform = {
        details: {
            summary: summaryTemplate
        }
    };
    init(sourceTemplate, { Transform }, target);
</script>
```

Here we are relying on the fact that outside any Shadow DOM, id's become global constants.  So for simple HTML pages, this works.  Assuming HTML Modules someday brings the world back into balance, an open question remains how code will be able to reference templates defined within the HTML template.

For now, typically, web components are written in JavaScript exclusively. A [utility to create a template](#create-template-element-programmatically) is provided that can then be referenced, in lieu of an HTML Template DOM node.



##  Shadowed Template Insertion [Untested]

```html
<template id="articleTemplate">
My interesting article...
</template>
<template id="sourceTemplate">
    <details>
        ...
        <summary></summary>
        <article></article>
        ...
    </details>
</template>
<div id="target"></div>
<script type="module">
    import { init } from '../init.js';
    const Transform = {
        details: {
            article: [articleTemplate]
        }
    };
    init(sourceTemplate, { Transform }, target);
</script>
```

## Multiple matching with "Ditto" notation

Sometimes, one rule will cause the target to get (new) children.  We then want to apply another rule to process the target element, now that the children are there.

But uniqueness of the keys of the JSON-like structure we are using prevents us from listing the same match expression twice.

We can specify multiple matches as follows:

```JavaScript
import { init } from '../init.js';
const Transform = {
    details: {
        article: articleTemplate,
        '"': ({target}) => ...,
        '""': ...,
        '"3': ...
    }
};
init(sourceTemplate, { Transform }, target);
```

I.e. any selector that starts with a double quote (") will use the last selector that didn't.

## Property / attribute / event binding [TODO:  Test Coverage]


```JavaScript
import { init } from '../init.js';
const Transform = {
    details: {
        'my-custom-element': [
            //Prop Setting
            {prop1:{greeting: 'hello'}, prop2:'hello', },
            //Event Handler Setting
            {'click': this.clickHandler},
            //Attribute Setting
            {'my-attribute': 'myValue', 'my-attribute2': true, 'my-old-attribute': null}, // null removes attribute
            //Transform or NextStep Object
            {
                'my-light-child': ...
            }
        ]
    }
};
init(sourceTemplate, { Transform }, target);
```

Each of the elements are "optional" in the sense that you  can either end the array early, or you can skip over one or more of the settings by specifying an empty object ({}).  A more verbose but somewhat more powerful way of doing this is discussed with the [decorate function](https://github.com/bahrus/trans-render#behavior-enhancement).

A suggestion for remembering the order these "arguments" come in -- Properties / Events / Attributes / Transform can be abbreviated as "peat."

## Contextual, Synchronous Evaluation

All of the rules listed above also apply to the result of evaluating a lambda expression:

```JavaScript
const Transform = {
    details: {
        summary: ({ctx}) => ctx.summaryText
    }
}
```


There are currently five parameters that can be pulled via these arrow functions:

```JavaScript
    summary: ({target, ctx, idx, level, item}) => {
        ...
    }
```

TypeScript Tip: Some of the parameters, like target, are quite generic (e.g. target:HTMLElement, item: any). But one can add typing thusly:

```Typescript
    summary: ({target, item} : {target: HTMLInputElement, item: MyModelItem}) =>{
        ...
    }
```

## Planting flags

Suppose during initialization you want to create references to specific elements that will require rapid updates during repeated update processes?

One way to do that would be with a rule tied to id's.

The initialization transform could look like:

```JavaScript
    '*': {
        Select: '*' //check every element recursively -- sledghammer approach
    },
    ['id']: ({ctx, target}) => ctx.host[target.id] = target;
```

where we assume we are using this within the context of a custom element, and ctx.host refers to the instance of the custom element.

This can certainly be useful for code written within the custom element, where a method needs fast access to an element by id without having to do a querySelect.

However, this approach doesn't lend itself to declarative fast access using trans-render notation.

Instead, trans-render supports another approach [TODO]:

```JavaScript
    const myFastAccessSymbol = Symbol();

    initTransform = {
        'my-rapidly-changing-element': myFastAccessSymbol
    }

    updateTransforms = [{
        ({fastChangingProp}) =>{
            [myFastAccessSymbol]: ({target}) => target.myProp = fastChangingProp
        }
    }]
```


## Utility functions

###  Create template element programmatically

```TypeScript
createTemplate(html: string, context?: any, symbol?: symbol)
```

Example:

```JavaScript
    details: createTemplate(`<summary>SummaryText</summary>...`);
```

An explanation for the second and third parameters is needed.

Templates shine most when they are created once, and cloned repeatedly as needed.  What this means in the context of a JS module, is that they should be cached somewhere, and instances cloned from the cache.  The use of the third parameter, symbol, ensures that no two disparate code snippets will trample over each other.  But which "cache" to use?  The easiest, sledgehammer approach would be to cache it in self or globalThis.  But there is likely a cost to caching lots of things in such a global area, as the lookups are likely to grow (logarithmically perhaps).

Caching inside the renderContext object (ctx) may be too tepid, because the renderContext is likely to be created with each instance of a web component.

So the code checks whether the context object has a "cache" property, and if so, it caches it there.  If using this library inside a web component library, a suggestion would be to set ctx.cache = MyCustomElementClass.

###  Loop support (NB:  Not yet optimized?)

The next big use case for this library is using it in conjunction with a [virtual scroller](https://github.com/WICG/virtual-scroller). As far as I can see, the performance of this library should work quite well in that scenario.

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
    import { repeat } from '../repeat.js';
    import { update } from '../update.js';
    const options = {matchNext: true};
    const itemTransform = {
        li: ({ idx }) => 'Hello ' + idx,
    };
    const ctx = init(list, {
        Transform: {
            ul: ({ target, ctx }) =>  repeat(itemTemplate, ctx, 10, target, itemTransform) // or repeat(itemTemplate, ctx, items, target, itemTransform) 
        }
    }, target, options);
    ctx.update = update;
    addItems.addEventListener('click', e => {
        repeat(itemTemplate, ctx, 15, container, itemTransform); 
    });
    removeItems.addEventListener('click', e =>{
        repeat(itemTemplate, ctx, 5, container);
    })
    </script>
</div>
```

An alternative to repeat is provided, "repeateth" that does the same thing, but it hides the "rows" that go out of scope as the list changes, rather than deleting them.

### Adjacent template insertion

```TypeScript
insertAdjacentTemplate(template: HTMLTemplateElement, target: Element, position: InsertPosition)
```

This function is modeled after insertAdjacentElement / insertAdjacentHTML.  Only here we are able to insert a template.  By using the preferred "afterEnd" as the insert position, the trans-rendering will be able to process those nodes like any other nodes.

### Ergonomic Tag Creation

```Typescript
appendTag<T extends HTMLElement>(container: HTMLElement, name: string, config: PEAUnionSettings<T> | DecorateArgs<T> /* untested */) : HTMLElement 
```

Just saves a tiny bit of boiler plate (document.createElement, container.appendChild)

### Text Searching

```Typescript
split(target: HTMLElement, textContent: string, search: string | null | undefined)
```

Splits text based on search into styleable spans with class "match" and sets the innerHTML to this partitioned content.  The second argument, 'textContent' should not contain any HTML tags in it (but that is left to the caller to ensure).


### Content Swapping, Part I

```Typescript
replaceElementWithTemplate(target: HTMLElement, ctx: RenderContext, template: HTMLTemplateElement | [symbol, string]) 
```

During pipeline processing, replace a tag with a template.  The original tag goes into ctx.replacedElement.

For the template parameter, you can either pass in a template object, or an html string / symbol pair.  The symbol is required so the template can be cached.

### Content Swapping, Part II

```Typescript
replaceTargetWithTag<TargetType extends HTMLElement = HTMLElement, ReplacingTagType extends HTMLElement = HTMLElement>
    (target: TargetType, ctx: RenderContext, tag: string, preSwapCallback?: (el: ReplacingTagType) => void)
```

During pipeline processing, replace a tag with another tag.  The original tag goes into ctx.replacedElement

### Piercing into ShadowDOM

```Typescript
pierce<TargetType extends HTMLElement = HTMLElement>(el: TargetType, ctx: RenderContext, targetTransform: TransformRules)
```

... pierces into the shadow root of the target element, and (asynchronously) applies transform rules within the shadow root.  If the target element is a custom element, there is a delay to wait for the custom element to be upgraded, but there is perhaps a bit of timing fragility that accompanies this dangerous (but necessary as a last resort) function.

**NB**  Doing this breaks any and all warranties from the component / template being surgically altered.

<details>
    <summary>Advanced utility functions</summary>

### Property merging

Object.assign, and its modern abbreviated variations, provides a quite declarative feeling when populating an object with values.  Unfortunately, Object.assign is a fast shallow merge. An alternative to object.assign are more nuanced deep merge functions like [JQuery.extends](https://api.jquery.com/jQuery.extend/#jQuery-extend-deep-target-object1-objectN), or lodash [merge](https://stackoverflow.com/questions/19965844/lodash-difference-between-extend-assign-and-merge), which domMerge draws inspiration from.

The function domMerge provides similar help.

The (tentative) signature is 

```TypeScript
export function domMerge<(target: HTMLElement, vals: Vals): void
```

where 

```TypeScript
export interface Vals {
  attribs?: { [key: string]: string | boolean | number };
  propVals?: object;
}
```

###  Behavior enhancement


Vue (with common roots from Polymer 1) provides an elegant way of turning an existing DOM element into a kind of anonymous custom element.  The alternative to this is the "is" built-in custom element api, which, while implemented in two of the three major browsers, remains strongly opposed by the third, and the reasons seem, to my non-expert ears, to have some merit.  

Even if the built-ins do become a standard, I still think the "decorate" function, described below, would come in handy for less formal occasions.  

Tentative Signature:

```TypeScript
export function decorate(
  target: HTMLElement,
  source: DecorateArgs
)
```

where


```TypeScript
export interface DecorateArgs extends Vals{
    propDefs?: object,
    methods?: {[key: string] : Function},
    on?: {[key: string] : (e: Event) => void},
}
```

For example:

```html
<div id="decorateTest">
    <button>Test</button>
</div>
<script type="module">
    import {decorate} from '../decorate.js';
    import {init, attribs} from '../init.js';
    init(decorateTest, {
        Transform: {
            div: {
                button: ({target}) => decorate(target, {
                    propVals:{
                        textContent: 'Hello',
                    },
                    attribs: {
                        title: 'Hello, world'
                    },
                    propDefs:{
                        count: 0
                    },
                    on:{
                        click: function(e){
                            this.count++;
                        }
                    },
                    methods:{
                        onPropsChange(){
                            alert(this.count)
                        }
                    }
                })
            }
        }            
    })
</script>
```

decorate can also attach behaviors to custom elements, not just native elements, [in a decorative way.](https://en.wikipedia.org/wiki/Decorator_pattern)

### Avoiding namespace collisions

<details>
    <summary>Reflections on the Revolutionary Extensible Web Manifesto</summary> 
<b>NB:</b>  All names, characters, and incidents portrayed in the following discussion are fictitious. No identification with actual persons (living or deceased), places, buildings, and products is intended or should be inferred. No person or entity associated with this discussion received payment or anything of value, or entered into any agreement, in connection with the depiction of tobacco products. No animals were harmed in formulating the points discussed below.

<blockquote><i>In a web-loving land, there was a kingdom that held sway over a large portion of the greatest minds, who in turn guided career choices of the common folk.  The kingdom's main income derived from a most admirable goal -- keeping friends and family in touch.  The kingdom was ruled by conservatives.  "Edmund Burke" conservatives, who didn't see the appeal of allowing heretics to join freely in their kingdom.  They were tolerant, mind you.  If you were not a tax-paying subject born to a family of the kingdom, i.e. a heretic, and you wanted to visit their kingdom, you could do so.  You only had to be heavily surrounded by guards, who would translate what you had to say, and vice versa, into Essex, the de-facto language of the web, according to the kingdom's elites.</i>

<i>The heretics called these conservatives unflattering words like "reactionaries." </i> 

<i>"Why can't we speak directly to your subjects?  What are you afraid of?" the counter-cultural heretics would plead.</i>

<i>The ruling elites countered with fancy words like "heuristics" and "smoosh."  "We've put our greatest minds to the problem, and, quite frankly, they're stumped.  We don't see how we can let you speak freely without corrupting the language of the web.  The web rules over all of us, and what if the web wants to introduce an attribute that is already in heavy use?  What are we to do then?  Don't you see?  We are the true lovers of the web.  We are protecting the web, so it can continue to evolve and flourish."</i>

<i>Which all *sounded* like a good faith argument.  But why, at least one heretic thought, has the main web site used to bind family and friends together introduced the following global constants, which surely could cause problems if the web wanted to evolve:</i>

<details>
    <summary>A subset of global constants.</summary> 
<br>facebook 
<br>meta_referrer 
<br>pageTitle 
<br>u_0_11 
<br>u_0_11 
<br>u_0_11 
<br>u_0_11 
<br>u_0_11 
<br>u_0_12 
<br>u_0_13 
<br>u_0_14 
<br>u_0_15 
<br>u_0_16 
<br>u_0_17 
<br>pagelet_bluebar 
<br>blueBarDOMInspector 
<br>login_form 
<br>email 
<br>pass 
<br>loginbutton 
<br>u_0_2 
<br>u_0_3 
<br>u_0_4 
<br>lgnjs 
<br>locale 
<br>prefill_contact_point 
<br>prefill_source 
<br>prefill_type 
<br>globalContainer 
<br>content 
<br>reg_box 
<br>reg_error 
<br>reg_error_inner 
<br>reg 
<br>reg_form_box 
<br>fullname_field 
<br>u_0_b 
<br>u_0_c 
<br>u_0_d 
<br>u_0_e 
<br>fullname_error_msg 
<br>u_0_f 
<br>u_0_g 
<br>u_0_h 
<br>u_0_i 
<br>u_0_j 
<br>u_0_k 
<br>u_0_l 
<br>u_0_m 
<br>password_field 
<br>u_0_n 
<br>u_0_o 
<br>u_0_p 
<br>u_0_q 
<br>month 
<br>day 
<br>year 
<br>birthday-help 
<br>u_0_r 
<br>u_0_s 
<br>u_0_9 
<br>u_0_a 
<br>u_0_t 
<br>terms-link 
<br>privacy-link 
<br>cookie-use-link 
<br>u_0_u 
<br>u_0_v 
<br>referrer 
<br>asked_to_login 
<br>terms 
<br>ns 
<br>ri 
<br>action_dialog_shown 
<br>reg_instance 
<br>contactpoint_label 
<br>ignore 
<br>locale 
<br>reg_captcha 
<br>security_check_header 
<br>outer_captcha_box 
<br>captcha_box 
<br>captcha_response_error 
<br>captcha 
<br>captcha_persist_data 
<br>captcha_response 
<br>captca-recaptcha 
<br>captcha_whats_this 
<br>captcha_buttons 
<br>u_0_w 
<br>u_0_x 
<br>u_0_y 
<br>reg_pages_msg 
<br>u_0_z 
<br>u_0_10 
<br>pageFooter 
<br>contentCurve 
<br>js_0 
<br>u_0_18 
<br>u_0_19
</details>

<i>And why does the kingdom not want to empower its subjects to choose for themselves if this is a valid concern?</i>

</blockquote>

Now I **do** think this is a concern to consider.   Focusing on the decorate functionality described above, the intention here is **not** to provide a formal extension mechanism, as the built-in custom element "is" extension proposal provides (and which Apple tirelessly objects to), but rather a one-time duct tape type solution.  Whether adding a property to a native element, or to an existing custom element,  to err on the side of caution, the code doesn't pass the property or method call on to the element it is decorating.

</details>
<p>
<b>NB</b> If:

1.  You are slapping properties onto an existing native HTML element, and:
2.  The existing native HTML element might, in the future, adopt properties / methods with the same name.

Then it's a good idea to consider making use of [Symbols](https://www.keithcirkel.co.uk/metaprogramming-in-es6-symbols/):

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <div id="decorateTest">
        <button>Test</button>
    </div>
    <script type="module">
        import {decorate, attribs} from '../decorate.js';
        import {init} from '../init.js';
        const count = Symbol('count');
        const myMethod = Symbol('myMethod');
        init(decorateTest, {
            Transform: {
                button: ({target}) => decorate(target, {
                    propVals:{
                        textContent: 'Hello',
                    },
                    attribs:{
                        title: "Hello, world"
                    }, 
                    propDefs:{
                        [count]: 0
                    },
                    on:{
                        click: function(e){
                            this[count]++;
                        }
                    },
                    methods:{
                        onPropsChange(){
                            this[myMethod]();
                        },
                        [myMethod](){
                            alert(this[count]);
                        }
                    }
                })
            }
            
            
        })
    </script>
</body>
</html>
```

The syntax isn't that much more complicated, but it is probably harder to troubleshoot if using symbols, so use your best judgment. Perhaps start properties and methods with an underscore if you wish to preserve the easy debugging capabilities.  You can also use Symbol.for('count'), which kind of meets halfway between the two approaches.

**NB:**  There appears to be serious flaw as far as symbols and imports.  If you find yourself importing a symbol from another file, even from the same package, you are in for a bumpy ride, from my experience, especially when using a bare import server plug-in like es-dev-server.  I've raised the issue [here](https://github.com/WICG/webpackage/issues/496) and [there](https://github.com/WICG/import-maps/issues/132).

However, a helper library, manageSymbols.js, is contained in this package, that builds on the singleton-like aspects of custom elements.  It improves the reliability of symbols, even in an environment where different versions of the same module may be present.

### Even more indirection

The render context which the init function works with provides a "symbols" property for storing symbols.  The transform does look a little scary at first, but hopefully it's manageable:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <div id="decorateTest">
        <button>Test</button>
    </div>
    <script type="module">
        import {decorate} from '../decorate.js';
        import {init} from '../init.js';
        init(decorateTest, {
            symbols: {
                count: Symbol('count'),
                myMethod: Symbol('myMethod')
            },
            Transform: {
                button: ({target, ctx}) => decorate(target, {
                    propVals: {
                        textContent: 'Hello',
                    },
                    attribs:{
                            title: "Hello, world"
                    },
                    propDefs:{
                        [ctx.symbols['count']]: 0
                    },
                    on:{
                        click: function(e){
                            this[ctx.symbols['count']]++;
                        }
                    },
                    methods:{
                        onPropsChange(){
                            this[ctx.symbols['myMethod']]();
                        },
                        [ctx.symbols['myMethod']](){
                            alert(this[ctx.symbols['count']]);
                        }
                    }
                })
            }
        })
    </script>
</body>
</html>
```


</details>

## Ramblings From the Department of Faulty Analogies

When defining an HTML based user interface, the question arises whether styles should be inlined in the markup or kept separate in style tags and/or CSS files.

The ability to keep the styles separate from the HTML does not invalidate support for inline styles.  The browser supports both, and probably always will.

Likewise, arguing for the benefits of this library is not in any way meant to disparage the usefulness of the current prevailing orthodoxy of including the binding / formatting instructions in the markup.  I would be delighted to see the [template instantiation proposal](https://github.com/w3c/webcomponents/blob/gh-pages/proposals/Template-Instantiation.md), with support for inline binding, added to the arsenal of tools developers could use.  Should that proposal come to fruition, this library would be in mind-share competition (my mind anyway) with one that is 0KB, with the full backing / optimization work of Chrome, Safari, Firefox.  Why would anyone use this library then?

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

This library, on the other hand, considers the entire template document open for amendment.  This may be alarming, if as me, you find yourself comparing this effort to the [::part ::theme initiative](https://meowni.ca/posts/part-theme-explainer/), where authors need to specify which elements can be themed.

However, the use case is quite different.  In the case of stylesheets, we are talking about global theming, affecting large numbers of elements at the same time.  The use case I'm really considering is one web component extending another.  I don't just mean direct class inheritance, but compositional extensions as well.  It doesn't seem that unreasonable to provide maximum flexibility in that circumstance.  Yes, I suppose the ability to mark some tags as "undeletable / non negotiable" might be nice, and it is easy to speculate that a vendor could mark non mutable DOM nodes in some way, but I see no way to enforce that.  

## Client-side JS faster than SSR?

Another interesting case to consider is this [Periodic Table Codepen](https://codepen.io/mikegolus/pen/OwrPgB) example.  Being what it is, it is no surprise that there's a lot of repetitive HTML markup needed to define the table.  

An intriguing question, is this:  Could this be the first known scenario in the history of the planet, where rendering time (including first paint) would be *improved* rather than *degraded* with the help of client-side JavaScript? 

The proper, natural instinct of a good modern developer, including the author of the codepen, is to generate the HTML from a concise data format using a server-side language (pug). 

But using this library, and cloning some repetitive templates on the client side, reduces download size from 16kb to 14kb, and may improve other performance metrics as well.  These are the performance results my copy of chrome captures, after opening in an incognito window, and throttling cpu to 6x and slow 3g network.

Trans-Rendering:

<img src="https://bahrus.github.io/periodicTable/Periodic.png" alt="Trans Rendered">

Original:

<img src="https://bahrus.github.io/periodicTable/Original2.png" alt="Original">

You can compare the two here:  This [link uses client-side trans-rendering](https://bahrus.github.io/periodicTable/PeriodicTable.html).  This [link uses all static html](https://bahrus.github.io/periodicTable/OriginalPeriodicTable.html)

Results are a bit unpredictable, and usually the differences are less dramatic.

Lighthouse scores also provide evidence that trans-rendering improves performance.

Trans-Rendering:

![Trans Rendered Lighthouse](https://bahrus.github.io/periodicTable/PeriodiLightHouse2.png)


Original:

<img src="https://bahrus.github.io/periodicTable/OriginalLightHouse.png" alt="Original Lighthouse">

Once in a while the scores match, but most of the time the scores above are what is seen.

So the difference isn't dramatic, but it is statistically significant, in my opinion.

See this [side-by-side comparison](https://www.webpagetest.org/video/view.php?id=190927_26744e8bf5d82ba9296bdea710299d3274277a2a) for more evidence of the benefits. 



## trans-render the web component

A web component wrapper around the functions described here is available.

### Example syntax 

[Demo](https://jsfiddle.net/bahrus/0c96b2aj/4/)

If you are [here](https://www.webcomponents.org/element/trans-render) what appears next should work:

<!--
```
<custom-element-demo>
<template>
    <div>
        <template id="itemTemplate">
            <li></li>
        </template>
        <trans-render view-model='["winter", "spring", "summer", "fall"]'><script nomodule>
            ({
                ul: ({ctx, target}) => ctx.repeat(itemTemplate, ctx, ctx.viewModel, target, {
                    li: ({item}) => item
                })
            })
        </script></trans-render>
        <div>
            <ul></ul>
        </div>
        <script type="module" src="https://cdn.pika.dev/trans-render"></script>
    </div>
</template>
</custom-element-demo>
```
-->




