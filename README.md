# trans-render

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/trans-render)

<a href="https://nodei.co/npm/trans-render/"><img src="https://nodei.co/npm/trans-render.png"></a>

[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/trans-render?style=for-the-badge)](https://bundlephobia.com/result?p=trans-render)

<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/trans-render?compression=gzip">

[![Playwright Tests](https://github.com/bahrus/trans-render/actions/workflows/CI.yml/badge.svg?branch=baseline)](https://github.com/bahrus/trans-render/actions/workflows/CI.yml)

*trans-rendering* (TR) describes a methodical way of instantiating a template.  It originally drew inspiration from the (least) popular features of XSLT, but has since evolved to more closely resemble standard CSS.  Like XSLT, TR performs transforms on elements by matching tests on those elements.  TR uses css tests on elements via the element.matches() and element.querySelectorAll() methods.  Unlike XSLT, though, the transform is defined with JavaScript, adhering to JSON-like declarative constraints as much as possible.

A subset of TR, also described below, is "declarative trans-render" syntax [DTR], which is pure, 100% declarative syntax.  

DTR is designed to provide an alternative to the proposed [Template Instantiation proposal](https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Template-Instantiation.md), the idea being that DTR could continue to supplement what that proposal includes if/when template instantiation support lands in browsers.

Other uses cases for TR/DTR:

1.  Hydrating / adjusting server-rendered content.
2.  Hydrating / adjusting (third party) HTML retrieved via fetch.
3.  Hydrating / adjusting (third party) HTML output from an XSLT transform.

XSLT can take pure XML with no formatting instructions as its input.  Generally speaking, the XML that XSLT acts on isn't a bunch of semantically  meaningless div tags, but rather a nice semantic document, whose intrinsic structure is enough to go on, in order to formulate a "transform" that doesn't feel like a hack.

There is a growing (🎉) list of semantically meaningful native-born DOM Elements which developers can and should utilize, including dialog, datalist, details/summary, popup/tabs (🤞) etc. which can certainly help reduce divitis.

But even more dramatically, with the advent of imported, naturalized custom elements, the ratio between semantically meaningful tag names and divs/spans in the template markup will tend to grow much higher, looking more like XML of yore. trans-render's usefulness grows as a result of the increasingly semantic nature of the template markup.  Why? Because often the markup semantics provide enough clues on how to fill in the needed "potholes," like textContent and property setting, without the need for custom markup, like binding attributes.  But trans-render is completely extensible, so it can certainly accommodate custom binding attributes by using additional, optional helper libraries.

This can leave the template markup quite pristine, but it does mean that the separation between the template and the binding instructions will tend to require looking in two places, rather than one.  And if the template document structure changes, separate adjustments may be needed to keep the binding rules in sync.  Much like how separate css style rules often need adjusting when the document structure changes.

## The core libraries

This package contains three core libraries.  

The first, lib/TR.js, is a tiny, 'non-committal' library that simply allows us to map css matches to user-defined functions, and a little more. 

The second, lib/DTR.js, extends TR.js but provides robust declarative syntax support.  With the help of "hook like" web component decorators / trans-render plugins, we rarely if ever need to define user-defined functions, and can accomplish full, turing complete (?) rendering support while sticking to 100% declarative JSON.

In addition, this package contains a fairly primitive library for defining custom elements, lib/CE.js, which can be combined with lib/DTR.js via lib/mixins/TemplMgmt.js.

The package [xtal-element](https://github.com/bahrus/xtal-element) builds on this package, and the documentation on defining custom elements, with trans-rendering in mind, is documented there [WIP].

So the rest of this document will focus on the trans-rendering aspect, leaving the documentation for xtal-element to fill in the missing details regarding how lib/CE.js works.

## value-add by trans-rendering (TR.js)

The first value-add proposition lib/TR.js provides, is it can reduce the amount of imperative *.selectQueryAll().forEach's needed in our code.  However, by itself, TR.js is not a complete solution, if you are looking for a robust declarative solution.  That will come with the ability to extend TR.js, which DTR.js does, and which is discussed later.

The CSS matching that the core TR.js supports simply does multi-matching for all (custom) DOM elements within the scope, and also scoped sub transforms.

Note that TR.js is a class, with key method signatures allow for alternative syntax / extensions.

### Selecting/Matching

Although the way we match elements is almost identical to standard CSS, trans-render provides support for syntax that is more convenient for JS development.  Syntax like this isn't very pleasant:

```JavaScript
"[part~='my-special-section']": {
    ...
}
```

... especially when considering how common such queries will be.

In addition, one of the goals of the DTR is that the transform can be embedded as JSON-in-HTML, which becomes annoying when there need to be quotes in the string (have to use &apos).

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

The keyword "match" indicates that within that block are CSS Matches.

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
        <td>The last capital letter in the string is a "P", and ends with "s"</td><td>myRegionParts</td><td>.querySelectorAll('[part~="my-region"]')</td><td>Suggested <a href=https://github.com/WICG/webcomponents/issues/964#issuecomment-1203296793>here</a>.  Hopefully this is precise.</td>
    </tr>
    <tr>
        <td>The last capital letter in the string is a "P", doesn't end with "s"</td><td>myRegionPt</td><td>.querySelector('[part~="my-region"]')</td><td></td>
    </tr>
    <tr>
        <td>The last capital letter in the string is an "A", ends with "s"</td><td>ariaLabelAttrs</td><td>.querySelectorAll('[aria-label]')</td><td>The value of the attribute is put into context:  ctx.val</td>
    </tr>
    <tr>
        <td>The last capital letter in the string is an "A", doesn't end with "s"</td><td>ariaLabelAttrib</td><td>.querySelector('[aria-label]')</td><td>The value of the attribute is put into context:  ctx.val</td>
    </tr>
    <tr>
        <td>The last capital letter in the string is a "C", ends with "s"</td><td>pinkFlamingoClasses</td><td>.querySelectorAll('.pink-flamingo')</td><td></td>
    </tr>
    <tr>
        <td>The last capital letter in the string is a "C", doesn't end with "s"</td><td>pinkFlamingoClash</td><td>.querySelector('.pink-flamingo')</td><td></td>
    </tr>
    <tr>
        <td>The last capital letter in the string is a "I"</td><td>driversLicenseIdId</td><td>.querySelector('#drivers-license-id')</td><td>Untested</td>
    </tr>
    <!-- <tr>
        <td>Contains Eq, ends with Attribs</td><td>ariaLabelEqHelloThereAttribs</td><td>.querySelectorAll('[arial-label="HelloThere"])</td><td>If space needed ("Hello There") then LHS needs to be wrapped in quotes.   [TODO], waiting for a good use case to see if this is helpful</td>
    </tr> -->
    <tr>
        <td>The last capital letter in the string is an "E", ends with "s"</td><td>flagIconEls</td><td>.querySelectorAll('flag-icon')</td><td></td>
    </tr>
    <tr>
        <td>The last capital letter in the string is a "E", doesn't end with "s"</td><td>flagIconElement</td><td>.querySelector('flag-icon')</td><td></td>
    </tr>
    <tr>
        <td>The last capital letter in the string is a "D"</td><td>textContentDash</td><td>.querySelectorAll('[-text-content]')</td><td>Useful for binding properties in bulk</td>
    </tr>
    <tr>
        <td>The last capital letter in the string is a "N", ends with "s"</td><td>firstNameNames</td><td>.querySelectorAll('[name="first-name"]')</td><td>Untested.</td>
    </tr>
    <tr>
        <td>The last capital letter in the string is a "N", doesn't end with "s"</td><td>firstNameN</td><td>.querySelector('[name="first-name"]')</td>
        <td>
            Untested. 
        </td>
    <tr>
        <td>Anything else</td><td>'a[href$=".mp3"]'</td><td>.querySelectorAll('a[href$=".mp3"]')</td><td>&nbsp;</td>
    </tr>
</table>




## Extending TR, DTR "vertically"

The lib/DTR.js file extends the class in the file lib/TR.js, and continues to break things down into multiple methods, again allowing for alternative syntax / implementations via method overriding.

Most all these methods are asynchronous, so they can dynamically load modules.  Following this pattern, the implementations in those methods impose no penalty unless they are actually used.

We will discuss this type of extension later.

## Extending DTR "horizontally"  via dynamically imported plugins

Using extend methods as described above is a bit constraining.  An additional mechanism to extend the TR/DTR vocabulary is via dynamic plugins.

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

We can make this more declarative, by using the RenderContext's plugin object:

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
2.  Optionally, if the plugin isn't yet loaded before the transform starts, it can be skipped over, and fall back to the decorator being executed after the library has downloaded (and the cloned template has already been added to the DOM live tree).  This allows the user to see the rest of the HTML content without being blocked waiting for the library to download, and apply the plugin once progressively loaded (but DOM manipulation is now a bit costlier, as the browser may need to update the UI that is already visible).

We call such plugins "be-plugged-in's".

To create a be-plugged-in create a script as follows:

```TypeScript
import {RenderContext, TransformPluginSettings} from 'trans-render/lib/types';
import {register} from 'trans-render/lib/pluginMgr.js';

export const trPlugin: TransformPluginSettings = {
    selector: 'beMyBehaviorAttribs',
    processor: async ({target, val, attrib, host}: RenderContext) => {
        ...   
    }
}

register(trPlugin);
```

We can now reference this be-plugged-in via a simple string:

```JavaScript
transform(Main, {
    plugins: {
        beMyBehaviorAttribs: true,
    }, 
    match:{
        
    }
})
```

Useful be-plugged-in's that are available:

1.  [be-plugin](https://github.com/bahrus/be-observant/blob/baseline/trPlugin.ts) for [be-observant](https://github.com/bahrus/be-observant/)
2.  [be-plugin](https://github.com/bahrus/be-repeated/blob/baseline/trPlugin.ts) for [be-repeated](https://github.com/bahrus/be-repeated)

The table below outlines the differences between horizontal extensions via plug-ins and vertical extension via overriding methods, implementing more functionality into TR/DTR

<table>
    <caption>Differences between horizontal extensions vs vertical extensions</caption>
    <thead>
        <tr>
            <th>Aspect</th>
            <th>With vertical extensions</th>
            <th>With horizontal extensions</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>How to implement</td>
            <td>Add / override additional methods to (forked) version of TR.js/DTR.js.  Methods are called based on a combination of typing inference of the RHS, as well as reserved key values in the RHS expressions.</td>
            <td>Create an independent (npm) package that is imported (dynamically), and registered as a plugin.</td>
        </tr>
        <tr>
            <td>Where the binding instructions are located</td>
            <td>Mostly separate from the markup (like separate css files)</td>
            <td>Via inline binding in the markup (like inline styling).  This is much more like traditional templating found with Vue, Angular, etc.</td>
        <tr>
            <td>Render blocking?</td>
            <td>If syntax is encountered that means routing to a method, then that method will likely load the needed code asynchronously.  However, this means the user won't see any results until all the dependencies of the method implementations are downloaded.</td>
            <td>If the library isn't loaded yet, the plugin is ignored, but picked up by an element behavior / decorator on the live DOM tree.</td?>
    </tbody>
</table>


## Declarative trans-render syntax via JSON-serializable RHS expressions with lib/DTR.js 

The examples so far have relied heavily on arrow functions.  (In the case of plugins, we are, behind the scenes, amending the matches to include additional, hidden arrow functions on the RHS.)

As we've seen, this provides support for 100% no-holds-barred non-declarative code:

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

These arrow functions can return a value.  DTR.js has some built-in standard  "post match" processors that allow us to "act" based on the data either returned by a function like above, or much more likely, already in JSON-serializable format (i.e. no function, making the transform totally JSON serializable). 

The capabilities of these post-match processors are quite limited in what they can do, due to the small number of expression types JavaScript (and especially JSON) supports.

So we reserve the limited declarative syntax JSON provides for the most common use cases.

The first common use case is setting the textContent of an element, which we lead up to below.

## Declarative, dynamic content based on presence of ctx.host

The inspiration for TR came from wanting a syntax for binding templates to a model provided by a hosting custom element.

The RenderContext object "ctx" supports a special placeholder for providing the hosting custom element:  ctx.host.  But the name "host" can be interpreted a bit loosely.  Really, it could be treated as the provider of the model that we want the template to bind to. 

But having standardized on a place where the dynamic data we need can be derived from, we can start adding declarative string interpolation:

```JavaScript
    match:{
        "summary": ["hello",  "place"]
    }
```


... means "set the textContent of the summary element to "hello [the value of the "place" property of the host element or object]".

Let's look at an example in more detail:

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

The binding support for string properties isn't limited to a single property key.

If the property key starts with a ".", then the property key supports a dot-delimited path to a property.  And "??" is supported.  So:

```JavaScript
match:{
    summary: ["Hello ", ".place.location ?? world"],  
}
```

will bind to host.place.location.  If that is undefined, then the "world" default will be used.  If the string to the right of ?? starts with a ., the same process is repeated recursively.

Like most all UI libraries, only changes to the top property is reacted to automatically.

## Invoking (a chain of) methods

Limited invoking of methods is supported.

For example:

```JavaScript
match:{
    countPart: '.count.toLocaleString|'
}
```

means "evaluate toLocalString() of the count property."  

The pipe operator allows one hardcoded string argument:

```JavaScript
match:{
    countPart: '.count.toLocaleString|en-US.indexOf|,000'
}
```

In many circumstances, the transform is kept separate from the HTML template, so we can still import HTML templates, even from untrusted third-party providers.  The syntax to invoke the method is not in the template, but rather in the separate transform.



However, DTR can also be specified in third party template instantiation behaviors imported via fetch, for example.  But even here, the use of methods defined above is applied to the host model, not to elements of the imported template, so again, the risks seem low for opening up this ability.  Nevertheless, a mechanism may be provided by be-hive to allow these behaviors to be opted-in, while restraining the list of invocable methods.  There are other scenarios where this customization ability would have more apparent importance [TODO]. 

## P[E[A[T]]] 

After setting the string value of a node, setting properties, attaching event handlers, and setting attributes (including classes and parts), and specifying the light children comes next in things we do over and over again

So we reserve another of our extremely limited RHS types JSON supports to this use case.

We do that via using an Array for the rhs of a match expression.  We interpret that array as a tuple to represent these settings.  P stands for Properties, E for events, A for attributes. 

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

The same limited support for . and ?? described above is supported here.

### Add event listeners (E)

The second element of the array allows us to add event listeners to the element.  For example:

```JS
match:{
    myCustomElementElements: [{}, {click: myEventHandlerFn, mouseover: 'myHostMouseOverFn', 'myProp:onSet': {...}}]
}
```

As you can see, TR/DTR supports three ways to hookup an event handler.  The first one is not JSON serializable, so it doesn't qualify as "declarative".  It works best with arrow function properties of the host (no binding attempt is made).  Likewise with the second option, but here we are referencing, by name, the event handler from the host.

The third option provides a declarative syntax for doing common things done in an event handler, but declaratively.  Things like toggling property values, incrementing counters, etc.

The syntax is borrowed from the [be-noticed](https://github.com/bahrus/be-noticed) decorator / DTR plugin, and much of the code is shared between these two usages.

### Set attributes / classes / parts / [decorator attributes](https://github.com/bahrus/be-decorated). (A)

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

### Set Light Children (T)

The fourth optional element can either be a template, or an HTML string that DTR converts into a template, after sanitizing the string (if the browser supports sanitizing).  It is cloned, transformed based on the inherited transform rules, and appended to the element, after deleting the previous content.

## Boolean RHS -- Remove and Refs

If the RHS is boolean value "false", then the matching elements are removed.

If the RHS is boolean value "true", then the matching elements are placed in the Host element with property key equal to the LHS. This is the "ref" equivalent of other templating libraries.  One difference, perhaps, is the property is set to an array of weak references.


[TODO] Show examples

## Ditto notation

One limitation JS / JSON has, that css doesn't have, is we can't use the same key twice.

To overcome that, we can have multiple rules with the same key, if the subsequent keys start with a ^ character.

For an example of this, [see below](#example-3----switch).

## Conditional RHS

### Prelude

Much conditional display logic can be accomplished via css -- set various attributes to string values as described above, pulling in values from the host, then allow css to interpret those attributes in such a way as to accomplish the conditional display we are after.

But sometimes this isn't sufficient.  Sometimes the values of the attributes (or properties) themselves need to be conditional.  

One approach to accomplishing this is by adding a "computed property" to the host element, that calculates what the value of the attribute should be, with the full power of JavaScript at our disposal.  But this solution may not be sufficient when we *have* no host class to begin with (e.g. declarative custom elements).  And it may also be argued that even if we do, these types of computed properties are too tied to the UI.

So, that is what the declarative expressions below address.  As with everything else in this library, the logic for this is only loaded on demand, so use or don't use, the penalty is minimal either way.

### On to business

If the RHS is an array, but the head element of the array is a boolean, then we switch into "conditional display" logic.

<table>
    <tr>
        <th>First Element Value</th>
        <th>Second Element Usage</th>
        <th>Third Element Usage</th>
        <th>Fourth Element Usage</th>
        <th>Notes</th>
    </tr>
    <tr>
        <td>true -- strict mode</td>
        <td>The second element is expected to be an object that matches the <a href="https://github.com/bahrus/be-switched/blob/baseline/types.d.ts#L5" target=_blank>BeSwitchedVirtualProps type</a>.  Only the right hand side of many of those field expressions are evaluated recursively from the rules above.
        </td>
        <td>
            If the second element is satisfied, apply the third element according to all the rules above (recursively), assigning values / attaching event handlers on the target element.
        </td>
        <td>
            If the second element is **not** satisfied, apply the fourth element according to all the rules above (recursively), assigning values / attaching event handlers on the target element.
        </td>
        <td>
            Syntactically, it looks a bit odd to interpret "true" as "you are now looking at a conditional statement".  
            If editing the transform in js/mjs, it might seem more intuitive reading if using this "true || false".
       </td>
    </tr>
    <tr>
        <td>false -- loose mode</td>
        <td>JavaScript expression that is evaluated against the Shadow Realm</td>
        <td>"</td>
        <td>"</td>
        <td>Big time TODO</td>
    </tr>
</table>

### Example 1 - Boolean expression

```html
<template id='templ'>
    <input>
</template>
<div id='target'></div>
<script type='module'>
    import {DTR} from '../lib/DTR.js';
    const conditional = true || false; // call it whatever makes it more readable
    const dtr = DTR.transform(templ, {
        host: {typeIsBoolean: false},
        match:{
            input: [conditional, 
                {
                    if: 'typeIsBoolean', //condition
                },
                [{type:['checkbox']}], // if condition is true
                [{type: ['range']}] // if condition is false
            ]
        }
    }, target);
</script>
```

results in:

```html
<div id='target'>
    <input type=range>
</div>
```

So as we can see, the conditional expression incorporates the P[E[A]] logic mentioned above, as far as setting the type attribute.

Remember that within a PEA expressions, to specify a hardcoded string, as opposed to a path coming from the host, strings need to be wrapped inside an array (to allow for interpolation).

### Example 2 -- Comparison

```html
<template id='templ'>
    <input>
</template>
<div id='target'></div>
<script type='module'>
        import {DTR} from '../lib/DTR.js';
        const iff = true || false;
        const dtr = DTR.transform(templ, {
            host: {type: 'boolean'},
            match:{
                input: [iff, {lhs: 'type', op: '===', rhsVal: 'boolean'},[{type:['checkbox']}]]
            }
        }, target);
    </script>
```

So lhs/rhs is expecting a path to evaluate from the host.

lhsVal/rhsVal is expecting a hard coded value.

results in:

```html
<div id=target>
    <input type=checkbox>
</div>
```



### Example 3 -- Switch

```html
<template id='templ'>
    <input>
</template>
<div id='target'></div>
<script type='module'>
    import {DTR} from '../lib/DTR.js';
    const iff = true || false;
    const dtr = DTR.transform(templ, {
        host: {type: 'boolean'},
        match:{
            input: [iff, {lhs: 'type', op: '===', rhsVal: 'number'}, [{type:['range']}]],
            '^': [iff, {lhs: 'type', op: '===', rhsVal: 'string'}, [{type:['text']}]],
            '^^': [iff, {lhs: 'type', op: '===', rhsVal: 'boolean'}, [{type:['checkbox']}]],
        }
    }, target);
</script>
```

results in:

```html
<div id=target>
    <input type=checkbox>
</div>
```

## Loop RHS [TODO]

If the rhs is an array, and the first element of the array is an empty array, then we are now specifying a loop (adopt be-repeated syntax).

### DTR/TR method extensions for RHS =  Non Array Object

Recall how we can extend TR/DTR "vertically" by overriding the built-in methods with subclasses.

There's one RHS type we have conspicuously avoided discussing so far -- where the RHS expression is a non-array object.  

Here is where we really enable making the TR/DTR classes extensible "vertically".

If the RHS is a non-array object, the determinant for what to do with such expressions is based on the reserved field with reserved key "$action".

Method with name do_object_[$action] is invoked.  A single parameter of the render context is passed in.

### Nested Matching

Just as CSS will support nesting (hopefully, eventually), TR supports nesting out-of-the-box.  If the RHS is a non-array object, and that object has property a sub transform is performed within that scope (Only one exception -- if using lhs that ends with Props for bulk prop setting).

If the RHS is a non-array object, and that object has field $action: "nested_transform", then the nested transform is performed (via calling do_object_nested_transform) as discussed above.

## Setting Props the easy way

If the RHS expression is a non array object without an $action property, then the RHS is used to set properties on the element.

## Answers to questions no one is asking

<details>
<summary>API details</summary>

>Does TR/DTR cache anything?

TR caches the results of querySelector* in weak references, for rapid updates.  

>How do I clear the cache?

ctx.self.flushCache()

>When should I clear the cache?

Any transforms that alter the DOM, like lazy loading or conditional display.

>Should I share instances of TR/DTR across multiple hosts?

No.  The caching is tied to the host.

</details>


















