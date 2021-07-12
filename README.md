# trans-render

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/trans-render)

<a href="https://nodei.co/npm/trans-render/"><img src="https://nodei.co/npm/trans-render.png"></a>

[![Actions Status](https://github.com/bahrus/trans-render/workflows/CI/badge.svg)](https://github.com/bahrus/trans-render/actions?query=workflow%3ACI)

<img src="https://badgen.net/bundlephobia/minzip/trans-render">

**NB**:  This library is undergoing a face lift.  To see the old functionality that this new code is leading up to, go [here](README_OLD.md)

*trans-rendering* (TR) describes a methodical way of instantiating a template.  It draws inspiration from the (least) popular features of XSLT.  Like XSLT, TR performs transforms on elements by matching tests on elements.  Whereas XSLT uses XPath for its tests, TR uses css path tests via the element.matches() and element.querySelectorAll() methods.  Unlike XSLT, though, the transform is defined with JavaScript, adhering to JSON-like declarative constraints as much as possible.

A subset of TR, also described below, is "Declarative trans-rendering" [DTR], which is pure, 100% declarative syntax.  DTR supports dynamic capabilities by attaching DTR [linked?(https://json-ld.org/) "action" transforms to DOM events.

It's designed to provide an alternative to the proposed [Template Instantiation proposal](https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Template-Instantiation.md), with the idea being that it could continue to supplement what that proposal includes if/when it lands in browsers.

XSLT can take pure XML with no formatting instructions as its input.  Generally speaking, the XML that XSLT acts on isn't a bunch of semantically  meaningless div tags, but rather a nice semantic document, whose intrinsic structure is enough to go on, in order to formulate a "transform" that doesn't feel like a hack.

There is a growing (🎉) list of semantically meaningful native-born DOM Elements which developers can and should utilize, including dialog, datalist, details/summary, popup/tabs (🤞) etc. which can certainly help reduce divitis.

But even more dramatically, with the advent of imported, naturalized custom elements, the ratio between semantically meaningful tag names and divs/spans in the template markup will tend to grow asymptotically to [14.8%](https://www.migrationpolicy.org/programs/data-hub/charts/immigrant-population-over-time) (🙏🏽), looking much more like XML of yore. trans-render's usefulness grows as a result of the increasingly semantic nature of the template markup.  Why? Because often the markup semantics provide enough clues on how to fill in the needed "potholes," like textContent and property setting, without the need for custom markup, like binding attributes.  But trans-render is completely extensible, so it can certainly accommodate custom binding attributes by using additional, optional helper libraries.

This can leave the template markup quite pristine, but it does mean that the separation between the template and the binding instructions will tend to require looking in two places, rather than one.  And if the template document structure changes, separate adjustments may be needed to keep the binding rules in sync.  Much like how separate style rules often need adjusting when the document structure changes.

## The core library

The core library, transform.js, is a tiny (1.2k gzip/minified), 'non-committal' library that simply allows us to map css matches to user-defined functions. 

Its first value-add proposition is it can reduce the amount of imperative *.selectQueryAll().forEach's needed in our code.  However, by itself, transform.js is not a complete solution, if you are looking for declarative syntax.  That will come with the ability to extend transform.js, which will be discussed below.

The CSS matching transform.js takes one of two forms:

1.  multi-matching for all (custom) DOM elements within the scope.
2.  Scoping matches.

### Multi-matching

Multi matching provides support for syntax that is convenient for JS development.  Syntax like this isn't very pleasant:

```JavaScript
"[part='my-special-section']": {
    ...
}
```

... especially when considering how common such queries will be.

So transform.js supports special syntax for css matching that is more convenient for JS developers:

```JavaScript
mySpecialSectionPart: {
    ...
}
```

Throughout this documentation, we will be referring to the string before the colon as the "LHS" (left-hand-side) expression.

Consider the following example (please expand).  Don't worry, it looks quite complicated, but we will walk through it, and also, as we introduce more features, the code below will greatly simplify:

<details>
    <summary>Example 1</summary>

```html
<body>
    <template id=Main>
        <button data-count=10>Click</button>
        <div class="count-wide otherClass"></div>
        <vitamin-d></vitamin-d>
        <div part="triple-decker j-k-l"></div>
        <div id="jan8"></div>
        <div -text-content></div>
    </template>
    <div id=container></div>
    <script type="module">
        import { transform } from '../../lib/transform.js';
        transform(Main, {
            match: {
                dataCountAttrib: ({target, val}) =>{
                    target.addEventListener('click', e => {
                        const newCount = parseInt(e.target.dataset.count) + 1;
                        e.target.dataset.count = newCount;
                        transform(container, {
                            match: {
                                countWideClass: ({target}) => {
                                    target.textContent = newCount;
                                },
                                vitaminDElement: ({target}) => {
                                    target.textContent = 2 * newCount;
                                },
                                tripleDeckerPart: ({target}) => {
                                    target.textContent = 3 * newCount;
                                },
                                jan8Id: ({target}) => {
                                    target.textContent = 4 * newCount;
                                },
                                textContentProp: 5 * newCount,
                                '*': ({target, idx}) => {
                                    target.setAttribute('data-idx', idx);
                                }
                            }
                        });
                    })

                }
            }
        }, container);
    </script>
</body>
```

</details>

The first thing to note is that id's become global constants outside of ShadowDOM.  Hence we can refer to "Main" and "container" directly in the JavaScript:

```JavaScript
transform(Main, { 
    ...
}
```

The keyword "match" indicates that within that block are CSS Matches.  In this example, all the matches are "multi-matches" because they end with either "Class", "Element", "Part", "Id", "Prop" or "Attrib".

So for example, this:

```JavaScript
dataCountAttrib: ({target, val}) => {
    ...
}
```

is short-hand for:

```JavaScript
fragment.querySelectorAll('[data-count]').forEach(target => {
    const val = target.getAttribute('data-count');
    ...
})
```

What we also see in this example, is that the transform function can be used for two scenarios:

1.  Instantiating a template into a target container in the live DOM tree:

```JavaScript
transform(Main, {...}, container)
```

2.  Updating an existing DOM tree:

```JavaScript
transform(container, {...})
```

We can also start getting a sense of how transforms can be tied to custom element events.  Although the example above is hardly declarative, as we create more rules allow us to update the DOM, and link events to transforms, we will achieve a Turing complete(?) solution.

The following table lists how the LHS is translated into CSS multi-match queries:

<table>
    <tr>
        <th>Pattern</th><th>Example</th><th>Query that is used</th><th>Notes</th>
    </tr>
    <tr>
        <td>Ends with "Parts"</td><td>myRegionParts</td><td>.querySelectorAll('[part*="my-region"]')</td><td>May match more than bargained for when working with multiple parts on the same element.</td>
    </tr>
    <tr>
        <td>Ends with "Attribs"</td><td>ariaLabelAttribs</td><td>.querySelectorAll('[aria-label]')</td><td>The value of the attribute is put into context:  ctx.val</td>
    </tr>
    <tr>
        <td>Contains Eq, ends with Attribs [TODO]</td><td>ariaLabelEqHelloThereAttribs</td><td>.querySelectorAll('[arial-label="HelloThere"])</td><td>If space needed ("Hello There") then LHS needs to be wrapped in quotes</td>
    <tr>
        <td>Ends with "Elements"</td><td>flagIconElements</td><td>.querySelectorAll('flag-icon')</td><td>&nbsp;</td>
    </tr>
    <tr>
        <td>Ends with "Props"</td><td>textContentProps</td><td>.querySelectorAll('[-text-content]')</td><td>Useful for binding properties in bulk</td>
    </tr>
    <tr>
        <td>Anything else</td><td>'a[href$=".mp3"]'</td><td>.querySelectorAll('a[href$=".mp3"')</td><td>
    </tr>
</table>

## Use Case 1:  Applying the DRY principle to punk rock lyrics

[Demo](https://jsfiddle.net/bahrus/4897cbzj/4/)

<details>
    <summary>Markup</summary>

```html
    <div>
        <a href="https://www.youtube.com/watch?v=ucX9hVCQT_U" target="_blank">Friday I'm in Love</a><br>
        <button id="changeDays">Wi not trei a holiday in Sweeden this yer</button>
        <template id="Friday">
            <span>It's |.Day5| I'm in love</span>
        </template>
        <template id="Opening">
            <span>I don't care if |.Day1|'s blue</span><br>
            <span>|.Day2|'s gray and |.Day3| too</span><br>
            <span>|.Day4| I don't care about you</span><br>
            <span data-init="Friday"></span>
        </template>

        <template id="Main">
            <div data-init="Opening" class="stanza"></div>
            <div class="stanza">
                <span>|.Day1| you can fall apart</span><br>
                <span>|.Day2| |.Day3| break my heart</span><br>
                <span>Oh, |.Day4| doesn't even start</span><br>
                <span data-init="Friday"></span>
            </div>
            <div class="stanza">
                <span>|.Day6| wait</span><br>
                <span>And |.Day7| always comes too late</span><br>
                <span>But |.Day5| never hesitate</span>
            </div>

            <div class="stanza">
                <span>I don't care if |.Day1|'s black</span><br>
                <span>|.Day2|, |.Day3| heart attack</span><br>
                <span>|.Day4| never looking back</span><br>
                <span data-init="Friday"></span>
            </div>
            <div class="stanza">
                <span>|.Day1| you can hold your head</span><br>
                <span>|.Day2|, |.Day3| stay in bed</span><br>
                <span>Or |.Day4| watch the walls instead</span><br>
                <span data-init="Friday"></span>
            </div>
            <div class="stanza">
                <span>|.Day6| wait</span><br>
                <span>And |.Day7| always comes too late</span><br>
                <span>But |.Day5| never hesitate</span>
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
                <span>It's |.Day5|</span><br>
                <span>I'm in love</span>
            </div>
            <div data-init="Opening" class="stanza"></div>
            <div class="stanza">
                <span>|.Day1| you can fall apart</span><br>
                <span>|.Day2|, |.Day3| break my heart</span><br>
                <span>|.Day4| doesn't even start</span><br>
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
            import { transform } from 'https://cdn.skypack.dev/trans-render';
            import { interpolate } from 'https://cdn.skypack.dev/trans-render/lib/interpolate.js';

            let model = {
                Day1: 'Monday', Day2: 'Tuesday', Day3: 'Wednesday', Day4: 'Thursday', Day5: 'Friday',
                Day6: 'Saturday', Day7: 'Sunday',
            };
            const ctx = transform(Main, {
                match: {
                    '*': ({ target }) => {
                        interpolate(target, 'textContent', model);
                    },
                    dataInitAttribs: ({ target, ctx, val }) => {
                        transform(self[val], ctx, target);
                    }
                }
            }, target);
            changeDays.addEventListener('click', e => {
                model = {
                    Day1: 'måndag', Day2: 'tisdag', Day3: 'onsdag', Day4: 'torsdag', Day5: 'fredag',
                    Day6: 'lördag', Day7: 'söndag',
                }
                delete ctx.match.initData;
                transform(target, ctx);
            })
        </script>
    </div>
```

</details>


## An example of an imperative helper function

[Demo](https://jsfiddle.net/bahrus/4897cbzj/7/)

Since trans-render is built around css matching, it doesn't provide much help when it comes to string interpolation, something supported by virtually every templating library.  trans-render can support something like this via a reusable, shared transform helper function.  The minimalist interpolation library trans-render/lib/interpolate.js is provided for this purpose, but it's scope is quite small (no expressions or anything).  More robust libraries that support expressions could be created, as needed.

## Use Case 2:  Tränslåtyng pøst pünk lyriks tø Sweedisλ

<details>
    <summary>Markup</summary>

```html
    <div>
        <a href="https://www.youtube.com/watch?v=ucX9hVCQT_U" target="_blank">Friday I'm in Love</a><br>
        <button id="changeDays">Wi not trei a holiday in Sweeden this yer</button>
        <template id="Friday">
            <span>It's |.Day5| I'm in love</span>
        </template>
        <template id="Opening">
            <span>I don't care if |.Day1|'s blue</span><br>
            <span>|.Day2|'s gray and |.Day3| too</span><br>
            <span>|.Day4| I don't care about you</span><br>
            <span data-init="Friday"></span>
        </template>

        <template id="Main">
            <div data-init="Opening" class="stanza"></div>
            <div class="stanza">
                <span>|.Day1| you can fall apart</span><br>
                <span>|.Day2| |.Day3| break my heart</span><br>
                <span>Oh, |.Day4| doesn't even start</span><br>
                <span data-init="Friday"></span>
            </div>
            <div class="stanza">
                <span>|.Day6| wait</span><br>
                <span>And |.Day7| always comes too late</span><br>
                <span>But |.Day5| never hesitate</span>
            </div>

            <div class="stanza">
                <span>I don't care if |.Day1|'s black</span><br>
                <span>|.Day2|, |.Day3| heart attack</span><br>
                <span>|.Day4| never looking back</span><br>
                <span data-init="Friday"></span>
            </div>
            <div class="stanza">
                <span>|.Day1| you can hold your head</span><br>
                <span>|.Day2|, |.Day3| stay in bed</span><br>
                <span>Or |.Day4| watch the walls instead</span><br>
                <span data-init="Friday"></span>
            </div>
            <div class="stanza">
                <span>|.Day6| wait</span><br>
                <span>And |.Day7| always comes too late</span><br>
                <span>But |.Day5| never hesitate</span>
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
                <span>It's |.Day5|</span><br>
                <span>I'm in love</span>
            </div>
            <div data-init="Opening" class="stanza"></div>
            <div class="stanza">
                <span>|.Day1| you can fall apart</span><br>
                <span>|.Day2|, |.Day3| break my heart</span><br>
                <span>|.Day4| doesn't even start</span><br>
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
            import { transform } from 'https://cdn.skypack.dev/trans-render';
            import { interpolate } from 'https://cdn.skypack.dev/trans-render/lib/interpolate.js';

            let model = {
                Day1: 'Monday', Day2: 'Tuesday', Day3: 'Wednesday', Day4: 'Thursday', Day5: 'Friday',
                Day6: 'Saturday', Day7: 'Sunday',
            };
            const ctx = transform(Main, {
                match: {
                    '*': ({ target }) => {
                        interpolate(target, 'textContent', model);
                    },
                    dataInitAttribs: ({ target, ctx, val }) => {
                        transform(self[val], ctx, target);
                    }
                }
            }, target);
            changeDays.addEventListener('click', e => {
                model = {
                    Day1: 'måndag', Day2: 'tisdag', Day3: 'onsdag', Day4: 'torsdag', Day5: 'fredag',
                    Day6: 'lördag', Day7: 'söndag',
                }
                delete ctx.match.initData;
                transform(target, ctx);
            })
        </script>
    </div>
```

</details>



## Extending trans-render with declarative syntax

The examples so far have relied heavily on arrow functions.  As we've seen, it provides support for 100% no-holds-barred non-declarative code:

```TypeScript
const matches = { //TODO check that this works
    details:{
        summary: ({target}: RenderContext<HTMLSummaryElement>) => {
            ///knock yourself out
            target.appendChild(document.body);
        }
    }
}
```

These arrow functions can return a value.  trans-render's "postMatch" processors allows us to enhance what any custom function does, via some reusable (formally user-registered) processors.  If one of these reusable processors is sufficient for the task at hand, then the arrow function can be replaced by a JSON-like expression, allowing the reusable processor to do its thing, after being passed the context.  trans-render provides a few "standard" processors, which address common concerns.

The first common concern is setting the textContent of an element.

## Mapping textContent

One of the most common things we want to do is set the text content of a DOM Element, from some model value.

```html
<details id=details>
    <summary>E pluribus unum</summary>
    ...
</details>

<script type="module">
    import { transform } from '../../lib/transform.js';
    import { Texter } from '../../lib/Texter.js'
    const hello = 'hello, world';
    transform(details, {
        match:{
            summary: hello
        },
        postMatch: [{rhsType: String, ctor: Texter}]
    })
</script>
```

Or more simply, you can hard-code the greeting, and start to imagine that the binding could (partly) come from some (imported) JSON:

```html
<details id=details>
    <summary>E pluribus unum</summary>
    ...
</details>

<script type="module">
    import { transform } from '../../lib/transform.js';
    import { Texter } from '../../lib/Texter.js';
    //imagine this JSON was obtained via JSON import or fetch:
    import { swedishTransform } from 'myPackage/myUITransforms.js' {assert: {type: 'json'};
    // transform = {
    //    "summary":"Hallå"
    //
    transform(details, {
        match:swedishTransform,
        postMatch: [{rhsType: String, ctor: Texter}]
    })
</script>
```

Sure, there are easier ways to set the summary to 'hello, world', but as the amount of binding grows, the amount of boilerplate will grow more slowly, using this syntax.

Note the configuration setting associated with the transform function, "postMatch".  postMatch is what allows us to reduce the amount of imperative code, replacing it with JSON-like declarative-ish binding instead.  What the postMatch expression is saying is "since the right-hand-side of the expression:

```JavaScript
summary: 'Hallå'
```

is a string, use the Textor class to process the rendering context." 

The brave developer can implement some other way of interpreting a right-hand-side of type "String".  This is the amount of engineering firepower required to implement the Texter processor:

```Typescript
import {PMDo, RenderContext} from './types.js';

export class Texter implements PMDo{
    do(ctx: RenderContext){
        ctx.target!.textContent = ctx.rhs;
    }
}
```

The categories that currently can be declaratively processed in this way are driven by how many primitive types [JavaScript supports](https://github.com/bahrus/trans-render/blob/baseline/lib/matchByType.ts):   

```TypeScript
export function matchByType(val: any, typOfProcessor: any){
    if(typOfProcessor === undefined) return 0;
    switch(typeof val){
        case 'object':
            return val instanceof typOfProcessor ? 1 : -1; 
        case 'string':
            return typOfProcessor === String ? 1 : -1;
        case 'number':
            return typOfProcessor === Number ? 1 : -1;
        case 'boolean':
            return typOfProcessor === Boolean ? 1 : -1;
        case 'symbol':
            return typOfProcessor === Symbol ? 1 : -1;
        case 'bigint':
            return typOfProcessor === BigInt ? 1 : -1;
    }
    return 0;    
}
```

The most interesting case is when the RHS is of type Object.  As you can see, we use the instanceOf to see if the rhs of the expression is an instance of the "rhsType" value of any of the postMatch rules.  The first match of the postMatch array wins out. 

We'll be walking through the "standard post script processors" that trans-render provides, but always remember that alternatives can be used based on the requirements.  The standard processors are striving to make the binding syntax as JSON-friendly as possible.

## What does wdwsf stand for?

As you may have noticed, some abbreviations are used by this library:

* ctx = (rendering) context
* idx = (numeric) index of array
* ctor = class constructor
* rhs = right-hand side
* lhs = left-hand side

## Template Merging Using a Custom Element

We've seen examples where we merge other templates into the main one, which required imperative logic:

```html
<template id="Friday">
    <span data-int>It's |.Day5| I'm in love</span>
</template>
<template id="Opening">
    <span data-int>I don't care if |.Day1|'s blue</span><br>
    <span data-int>|.Day2|'s gray and |.Day3| too</span><br>
    <span data-int>|.Day4| I don't care about you</span><br>
    <span data-init="Friday"></span>
</template>
<template id="Main">
    <div data-init="Opening" class="stanza"></div>
</template>
```

with transform fragment:

```JavaScript
dataInitAttrib: ({ target, ctx, val }) => {
    transform(self[val], ctx, target);
}
```

How can we make this declarative? 

One suggestion would be to use a custom element like [carbon-copy](https://github.com/bahrus/carbon-copy):

```html
<template id="Friday">
    <span>It's |.Day5| I'm in love</span>
</template>
<template id="Opening">
    <span>I don't care if |.Day1|'s blue</span><br>
    <span>|.Day2|'s gray and |.Day3| too</span><br>
    <span>|.Day4| I don't care about you</span><br>
    <b-c-c copy from=./Friday></b-c-c>
</template>
<template id="Main">
    <b-c-c copy from=./Opening></b-c-c>
    ...
</template>
```

But now we need to perform a transform on the cloned HTML.

b-c-c (one of the three carbon-copy elements) supports this:

```html
<b-c-c -to-be-transformed -tr-context noshadow from=myTemplate></b-c-c>
```

and we can recursively, declaratively apply a transform upon cloning:

```JavaScript
trContext: ctx
```

## Loosely Coupled Template Merging When Template Is Specified on RHS[TODO]

The markup above assumes the developer can, and wants to, dictate what the markup should look like.  But in some cases, the markup should be loosely coupled from the need to insert a template.  For example, maybe we want the markup to specialize in what is needed for the light children of a component, but we need to transform that markup into something that makes sense inside the ShadowDOM of a component, when using something like [slot-bot](https://github.com/bahrus/slot-bot).  

Maybe the core HTML markup comes from a third party source, but we want to insert some custom content into that stream.

How can we do this declaratively?

Instead of having a RHS of type string, what if we define a declarative postMatch processor that acts when it sees a template on the RHS?

We could have a rule for this, if the RHS is a template:


```JavaScript
dataInitAttribEqFriday: FridayTemplate
```

## Transforming Templates matched on LHS [TODO]

If the document search that we match on, for the RHS is a template, then replace the template by transforming the template:

1.  Take the innerHTML, use the DOMParser to parse, then apply the transform, according to the transform rule on the RHS.
2.  Use template instantiation, merging in the object on the RHS
3.  Should we:
      1.  Create a new template element from the transformed HTML, and replace the matched template with the new one? Or
      2.  Replace the matching template with the Transformed HTML, so it becomes Live DOM?  Or
      3.  Support both somehow?



## Extensible, Loosely Coupled PostMatches [TODO] Via JS Tuples

This can be quite useful, but we have to make some assumptions about what to do with the template -- clone and append within the matching tag?  Append after the matching tag?  Use ShadowDOM?

To pass more information, we could have an array on the RHS of the match, where the array forms the parameters passed in to the processor.

But as we will see, the idea of using an array to declaratively bind the template extends well beyond just merging in a template.  In the next section, for example, we will want to use an array to bind properties / events / attributes.  In short, we want derive mileage out of [JS Tuples](https://www.tutorialsteacher.com/typescript/typescript-tuple).

The trans-render library resolves this dilemma by placing significance on the type of the first element of the array.  If the first element is of type template, use a template processor.  If it is an object, using another processor.  If it is a boolean, use another one.

To define the processors, we extend the postMatch syntax, using the word "head" to indicate the [first](https://www.geeksforgeeks.org/how-to-get-the-first-element-of-list-in-scala/) element of the array

```html
<template id=myTemplate>
    ...
</template>

<script type="module">
    import { transform } from 'trans-render/lib/transform.js';
    import { Texter } from 'trans-render/lib/Texter.js';
    import { TemplateMerger } from 'trans-render/lib/TemplateMerger.js';
    import { ConditionalTransformer } from 'trans-render/lib/ConditionalTransformer.js';
    transform(myTemplate, {
        match:{
            ...
        },
        postMatch: [
            {rhsType: String, ctor: Texter},
            {rhsType: Array, rhsHeadType: Template, ctor: TemplateMerger},
            {rhsType: Array, rhsHeadType: Boolean, ctor:  ConditionalTransformer},
            etc.
        ]
    })
</script>
```

## Boolean RHS

Remove matching element if false (dangerous). 

## P[E[A[T]]] [TODO]

After setting the string value of a node, setting properties, attaching event handlers, as well as attributes comes next in things we do over and over again.

For this functionality, we use tuples to represent these settings.  P stands for Properties, E for events, A for attributes, and T for transform or template.  There are four nested, and subsequently larger processors that can do one or more of these 4 things.  It is a good idea to use the "weakest" processor for what you need, thereby reducing the footprint of your web component.

In the case of E for events, use Transform on right hand side for DTR.

For non DTR, if PEAT are functions, evaluate based on context first, then apply 

## Dynamic transforms [TODO]

Create link to JSON transform based on context parameters





