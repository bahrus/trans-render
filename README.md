# trans-render

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/trans-render)

<a href="https://nodei.co/npm/trans-render/"><img src="https://nodei.co/npm/trans-render.png"></a>

[![Actions Status](https://github.com/bahrus/trans-render/workflows/CI/badge.svg)](https://github.com/bahrus/trans-render/actions?query=workflow%3ACI)

<img src="https://badgen.net/bundlephobia/minzip/trans-render">


*trans-rendering* (TR) describes a methodical way of instantiating a template.  It draws inspiration from the (least) popular features of XSLT.  Like XSLT, TR performs transforms on elements by matching tests on those elements.  Whereas XSLT uses XPath for its tests, TR uses css path tests via the element.matches() and element.querySelectorAll() methods.  Unlike XSLT, though, the transform is defined with JavaScript, adhering to JSON-like declarative constraints as much as possible.

A subset of TR, also described below, is "declarative trans-render" syntax [DTR], which is pure, 100% declarative syntax.  

DTR is designed to provide an alternative to the proposed [Template Instantiation proposal](https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Template-Instantiation.md), the idea being that DTR could continue to supplement what that proposal includes if/when template instantiation support lands in browsers.

XSLT can take pure XML with no formatting instructions as its input.  Generally speaking, the XML that XSLT acts on isn't a bunch of semantically  meaningless div tags, but rather a nice semantic document, whose intrinsic structure is enough to go on, in order to formulate a "transform" that doesn't feel like a hack.

There is a growing (🎉) list of semantically meaningful native-born DOM Elements which developers can and should utilize, including dialog, datalist, details/summary, popup/tabs (🤞) etc. which can certainly help reduce divitis.

But even more dramatically, with the advent of imported, naturalized custom elements, the ratio between semantically meaningful tag names and divs/spans in the template markup will tend to grow much higher, looking more like XML of yore. trans-render's usefulness grows as a result of the increasingly semantic nature of the template markup.  Why? Because often the markup semantics provide enough clues on how to fill in the needed "potholes," like textContent and property setting, without the need for custom markup, like binding attributes.  But trans-render is completely extensible, so it can certainly accommodate custom binding attributes by using additional, optional helper libraries.

This can leave the template markup quite pristine, but it does mean that the separation between the template and the binding instructions will tend to require looking in two places, rather than one.  And if the template document structure changes, separate adjustments may be needed to keep the binding rules in sync.  Much like how separate css style rules often need adjusting when the document structure changes.

## The core libraries

This package contains three core libraries.  

The first, lib/TR.js, is a tiny, 'non-committal' library that simply allows us to map css matches to user-defined functions, and a little more. 

The second, lib/DTR.js, extends TR.js but provides robust declarative syntax support.  With the help of "hook like" web component decorators / trans-render plugins, we rarely if ever need to define user-defined functions, and can accomplish full, turing complete (?) rendering support while sticking to 100% declarative JSON.

In addition, this package contains a fairly primitive library for defining custom elements, lib/CE.js, which can be combined with lib/DTR.js via lib/mixins/TemplMgmt*.js.

The package xtal-element builds on this package, and the documentation on defining custom elements, with trans-rendering in mind, is documented there [WIP].

So the rest of this document will focus on the trans-rendering aspect, leaving the documentation for xtal-element to fill in the missing details regarding how lib/CE.js works.

## value-add by trans-rendering (TR.js)

The first value-add proposition lib/TR.js provides, is it can reduce the amount of imperative *.selectQueryAll().forEach's needed in our code.  However, by itself, TR.js is not a complete solution, if you are looking for a robust declarative solution.  That will come with the ability to extend TR.js, which DTR.js does, and which is discussed later.

The CSS matching the core TR.js supports simply does multi-matching for all (custom) DOM elements within the scope, and also scoped sub transforms.

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

### Syntax Example

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
        import { TR } from '../../lib/TR.js';
        TR.transform(Main, {
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
tr.transform(Main, {...}, container)
```

2.  Updating an existing DOM tree:

```JavaScript
tr.transform(container, {...})
```

We can also start getting a sense of how transforms can be tied to custom element events.  Although the example above is hardly declarative, as we create more rules that allow us to update the DOM, and link events to transforms, we will achieve something approaching a declarative yet Turing complete(?) solution.

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

## Nested Matching

Just as CSS will support nesting, TR supports nesting out-of-the-box.  If the RHS is an object, a sub transform is performed within that scope.

## Declarative trans-render syntax via plugins

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
const dataCountPlugin = {
    selector: 'dataCountAttribs',
    processor: ({target, val}) => {
        ...
    }
}
transform(Main, {
    plugins: {
        myPlugin: dataCountPlugin
    }, 
    match:{
        [dataCountPlugin.selector]: 'myPlugin'
    }
})
```

## Developing a dynamically loaded be-* plugin

A special class of plugins can be developed with these characteristics:

1.  Transform is associated with a [be-decorated](https://github.com/bahrus/be-decorated) custom attribute / decorator/ behavior, where the attribute starts with be- or data-be-.
2.  Optionally, ff the plugin isn't yet loaded before the transform starts, it can be skipped over, and fallback to the decorator being executed after the library has downloaded (and the cloned template has already been added to the DOM live tree).  This allows the user to see the rest of the HTML content, and apply the plugin once progressively loaded (but DOM manipulation is now a bit costlier, as the browser may need to update the UI that is already visible).

We call such plugins "be-plugins".

To create a be-plugin create a script as follows:

```TypeScript
import {RenderContext, TransformPluginSettings} from 'trans-render/lib/types';
import {register} from 'trans-render/lib/pluginMgr.js';
import { hookUp } from './hookUp';

export const trPlugin: TransformPluginSettings = {
    selector: 'beMybehaviorAttribs',
    processor: async ({target, val, attrib, host}: RenderContext) => {
        ...   
    }
}

register(trPlugin);
```

We can now reference this be-plugin via a simple string:

```JavaScript
transform(Main, {
    plugins: {
        beMybehaviorAttribs: true,
    }, 
    match:{
        
    }
})
```

Useful plugins that are available:

1.  [be-plugin](https://github.com/bahrus/be-observant/blob/baseline/trPlugin.ts) for [be-observant](https://github.com/bahrus/be-observant/)
2.  [be-plugin](https://github.com/bahrus/be-repeated/blob/baseline/trPlugin.ts) for [be-repeated](https://github.com/bahrus/be-repeated)


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
    import { DTR } from 'trans-render/lib/DTR.js';
    DTR.transform(details, {
        match:{
            "summary": ["Hello", "place", ".  What a beautiful world you are."],
            "article": "mainContent"
        },
        host:{
            place: 'Mars',
            mainContent: "Mars is a red planet."
        },
    });
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
    import { DTR } from 'trans-render/lib/DTR.js';
    DTR.transform(template, {
        match:{
            myCustomElementElements: [{myProp0: ["Some Hardcoded String"], myProp1: "hostPropName", myProp2: ["Some interpolated ", "hostPropNameForText"]}]
        },
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
        myAttr: "myHostProp1", 
        ".my-class": true, 
        myBoolAttr": true, 
        myGoAwayAttr: null, 
        "::my-part": true, 
        beAllYouCanBe: {
            some: "JSON",
            object: true,
        }}]
}
```



## Boolean RHS

Remove matching element if false (dangerous). 


















