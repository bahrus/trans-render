# trans-render

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/trans-render)

<a href="https://nodei.co/npm/trans-render/"><img src="https://nodei.co/npm/trans-render.png"></a>

[![Actions Status](https://github.com/bahrus/trans-render/workflows/CI/badge.svg)](https://github.com/bahrus/trans-render/actions?query=workflow%3ACI)

<img src="https://badgen.net/bundlephobia/minzip/trans-render">

**NB**:  This library is undergoing a face lift.  To see the old functionality that this new code is leading up to, go [here](README_OLD.md)

*trans-rendering* (TR) describes a methodical way of instantiating a template.  It draws inspiration from the (least) popular features of XSLT.  Like XSLT, TR performs transforms on elements by matching tests on those elements.  Whereas XSLT uses XPath for its tests, TR uses css path tests via the element.matches() and element.querySelectorAll() methods.  Unlike XSLT, though, the transform is defined with JavaScript, adhering to JSON-like declarative constraints as much as possible.

A subset of TR, also described below, is "declarative trans-render" syntax [DTR], which is pure, 100% declarative syntax.  

DTR is designed to provide an alternative to the proposed [Template Instantiation proposal](https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Template-Instantiation.md), with the idea being that DTR could continue to supplement what that proposal includes if/when template instantiation support lands in browsers.

XSLT can take pure XML with no formatting instructions as its input.  Generally speaking, the XML that XSLT acts on isn't a bunch of semantically  meaningless div tags, but rather a nice semantic document, whose intrinsic structure is enough to go on, in order to formulate a "transform" that doesn't feel like a hack.

There is a growing (🎉) list of semantically meaningful native-born DOM Elements which developers can and should utilize, including dialog, datalist, details/summary, popup/tabs (🤞) etc. which can certainly help reduce divitis.

But even more dramatically, with the advent of imported, naturalized custom elements, the ratio between semantically meaningful tag names and divs/spans in the template markup will tend to grow much higher, looking more like XML of yore. trans-render's usefulness grows as a result of the increasingly semantic nature of the template markup.  Why? Because often the markup semantics provide enough clues on how to fill in the needed "potholes," like textContent and property setting, without the need for custom markup, like binding attributes.  But trans-render is completely extensible, so it can certainly accommodate custom binding attributes by using additional, optional helper libraries.

This can leave the template markup quite pristine, but it does mean that the separation between the template and the binding instructions will tend to require looking in two places, rather than one.  And if the template document structure changes, separate adjustments may be needed to keep the binding rules in sync.  Much like how separate css style rules often need adjusting when the document structure changes.

## The core libraries

This package contains two core libraries.  

The first, lib/transform.js, is a tiny (1.2k gzip/minified), 'non-committal' library that simply allows us to map css matches to user-defined functions. 

However, this core library serves as a launching pad for an extensible, customizable list of plugins that can make the transform approach a purely declarative syntax.

In addition, this package contains a fairly primitive library for defining custom elements, lib/CE.js, which can be combined with lib/transform.js via lib/mixins/TemplMgmt*.js.

The package xtal-element builds on this package, and the documentation on defining custom elements, with trans-rendering in mind, is documented there [WIP].

So the rest of this document will focus on the trans-rendering aspect, leaving the documentation for xtal-element to fill in the missing details regarding how lib/CE.js works.

## value-add by trans-rendering

The first value-add proposition lib/transform.js provides, is it can reduce the amount of imperative *.selectQueryAll().forEach's needed in our code.  However, by itself, transform.js is not a complete solution, if you are looking for declarative syntax.  That will come with the ability to extend transform.js, which will be discussed below.

The CSS matching the core transform.js supports simply does multi-matching for all (custom) DOM elements within the scope.

### Multi-matching

Multi matching provides support for syntax that is convenient for JS development.  Syntax like this isn't very pleasant:

```JavaScript
"[part*='my-special-section']": {
    ...
}
```

... especially when considering how common such queries will be.

So transform.js supports special syntax for css matching that is more convenient for JS developers:

```JavaScript
mySpecialSectionParts: {
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
                                countWideClasses: ({target}) => {
                                    target.textContent = newCount;
                                },
                                vitaminDElements: ({target}) => {
                                    target.textContent = 2 * newCount;
                                },
                                tripleDeckerParts: ({target}) => {
                                    target.textContent = 3 * newCount;
                                },
                                idAttribs: ({target}) => {
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

The keyword "match" indicates that within that block are CSS Matches.  In this example, all the matches are "multi-matches" because they end with either "Classes", "Elements", "Parts", "Ids", "Props" or "Attribs".

So for example, this:

```JavaScript
dataCountAttribs: ({target, val}) => {
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

We can also start getting a sense of how transforms can be tied to custom element events.  Although the example above is hardly declarative, as we create more rules that allow us to update the DOM, and link events to transforms, we will achieve something approaching a Turing complete(?) solution.

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

## Declarative trans-render syntax via Plugins

Previously, we saw the core value-add that trans-rendering library provides:

Making

```JavaScript
dataCountAttribs: ({target, val}) => {
    ...
}
```

short-hand for:

```JavaScript
fragment.querySelectorAll('[data-count]').forEach(target => {
    const val = target.getAttribute('data-count');
    ...
})
```

We can make this declarative, by using the RenderContext's plugin object:

```JavaScript
transform(Main, {
    plugins: {
        myPlugin: {
            selector: '[data-count]', //optional
            processor: ({target, val}) => {
                ...
            }
        }
    }, 
    match:{
        dataCountAttribs: 'myPlugin'
    }
})

## Declarative trans-render syntax via PostMatch Processors 

The examples so far have relied heavily on arrow functions.  As we've seen, it provides support for 100% no-holds-barred non-declarative code:

```TypeScript
const matches = { //TODO: check that this works
    details:{
        summary: ({target}: RenderContext<HTMLSummaryElement>) => {
            ///knock yourself out
            target.appendChild(document.body);
        }
    }
}
```

These arrow functions can return a value.  trans-render's "postMatch" processors allow us to enhance what any custom function does, via some reusable (formally user-registered) processors.  If one of these reusable processors is sufficient for the task at hand, then the arrow function can be replaced by a JSON-like expression, allowing the reusable processor to do its thing, after being passed the context.  

This is the key to how the unconstrained TR syntax can, in a large number of cases, be made purely declarative.

trans-render provides a few "standard" processors, which address common concerns.

The first common concern is setting the textContent of an element.

## Mapping textContent

### Setting the text content without the presence of a host

**NB:** The syntax below works and is supported, but will rarely be used in practice.  The syntax more likely to be used in practice [begins here](https://github.com/bahrus/trans-render#declarative-dynamic-content-based-on-presence-of-ctxhost)

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
    });
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
    import { swedishTransform } from 'myPackage/myUITransforms.json' {assert: {type: 'json'};
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

...is a string, use the Texter class to process the rendering context." 

The brave developer can implement some other way of interpreting a right-hand-side of type "String".  This is the amount of engineering firepower required to implement the Texter processor:

```TypeScript
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

However, let's be honest -- JSON is quite limited when it comes to types.  Since DTR must be 100% pure JSON, we will first see how we can use these sets of rules, and see how far it takes us (narrator:  not very far).  Later we will discuss an additional layer of custom processors we can add to the mix (that provides a synergistic solution with other solutions, including "may-it-be" attributes and Cloudflares HTMLRewriter).

We'll be walking through the "standard post script processors" that trans-render provides, but always remember that alternatives can be used based on the requirements.  The standard processors are striving to make the binding syntax as JSON-friendly as possible.

## What does wdwsf stand for?

As you may have noticed, some abbreviations are used by this library:

* ctx = (rendering) context
* idx = (numeric) index of array
* ctor = class constructor
* rhs = right-hand side
* lhs = left-hand side
* PM = post match

## Declarative, dynamic content based on presence of ctx.host

The inspiration for TR came from wanting a syntax for binding templates to a model provided by a hosting custom element.

The RenderContext object "ctx" supports a special placeholder for providing the hosting custom element:  ctx.host.  But the name "host" can be interpreted a bit loosely.  Really, it could be treated as the provider of the model that we want the template to bind to. 

But having standardized on a place where the dynamic data we need can be derived from, we can start adding declarative string interpolation:

```JavaScript
    match:{
        "summary": ["hello",  "place"]
    }
```


... means "set the textContent of the summary element to "hello [the value of the world property of the host element or object]".

This feature is *not* part of the core transform function.  It requires one of the standard declarative TR helpers that are part of this package, SplitText.js:


```html
<details id=details>
    <summary>Amor Omnia Vincit</summary>
    <article></article>
    ...
</details>

<script type="module">
    import { transform } from 'trans-render/lib/transform.js';
    import { SplitText } from 'trans-render/lib/SplitText.js';
    transform(details, {
        match:{
            "summary": ["Hello", "place", ".  What a beautiful world you are."],
            "article": "mainContent"
        },
        host:{
            place: 'Mars',
            mainContent: "Mars is a red planet."
        },
        postMatch: [{
            rhsType: Array, 
            rhsHeadType: String,
            ctor: SplitText
        }]
    })
</script>
```

The array alternates between static content, and dynamic properties coming from the host.


## P[E[A]] 

After setting the string value of a node, setting properties, attaching event handlers, and setting attributes (including classes and parts) comes next in things we do over and over again.

We do that via using an Array for the rhs of a match expression.  We interpret that array as a tuple to represent these settings.  P stands for Properties, E for events, A for attributes. <!-- and T for template or transform, or tuple of template and transform.-->  There are three nested, and subsequently larger processors that can do one or more of these 3 things.  It is a good idea to use the "weakest" processor for what you need, thereby reducing the footprint of your web component.

### Property setting (P)

We follow a similar approach for setting properties as we did with the SplitText plug-in.  

The first element of the RHS array is devoted to property setting:

```html
<template id=template>
<my-custom-element></my-custom-element>
</template>

<script type=module>
    import { transform } from 'trans-render/lib/transform.js';
    import { P } from 'trans-render/lib/P.js';
    transform(template, {
        match:{
            myCustomElementElements: [{myProp0: ["Some Hardcoded String"], myProp1: "hostPropName", myProp2: ["Some interpolated ", "hostPropNameForText"]}]
        },
        postMatch: [{
            rhsType: Array,
            rhsHeadType: Object,
            ctor: P
        }]
    });
</script>
```



### Add event listeners

The second element of the array allows us to add event listeners to the element.  For example:

```JS
match:{
    myCustomElementElements: [{}, {click: myEventHandlerFn, mouseover: 'myHostMouseOverFn'}]
}
```

[TODO] Document Array event handlers

### Set attributes / classes / parts / [decorator attributes](https://github.com/bahrus/be-decorated).

Example:

```JS
match:{
    myCustomElementElements: [{}, {}, {
        "my-attr": "myHostProp1", 
        ".my-class": true, 
        "my-bool-attr": true, 
        "my-go-away-attr": null, 
        "::my-part": true, 
        "be-all-you-can-be": {
            some: "JSON",
            object: true,
        }}]
}
```

## Nested, Scoped Transforms

One useful plug-in for transform.js is NestedTransform.js, which allows the RHS of a match to serve as a springboard for performing a sub transform.

## Extensible, Loosely Coupled PostMatches Via JS Tuples

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

Remove matching element if false (dangerous). If true, instantiate template, with context.state(?) as object to bind to.

[TODO] -- did we eer implement this?
















