# trans-render

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/trans-render)
[![NPM version](https://badge.fury.io/js/trans-render.png)](http://badge.fury.io/js/trans-render)
[![Playwright Tests](https://github.com/bahrus/trans-render/actions/workflows/CI.yml/badge.svg?branch=baseline)](https://github.com/bahrus/trans-render/actions/workflows/CI.yml)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/trans-render?style=for-the-badge)](https://bundlephobia.com/result?p=trans-render)
<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/trans-render?compression=gzip">

## Binding from a distance

*trans-rendering* (TR) provides a methodical way of "binding from a distance" -- updating DOM fragments without the need for custom inline binding instructions.  It draws inspiration from the (least) popular features of XSLT, and more significantly, CSS.  Unlike XSLT/CSS, though, the transform is defined with JavaScript, adhering to JSON-like declarative constraints as much as possible. Like those syntaxes, *TR* performs transforms on elements by matching tests on those elements.  *TR* uses css selector tests on elements via the element.matches() and element.querySelectorAll() methods.  

*TR* rests on:

1.  A JavaScript object -- the model, which could, for example, be the hosting custom element.
2.  A DOM fragment to update / enhance.
3.  A user defined "Fragment Manifest" where the binding rules are defined, mostly declaratively.
4.  Optionally, an EventTarget that emits events when properties of the model change.  We will refer to this optional EventTarget as the "propagator".  If not provided, the transformer creates one automatically.

*TR* is designed to provide an alternative to the proposed [Template Instantiation proposal](https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Template-Instantiation.md), the idea being that *TR* could continue to supplement what that proposal includes if/when template instantiation support lands in browsers.

To achieve the css-like ability to respond to new elements being dynamically added / removed, TR builds on top of the MountObserver api [proposal](https://github.com/WICG/webcomponents/issues/896) / [polyfill](https://github.com/bahrus/mount-observer). 

## Use cases for TR

1.  Hydrating / adjusting server-rendered content.
2.  Hydrating / adjusting (third party) HTML retrieved via fetch.
3.  Hydrating / adjusting (third party) HTML output from an XSLT transform.
4.  Morphing the DOM via server-sent events.
5.  Combined with [progressive element enhancement](https://github.com/WICG/webcomponents/issues/1000) (custom attribute) libraries, such as [be-enhanced](https://github.com/bahrus/be-enhanced), that can also be attached "from a distance", we can build custom elements that can easily evolve over time with absolutely no framework lock-in.
6.  Apply repetitive, default settings across the board to all instances of certain (custom) elements.
7.  Merge data from different sources onto one target DOM fragment.
8.  Be able to turn a pure HTML stream into a web component without the need for a separate template being downloaded/imported.

XSLT can take pure XML with no formatting instructions as its input.  Generally speaking, the XML that XSLT acts on isn't a bunch of semantically  meaningless div tags, but rather a nice semantic document, whose intrinsic structure is enough to go on, in order to formulate a "transform" that doesn't feel like a hack.

In the past, this didn't seem workable with HTML.  But today, there is a growing (🎉) list of semantically meaningful native-born DOM Elements which developers can and should utilize, including dialog, datalist, details/summary, popup/tabs (🤞) etc. which can certainly help reduce divitis.

Even more dramatically, with the advent of imported, naturalized custom elements, the ratio between semantically meaningful tag names and divs/spans in the template markup will tend to grow much higher, looking more like XML of yore. trans-render's usefulness grows as a result of the increasingly semantic nature of the template markup.  

In addition, the introduction of the [aria- state and properties](https://developer.mozilla.org/en-US/docs/web/Accessibility/ARIA/Attributes) attributes for accessibility, "part" attributes for externally provided styling, as well as the re-emergence of [microdata attributes](https://github.com/WICG/webcomponents/issues/1013) as a standard that is here to stay, means that using a library like TR nudges us to "do the right thing" and adopt semantic approaches to our HTML, resulting in elegant approaches to binding.  

The bottom line is that like with XSLT, it will be quite rare for this style of development to feel limiting or "hackish".

This can leave the template markup quite pristine, but it does mean that the separation between the template and the binding instructions will tend to require looking in two places, rather than one.  And if the template document structure changes, separate adjustments may be needed to keep the binding rules in sync.  Much like how separate css style rules often need adjusting when the document structure changes.

All the examples described below can [be seen fully here](https://github.com/bahrus/trans-render/tree/baseline/demo)

# Table of Contents

[Binding from a distance](#binding-from-a-distance)

[Use cases for trans-rendering](#use-cases-for-tr)

1. [Part 1 - Mapping from props to elements](#part-1---mapping-from-props-to-elements)

   a. [Simplest element to prop mapping](#example-1a---simplest-element-to-prop-mapping)

2. [Part 2 - Binding using special attributes](#part-2---binding-using-special-standard-attributes)

   a. [Attribute to single prop shortcut with pass through derivation](#example-2a-shortcut-with-pass-through-derivation)

   b. [Attribute to single prop shortcut with value derived from host method](#example-2b-shortcut-but-deriving-value-from-method)

3. [Part 3 - Derived values in depth](#part-3---derived-values-in-depth)

   a.  [Declarative interpolation of multiple props](#example-3a-declarative-interpolation)  

   b.  [Declarative computed derivatives with multiple prop dependencies](#example-3b-declarative-computed-derivations)

   c.  [Inline computed derivatives with multiple prop dependencies](#example-3c-instant-gratification-for-computed-derivations)

4. [Part 4 - Setting multiple props of the matching element](#part-4-setting-props-of-the-element)

   a.  [Setting props from a distance](#example-4a---setting-props-from-a-distance)

   b.  [Example 4b - Observer and Setter Markers](#example-4b-observer--o-and-setter--s-markers)

   c.  [Example 4c - Interpolation with Observer and Setter Markers](#example-4c-interpolation-with-observer-and-setter-markers)

   d.  [Example 4d - Plucking single pairs](#example-4d-plucking-single-pairs)

5. [Part 5 - Event handling](#part-5---event-handling)

   a. [Adding a single event listener, handled by a method of the model](#example-5a---adding-a-single-event-listener-handled-by-the-model)

   b. [Shortcut for adding the most common event handler](#example-5b---adding-a-single-event-listener-the-most-standard-one)

   c. [Inline single event listener](#example-5c----instant-gratification-event-handlers)

   d. [Multiple event handlers for a single matching element](#example-5d----multiple-event-handlers)

6. [Part 6 - engaging with matching elements](#part-6---enhancing-or-hydrating-or-engaging-with-matching-elements)

   a.  [Example 6a - Single Engagement with a matching element](#example-6a---single-engagement)

   b.  [Example 6b - Shortcut for single engagement](#example-6b-enhancement--engagement--hydration-shortcut)

   c.  [Example 6c - Multiple engagements](#example-6c---multiple-enhancements)

7. [Conditional Logic](#example-7---conditional-logic)

   a. [Switch statement for string property](#example-7a---switch-statement-for-string-property)

   b. [Custom method for evaluating boolean condition](#example-7b---custom-method-to-check-boolean-condition)

8. [Part 8 Modifying the host or model](#modifying-the-host-or-model)

   a. [Incrementing a counter](#example-8a-incrementing-a-counter)

   b. [Elevating a value to the host or model](#example-8b-elevating-a-value-to-the-host-or-model)

   c. [Toggling a property from the host or model](#example-8c-toggling-a-property-from-the-host-or-model)

   d. [Multiple modifications](#example-8d-multiple-modifications)

   e. [Computed value](#example-8e---computed-value)

   f. [Hydrating with load event](#example-8f-hydrating-with-load-event)

   g. [Entrust a server rendered value to the host](#example-8g-entrusting-a-server-rendered-value-to-the-host)

9.  [Part 9 - Nested Objects => Nested Transforms](#part-9---nested-objects--nested-transforms)

   a. [Example 9a - itemscope, itemprop explicitly spelled out](#example-9a---itemscope-itemprop-explicitly-spelled-out)

10. [Part 10 - trans-render the web component](#part-10----trans-render-the-web-component)

## Part 1 - Mapping from props to elements

## Example 1 - The calculus of DOM updates

Suppose our HTML looks as follows:

```html
<div>
    <span></span>
</div>
```

We can bind to this DOM fragment as follows:

```TypeScript
interface Model{
    greeting: string;
}

const div = document.querySelector('div')!;
const model: Model = {
    greeting: 'hello'
};

Transform<Model>(div, model, {
    span: {
        o: ['greeting'],
        d: 0
    },
});
```

Explanation:

The critical transform definition is this snippet from above:

```JavaScript
{
    span: {
        o: ['greeting'],
        d: 0
    },
}
```

The "span" css-selector is saying "watch for any span tags within the observed fragment".

The "o" parameter is specifying the list of properties to **o**bserve from the model.  The order is important, as the rest of the transform manifest will frequently reference these observed properties via the index of this array.  

And in fact in this example the "d" parameter is saying "**d**erive the value we want to use to set the span's textContent property, from the value of the 0th observed property".  "0" is basically our "identity" derivation, and can actually be dropped, because it is the assumed default derivation.

The result is:

```html
<div>
    <span>hello</span>
</div>
```

We can see the dynamic, css sheet-like power of this library in action by adding some script at the end of the html document:

```JavaScript
//script #1
setTimeout(() => {
    const span = document.createElement('span');
    div.appendChild(span);
}, 1000);

```

So dynamically adding new HTML elements that match the css selector will immediately get bound.

As does updating the model by modifying observed property name(s), as shown below:

```JavaScript
//script #2
setTimeout(() => {
    model.greeting = 'bye';
}, 2000);
```

Under the hood, an event target is created that manages the synchronization (if not provided by the consumer, which can be passed as an additional parameter).

<details>
    <summary>Why use event targets?</summary>

Using an event target as our mechanism for providing our reactive interface in order to observe changes, as opposed to getters/setters of a class, seems like the most generic solution we can think of.  We will refer to this universal interface as the "propagator" for the model.

Any library that dynamically creates property getters and setters (for example libraries that use decorators) can easily provide this propagator.

Libraries that adopt less class-based approaches could also furnish such an interface.  The key is that the event target always emits an event matching the name of the property from the domain / view model as they change.

And thanks to the power of JavaScript, if a developer provides a plain old JavaScript class, it is quite easy, using reflection, to dynamically generate a propagator.

In fact this package provides some utility functions that [do just that](https://github.com/bahrus/trans-render/blob/baseline/lib/subscribe2.ts).

And creating a simple utility function, modeled after "signals", that wraps updating the model and the eventType instance is quite trivial.

It is also quite easy to create an ES Proxy that serves as a propagator.  This package also [provides this](https://github.com/bahrus/trans-render/blob/baseline/lib/PropertyBag.ts).

<!--Finally, the transformer class provides a utility method, "s" that allows for setting the value and dispatching the event in one line (think "setValue").-->

This way we can set model.greeting = 'bye', and the model will emit the event with matching name.  (There is possibly a slight performance hit with this approach, but it is unlikely to be the bottleneck for your application.)
</details>


## The 80% rule.

Is the syntax above the most readable thing you have ever seen?  Probably not.  This library is striving to balance a number of goals:  

1.  Minimizing unnecessary renders by being precise about what needs to be re-rendered, and when.
2.  Keeping repetitive syntax small.  Potentially, it could serve as a compile-time target to a more verbose, expressive syntax.  But even without such a verbose pre-compiled syntax, is it that bad? Like css, we believe the syntax can be "gotten used to", and we remember having a similar reaction when encountering some aspects of css for the first time.
3.  It should be JSON serializable as much as possible.

<!--

There are two directions we can go with that syntax:

1.  Make it more verbose
2.  Make it more succinct

### The more verbose direction  [TODO]

The verbose way has to do with the use of the short letters, which is good once the developer passes the learning curve for rapid development.

However, there are some environments where using more verbose syntax is better, maybe because it is used sparingly, so we want the syntax to be self explanatory. That is supported (referencing TransformVerbose.js rather than Transform.js):

```TypeScript
{
    span: {
        observedProps: ['greeting'],
        derivationFromObservedProps: int `${greeting}`
    },
}
```

###  The more succinct

-->

In fact, the syntax above is so likely to appear repeatedly, that we provide the following shortcut for it:

We can replace:

```TypeScript
const transform = new Transformer<Model>(div, model, {
    span: {
        o: ['greeting'],
        d: 0
    },
});
```

with the shortcut:

## Example 1a - Simplest element to prop mapping

```TypeScript
Transform<Model>(div, model, {
    span: 'greeting',
});
```

But it is important to know what the shortcut is for, just as in calculus it is important to know that y' is shorthand for dy/dx.

Throughout the rest of the document, we will refer to the css selector key (in this case "span") as the "LHS", and the stuff to the right of the colon as the "RHS" ('greeting') in this case.

The syntax above (Example 1a) should give anyone who works with css a warm and fuzzy feeling:  "span" is, after all, a valid css selector.  Unfortunately, prepare yourself. That warm and fuzzy feeling will quickly fade as we look closely at shortcuts that we will discuss below, designed to optimize on the 80% of anticipated use cases, use cases we will encounter repeatedly.  Whereas css doesn't require (or allow for that matter) quotes around the selector, JSON does, as does JS as soon as non alphanumeric characters get introduced.  An earlier attempt to avoid the quotes issue by encouraging camel-case to kebab conversions, while useful, no longer appears, after experimenting with that syntax for a few years, to be the most helpful syntactic sugar we can provide as far as reducing repetitive/verbose configuration.  

Instead, we encourage the use of some key, standard attributes, where the value of the attribute matches the (camelCased) name of the property it binds to.

We will very shortly be expounding on exactly what these conventions are.  But before diving into that discussion, I want to nip one concern in the bud.  If your reaction to what follows is thinking "but that will prevent me from using free form css to match my elements," fear not.

There is an "escape hatch" for free form css -- start the expression with "* ".  For example:

```TypeScript
Transform<IModel>(div, model, {
    '* div > p + p ~ span[class$="name"]': 'greeting',
});
```

## Part 2 - Binding using special, standard attributes

We often find ourselves defining in our HTML *input* tags (or other form-associated elements):

```html
<form>
    <input>
</form>
```

We often need to give the form element a name attribute, which then gets submitted to the server based on that name.  Often, to avoid confusing mappings between different systems, we want that name to match the name of the domain object property from which it derives (and probably also map to the same name of a domain object property on the server side as well).

Another scenario -- some server we have no control over generates HTML with some form elements, containing form elements with certain name attributes.  We want to add some pixie dust and hydrate the HTML with some client side logic, based on client side domain objects.  The most natural thing would be for the domain objects to define properties with names matching what the server generated HTML defines.

We want to keep the boilerplate at a minimum for this common scenario.

So if the developer follows this convention, the example below illustrates how we make the amount of boilerplate syntax as small as possible for binding from a distance to this form element.

So our HTML above may now look as follows, with the addition of the name attribute:

```html
<form>
    <input name=greeting>
</form>
```

... in conjunction with our model/domain object that contains a property with matching name *greeting*.  Then we can bind from a distance using this library as follows:

## Example 2a Shortcut with pass through derivation

```TypeScript
const model: Model = {
    greeting: 'hello'
};
Transform<Model>(form, model, {
    '@ greeting': 0,
});
```

... which results in:

```html
<form>
    <input name=greeting value=hello>
</form>
```

Note that the trans-render library only provides one-way binding support via a single "unit of work" binding (but more on that in a bit).

If using TypeScript, you will receive compile time errors if trying to bind to a non existent field/property, in case you were wondering.

The relationship between "@" and the name attribute is a bit weak, but here it is:  It looks like the second letter of the word "name", and also in github and many social media sites, to refer to a person "by name" the character that is typed, in order to get autocomplete suggestions of names, is the @ symbol.  

Why the space between @ and greeting?  The extra work necessary to type the space is there to make it clear that this is *not* a css selector, but a convenient shortcut that essentially maps to [name='greeting']

Going back to our calculus analogy, where the syntax above is equivalent to y', what does the equivalent dy/dx look like? The syntax above gets immediately "transpiled" to the following syntax (in memory, not literally), that is considerably clunkier to have to type over and over again (but does in fact accomplish the same exact thing):

```TypeScript
Transform<Model>(form, model, {
    '* [name="greeting"]': {
        o: ['greeting'],
        d: 0
    },
});
```

Another small timesaver:  As mentioned before, d: 0 is assumed if not specified above.  Also, if only one property needs to be observed, we can forgo the use of the array.

Other symbols for other attributes are specified below:

## Table of shortcut attribute symbols

```TypeScript
export type PropAttrQueryType = 
    | '|' //microdata itemprop
    | '@' //form element name
    | '#' //id
    | '%' //part
    | '.' //class
    | '$' //microdata itemscope + itemprop (nested)
    | '-o' //discussed in example 4b
    | '-s' //discussed in example 4b
```

We will see examples of these in use (especially in the Examples8*).


## Example 2b Shortcut, but deriving value from method

```TypeScript
const model: Props & Methods = {
    greeting: 'hello',
    appendWorld: ({greeting}: Props & Methods, transform: ITransformer<Props, Methods>, uow: UnitOfWork<Props, Methods>) => {
        console.log({transform, uow});
        return greeting + ', world';
    }
};

Transform<Props & Methods>(form, model, {
    '@ greeting': 'appendWorld',
});
```

## Example 2c  Imposing additional constraints on our matches

We mentioned earlier that we can do free form matching by beginning our LhS with the asterisk (*).  But as we are seeing in the preceding examples, we can reduce repetitive boilerplate by using some special selectors, assuming an attribute or class or part matches the name of one of our properties.  But what if we want to add some extra checks to make sure we don't bind to some other elements where the name of the attribute also matches our property?

We can sneak back in some free form css matching expressions by adding a "w" parameter, which stands for "where":

```Typescript
Transform<Model>(form, model, {
    '@ greeting': {
        w: '.isASalutation'
    },
});
```


## Part 3 - Derived values in depth

## Example 3a Declarative Interpolation

Suppose our domain object has two properties, and we need to dynamically combine them together in our UI:

Say our HTML fragment looks as follows:

```html
<div>
    <span></span>
</div>
```

... and the shape of our model looks as follows:

```TypeScript
interface Model{
    msg1: string;
    msg2: string;
}
```

We follow an approach that is as old as the sun in the programming world, similar to C#'s [String.Format](https://www.programiz.com/csharp-programming/library/string/format) function:

```C#
string strFormat = String.Format("{0} eats {1}", name, food);
```

But for us, we combine the two together as follows:

```TypeScript
const div = document.querySelector('div')!;
const model: Model = {
    msg1: 'hello',
    msg2: 'world'
};


Transform<Model>(div, model, {
    span: {
        o: ['msg1', 'msg2'],
        d: ['msg1: ', 0, ', msg2: ', 1]
    }
});
```

Once again, we don't claim this to be the most elegant syntax, and can certainly envision an "icing layer" that  translates a tagged template literal expression into this syntax, but that is outside the scope of this Transform function / Transformer class.  The syntax above is optimized for declarative, side-effect free, un-opinionated JSON parsing and small footprints over the wire, while still being somewhat maintainable by hand.

Anyway, we can again dynamically modify the fragment and/or domain object, and the transformer will keep everything in sync:

```TypeScript
setTimeout(() => {
    const span = document.createElement('span');
    div.appendChild(span);
}, 1000);
setTimeout(() => {
    model.msg1 = 'bye';
}, 2000);
```

In example 3b and 3c, we will see how we can write free form JavaScript to calculate our derivation, before coming back to the tight constraints of JSON-serializable declarative derivation.

## Example 3b Declarative, computed derivations

```TypeScript
const div = document.querySelector('div')!;
const model: Model = {
    msg1: 'hello',
    msg2: 'world',
    computeMessage: ({msg1, msg2}: Model, uow: UnitOfWorkCtx) => `msg1: ${msg1}, msg2: ${msg2}`
};


Transform<Model>(div, model, {
    span: {
        o: ['msg1', 'msg2'],
        d: 'computeMessage'
    }
});
```

## Example 3c: Instant gratification for computed derivations

In some cases, we may want our domain object to only have stable, proven, mature functionality.  Maybe it is shared by multiple components, even across projects.

But some new functionality, where the requirements may be in flux, comes up, so we would rather "experiment" with such functionality closer to the UI.  We can do that, as shown below:

```TypeScript
const div = document.querySelector('div')!;
const model: Model = {
    msg1: 'hello',
    msg2: 'world'
};


Transform<Model>(div, model, {
    span: {
        o: ['msg1', 'msg2'],
        d: ({msg1, msg2}: Model) => `msg1: ${msg1}, msg2: ${msg2}`
    }
});
```

### Example 3d:  JSON-serializable declarative advanced derivations

Let's now examine the declarative syntax that trans-render supports, "stretched to the limit" of what we think makes sense without inducing a gag reflex.  The advantage of supporting this is simply so we can "execute" such code more safely in more trusted scenarios, with less risk.  Another way of saying this: the moment we need to execute code with full access to the JavaScript run time engine, we need to "shift" gears in some way, and do so in a way that doesn't allow fo xss scripting attacks.

```TypeScript
const div = document.querySelector('div')!;
const myTemplate = document.createElement('template');
myTemplate.innerHTML = html `
<div>
    <span>Some Template Content</span>
</div>
`;
const model: Model = {
    myDate: new Date(),
    myTemplate
};


Transform<Model>(div, model, {
    span: {
        o: 'myDate',
        d: {
            path: 'getTime|.toPrecision|2'
        }
    },
    section: {
        o: 'myTemplate',
        d: {
            path: 'content.cloneNode|true',
        },
        invoke: 'appendChild'
    }
});
```

Think of the pipe delimiter as an open parenthesis that automatically closes before the next period (".") or at the end of the statement, thus allowing us to invoke a chain of methods (like querySelector).  It allows for one parameter to be passed in to the method. "invoke" means rather than setting a property to the derived value, pass the derived value to the specified method of the target (matching) element, "section" in this case.

## Part 4 Setting props / attributes / styles of the element

We glossed over a subtlety in our examples above.  Without specifying to do so, we are automatically setting the span's text content, the input's value, based on a single binding.  The property we are setting is assumed based on context.  In the case of the hyperlink (a), we set the href for example.  This decision is inspired by how [microdata works](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/itemprop#values).

But in many cases we need to specify exactly which property we want to set.  We do this using the "s" field value.

## Example 4a - Setting props from a distance:

```html
<div>
    <input>
</div>
```

```TypeScript
interface Model{
    msg1: string;
    rO: boolean;
    num: number;
    propName: string;
    color: string;
}

const div = document.querySelector('div')!;
const model: Model = {
    msg1: '123',
    rO: true,
    num: 7,
    propName: 'test'
};

Transform<Model>(div, model, {
    input: [
        {s: 'value', o: 'msg1'},
        {s: 'readOnly', o: 'rO'},
        {negTo: 'checked', o: 'r0'},
        {s: 'tabIndex', o: 'num'},
        {s: '.dataset.num', o: 'num'},
        {sa: 'itemprop', o: 'prop'},
        {ss: 'color', o: 'color' },
        {
            s: {
                type: 'number',
                disabled: true
            }
        }
    ]
});
```

This will set the input's readOnly property from the r0 field from the model.  Likewise, tabIndex is set from the num field, value from msg1.  "type" is "hardcoded" to "number", "disabled" initialized to "true".

Note the (discouraged) extra property: "sa" which means "set attribute" rather than setting the property.

"ss" is used for setting a style property.

[TODO]:  Support "append attribute" for things like class, part, output's for.

## Accommodating minimalist custom inline binding with observer and setter markers

At the top of this document, we suggested that with highly semantic HTML, there is often enough information contained in the semantic HTML that the need for additional inline binding instructions becomes superfluous when employing trans-rendering.  But sometimes that ideal may fall short, even if it will become less and less likely going forward.

In what follows, we suggest/provide for some semantic hints that we think can fill in such gaps most effectively, so that we can efficiently target elements we want to affect, without accidentally affecting others.

Let's say we want to set property aria-label from host property greeting, and we want to adopt a bit of the "locality of behavior" philosophy, and introduce a minimalist vocabulary of binding inline. We can do this via:

## Example 4b observer (-o) and setter (-s) markers

```html
<input -o=greeting -s=ariaLabel>

<div -o=msg1 -s=ariaDescription ></div>
```

Our goal is for our transform to be able to take this minimal binding, and "run with it", to be able to specify, when applicable, extra frills "from a distance" beyond the most obvious binding (setting ariaLabel to the value of the host/model's greeting property).  But here's the simplest, no frills binding that is required for the markup above to do anything:

```TypeScript
Transform<Model>(form, model, { 
    '-o greeting -s ariaLabel': 0,
    '-o msg1 -s ariaDescription': 0,
});
```


## Example 4c Interpolation with observer and setter markers

```html
<div -o="msg1 msg2" -s=textContent></div>
```

```Typescript
Transform<Model>(form, model, { 
    '-o msg1 -o msg2 -s textContent': {
        d: ['msg1: ', 0, 'msg2: ', 1]
    }
});
```

Another way of thinking about this -- we are gently moving some of the instructions out of the JSON, and into the HTML markup, but with contrived, proprietary attributes (-o and -s).  But going back to earlier examples, the -o, at least, can be "covered" by non-contrived attributes, the ones we listed in the [table above](#table-of-shortcut-attribute-symbols).

Our "o" array can make use of a mixture of all these symbols.  The order of the array is dictated by the order they appear in the LHS string:

```html
<div -o="msg1 msg2" part="msg3 msg4" class="msg5 msg6" itemprop="msg7 msg8" id=msg9 -s=textContent></div>
```

```Typescript
Transform<Model>(form, model, { 
    '-o msg1 % msg3 . msg5 | msg7 # msg9 -o msg2 % msg4 . msg6 | msg8 -s textContent': {
        d: ...
    }
});
```

"transpiles" to:

```Typescript
Transform<Model>(form, model, { 
    '-o msg1 % msg3 . msg5 | msg7 # msg9 -o msg2 % msg4 . msg6 | msg8 -s textContent': {
        o: ["msg1", "msg3", "msg5", "msg7", "msg9", "msg2", "msg4", "msg6", "msg8"],
        d: ...
    }
});
```

## Example 4d plucking single pairs

```html
<div role="checkbox" title=test -o="isVegetarian isHappy" -s="ariaChecked ariaDisabled"></div>
```

```Typescript
Transform<Model>(form, model, { 
    '-o isVegetarian -s ariaChecked': 0,
    '-o isHappy -s ariaDisabled': 0
});
```

## Example 4e Centralizing the hacking [TODO]

Many web sites are far, far away from providing any kind of semantic HTML, let's be honest.

Take the domain x.com. Please!

So the first thing we want to do is centralize the hackery, and plant seeds of semantic-ness and let the desert bloom.

To do that:

```TypeScript
Transform<Model>(div, model, {
    '* div > p + p ~ span[class~="css-1qaijid"]': {
        l: '|#@.% greeting'
    },
});
```

Here we are using the lower case L, which stands for "label", and it will, in this example, set itemprop, id, name, and add part and class "greeting" to that DOM element.  The first part of the string, before the space, is a list of special symbols we've been referencing repeatedly above, all of which are optional.  If none are provided, it would simply add attribute "greeting".

## Example 4f Supporting DRY [TODO]

Suppose we want to only define an attribute once, and allow the power of css to distribute that attribute elsewhere.

For example, how often have you seen something like this?:

```html
<label for=email>
<input type=email id=email name=email part=email class=email value={email}>
```

???

We can reduce this repetition (at the expense of delaying the point of time in which the HTML is semantic, which may be just fine during template instantiation):

```html
<label>
<input type=email name=email>
```

```TypeScript
Transform<Model>(form, model, {
    '@ greeting': {
        d: 0
        l: '#.% 0',
        ul: {
            us: 'label',
            s: 'for'
        }
    }
});
```

"ul" stands for "up label" and "us" stands for "up search."

This could be a pattern for multiple properties:

```html
<label>
<input name=name>
<label>
<input type=email name=email>
<label>
<input name=address>
```

```TypeScript
const standardUOW = {
    d: 0
    l: '#.% 0',
    ul: {
        us: 'label',
        s: 'for'
    }
};
const s = standardUOW;
Transform<Model>(form, model, {
    '@ name': {...s},
    '@ email': {...s},
    '@ address': {...s}
});
```

## Example 4g - sub property to custom element mapping [TODO]

How many times in typescript or c# or a host of other languages have you seen a class with sub properties that looks like:

```TypeScript
class MyCompositionalCustomElement extends HTMLElement{
    subObject: Partial<SubObject>
}

class SubObject extends HTMLElement{

}
```

Basically, the property/field matches the name of the interface/class that it is an instance of???

To support this:

```html
<div>
    <sub-object></sub-object>
</div>
```

```TypeScript
Transform<Model>(div, model, {
    '~ subObject': 0
});
```

What this does:

1.  Matches on sub-object element.
2.  Does Object.assign of subObject property applied to sub-object web component instance.
3.  Reactively redoes Object.assign when subObject property changes.
4.  Adds attribute itemscope, sets attribute itemprop=subObject if not already present.

## Part 5 - Event handling

## Example 5a - Adding a single event listener, handled by the model

```html
<form>
    <input>
    <span></span>
</form>
```

```TypeScript
interface Props {
    isHappy: boolean,
}
interface Actions {
    handleChange: (e: Event, transformer: ITransformer<Props, Actions>) => void;
}
const model: Props & Actions = {
    isHappy: false,
    handleChange: (e: Event, {model}) => {
        model.isHappy = !model.isHappy;
    }
}
const form = document.querySelector('form')!;


Transform<Props, Actions>(form, model, {
    input: {
        a: {
            on: 'change',
            do: 'handleChange'
        }
    },
    span: 'isHappy'
});
```

So now we use the letter "a", short for **a**ddEventListener, or "user inter**a**ctions".

## Example 5b - Adding a single event listener, the most standard one

There are some elements where the most common event we typically attach is pretty clear - for the button it is click, for the input element it is the input event.

So to make such scenarios simple, we adopt the following rules:

| Element     | Assumed event type |
|-------------|--------------------|
| input       | input              |
| slot        | slotchange         |
| all others  | click              |

So Example 5b is the same as 5a, but we can use the following to respond to input events:

```TypeScript
Transform<Props, Actions>(form, model, {
    input: {
        a: 'handleInput'
    },
    span: 'isHappy'
});
```

## Example 5c -- Instant gratification event handlers

As mentioned earlier:  In some cases, we may want our domain object to only have stable, proven, mature functionality.  Maybe it is shared by multiple components, even across projects.

But some new functionality, where the requirements may be in flux, comes up, so we would rather "experiment" with such functionality closer to the UI.  We can do that, as shown below:

```TypeScript
Transform<Props, Actions>(form, model, {
    input: {
        a: {
            on: 'change',
            do: (e: Event, {model}) => {
                model.isHappy = !model.isHappy;
            }
        }
    },
    span: 'isHappy'
});
```

## Example 5d -- Multiple Event Handlers

"a" can also be an array of event bindings:

```TypeScript
const model: Props & Actions = {
    isHappy: false,
    handleInput: (e: Event, {model}) => {
        model.isHappy = !model.isHappy;
    }
}
const form = document.querySelector('form')!;


Transform<Props, Actions>(form, model, {
    input: {
        a: [
            'handleInput', 
            {
                on: 'change',
                do: (e, {model}) => {
                    model.isHappy = !model.isHappy;
                }
            }
        ]
    },
    span: 'isHappy'
});
```


## Part 6 - Enhancing or Hydrating or Engaging with matching elements

What about conditionally loading blocks of HTML?  What about loops / repeating content?  

Traditionally, inline binding libraries have supported this, often as add-on's.  The amount of finessing and tailoring for these solutions makes them an art form.  

This library does provide obligatory support for [conditionally lazy loading](#example-7d-lazy-conditionally-loading--hiding-a-significant-chunk-of-html-from-a-template) and [loops](#example-9b-rudimentary-support-for-loops), but endorses seeking alternatives for specialized scenarios (virtualized rendering, paging, lazy loading, keyed support, resuming/suspending/hydrating server-rendered loops, etc).  The dependencies for the loop and conditional loading support in this package is only loaded on demand, so there is little to no harm done if you chose to forgo the rudimentary support in favor of alternative enhancements.

This library has been designed so that the various settings (a, e, i, o, s, etc) can be overridden for more powerful functionality, or extended to support additional functionality, perhaps keyed from new letters / words.  

But more importantly, as we will see below, the Transform function / Transformer class provides a clean way of hooking up DOM elements to [custom enhancements](https://github.com/WICG/webcomponents/issues/1000), that can certainly include support for conditional loading and repeating DOM structures.  For such enhancements to work well with this library, they need to provide a formal api for getting "attached" to the element, not dependent on an inline attribute (which would be clunky, frankly).  

So *trans-render* views the best value-add as being able to specify, during initialization / hydration, a method that can be called, and where we can specify values to pass into that method.  This makes the trans-render extremely loosely coupled / un-opinionated. Or more declaratively, it provides the ability to attach an infinite variety of enhancements.  Think of this as our plug-in, or "hook" mechanism. 

So what follows below, examples 6*, extends example 4 above (just to give a bird's eye view of how this would look in context).

What has been added is the "e" section, which kind of vaguely stands for "engagement/enhancement attaching" callbacks.

Other things we can do in addition to enhancing the matched elements:

1.  Add a (weak) reference to the element(s)
2.  Add a custom event listener, if [the declarative way isn't sufficient](#example-5a---adding-a-single-event-listener-handled-by-the-model).
3.  Other hydration activities.
4.  Replace the element with some other content.

> [!Note]
> The e object has three different optional methods than can be specified:  "do", "undo" and "forget".  "do" is invoked when the matching element is encountered.  Undo is when a previously matching element no longer matches.  Forget is when a previously matching element becomes disconnected.  

### Example 6a - Single engagement

```TypeScript

interface Props{
    msg1: string;
    rO: boolean;
    num: number;
    propName: string;
}

interface Methods{
    hydrateInputElement:(m:Props & Methods, el: Element, ctx: EngagementCtx<Props>) => void;
}

const div = document.querySelector('div')!;
const model: Props & Methods = {
    msg1: '123',
    rO: true,
    num: 7,
    propName: 'test',
    hydrateInputElement:(model: Props & Methods, el: Element, ctx: EngagementCtx<Props>) => {
        console.log({model, el, ctx});
    },
    cleanupInputElement: (model: Props & Methods, el: Element, ctx: EngagementCtx<Props>) => {
        console.log({model, el, ctx});
    }
};


Transform<Props, Methods>(div, model, {
    input: [
        {o: 'msg1', s: 'value'},
        {o: 'rO',   s: 'readOnly'},
        {o: 'num',  s: 'tabIndex'},
        {o: 'num',  s: '.dataset.num'},
        {o: 'prop', sa: 'itemprop'},
        {
            s: {
                type: 'number',
                disabled: true
            } as Partial<HTMLInputElement>,
            e: {
                do: 'hydrateInputElement',
                forget: 'cleanupInputElement',
                with: {
                    beCommitted: true
                }
            }
        }
    ]
});
```

The method hydrateInputElement gets called once and only once per input element that gets added or found in the DOM fragment.

### Example 6b Enhancement / Engagement / Hydration shortcut

If you only need to "do" something, not "undo" or "forget about it", and you don't need to pass in any "with" parameters, just specify the method:

```TypeScript
{
    e: 'hydrateInputElement'
}
```



### Example 6c - Multiple enhancements 

We can also specify an array of engagements:

```TypeScript
{
    e: [
        {
            do: 'hydrateInputElement',
            forget: 'cleanupInputElement',
            be: 'committed',
            with: {
                to: 'change'
            }
        },
        'enhanceInputElement',
        {
            do: 'registerInputElement',
            forget: 'cleanupInputElement',
            with: 'some attribute value'
        }
    ]
}
```

### Example 6d - beEnhanced enhancements, part 1

*trans-render* plays favorites with [be-enhanced](https://github.com/bahrus/be-enhanced) enhancements, for obvious reasons. 

This package supports such enhancements in two related ways, and both can be employed at the same time for the same enhancement:

1.  We can set beEnhanced enhancement property values from our model:

```TypeScript
Transform<Model>(div, model, {
    input: {s: '+beSearching.for', o: 'searchText'},
});
```

The key is the beginning of the string ('+').  "+" feels like we are "supplementing/enhancing" the built in element (or third party custom element).

This automatically causes the beSearching enhancement to become attached (assuming some other process imports the JS reference, or we use "dep" to do so, as described below).

2.  We can attach be-enhanced enhancements (during engagement, one time only, constant values, no updates when the model changes)


### Example 6e - beEnhanced enhancements, part 2

```TypeScript
Transform<Model>(div, model, {
    input: 
        {
            s: '+beSearching.for', 
            o: 'searchText',
            e: {
                be: 'searching',
                dep: () => import('be-searching/be-searching.js'),
                waitForResolved: true
            }
        },
        
    
});
```

Due to the way everything works, the s: property will automatically attach the beSearching enhancement anyway.  But the e: setting allows for setting static properties once, if applicable, including the dependency wherein the enhancement is defined.

[TODO]  Do only if a strong use case:  Infer engagement based on the name of the method.  For example, suppose the model looks like:

```TypeScript
const model = {
    [html `<my-element></my-element>`]: (model: Props & Methods, el: Element, ctx: EngagementCtx<Props>) => {
        console.log({model, el, ctx});
    }
}
```

Then the transform would infer the engagement for all tags of the form:

```html
<my-element></my-element>
```

Could be used for defining "virtual, JSX-like" tags in the template markup, for things like loops, conditionals, etc.

## Example 7 - Conditional Logic

### Prelude

Much conditional display logic can be accomplished via css -- set various attributes (e.g. via property dataset) to string values as described above (Example 4), pulling in values from the host, then allow css to interpret those attributes in such a way as to accomplish the conditional display we are after.

But sometimes this isn't sufficient.  Sometimes the values of the attributes (or properties) themselves need to be conditional.  

One approach to accomplishing this is by adding a "computed property" to the host element that calculates what the value of the attribute should be, with the full power of JavaScript at our disposal.  But this solution may not be sufficient when we *have* no host class to begin with (e.g. declarative custom elements).  And it may also be argued that even if we do, these types of computed properties are too tied to the UI.

### On to business

For conditional statements, we use the letter "i" for "if".  It supports various different types of RHS's, in order to ramp up to more complex scenarios.

### Example 7a - Switch statement for string property:

```html
<form>
    <input>
</form>
```

```TypeScript
const model = {
    typeToEdit: 'boolean'
}
Transform<Props, Methods>(form, model, {
    input: [
        {o: 'typeToEdit', i: 'boolean', s: {type: 'checkbox', hidden: false}},
        {o: 'typeToEdit', i: 'number',  s: {type: 'number', hidden: false}},
        {o: 'typeToEdit', i: 'object',  s: {hidden: true}}
    ]
});
```

Why not burden the developer with adding the extra letter, f, so that it says if?  Isn't that more readable?

The thinking is by adding that letter so it says "if", it might give the impression it is expecting/able to handle a JavaScript expression, so better to err on the side of "hinting" rather than giving a false impression by encouraging people to read more into it than is actually there.

### Example 7b - Custom method to check boolean condition

```html
<form>
    <input>
</form>
```

```TypeScript
interface Props {
    typeToEditIsLimited: true,
}
interface Methods{
    isRange: (p: Props) => boolean,
    isUnlimited: (p: Props) => boolean,
}
const model: Props & Methods = {
    typeToEditIsLimited: true,
    isRange: ({typeToEditIsLimited}) => typeToEditIsLimited,
    isUnlimited: ({typeToEditIsLimited}) => !typeToEditIsLimited,
}
const form = document.querySelector('form')!;


Transform<Props, Methods>(form, model, {
    input: [
        {
            o: 'typeToEditIsLimited', 
            i: {d: 'isRange'},
            s: {type: 'range'}
        },
        {
            o: 'typeToEditIsLimited', 
            i: {d: 'isUnlimited'},
            s: {type: 'number'}
        },
    ]
});
```

### Example 7c:  Instant gratification

```html
<form>
    <input>
</form>
```

```TypeScript
const model = {
    typeToEditIsLimited: true,
};
Transform<Props, Methods>(form, model, {
    input: [
        {
            o: 'typeToEditIsLimited', 
            i: {d: ({typeToEditIsLimited}) => typeToEditIsLimited},
            s: {type: 'range'}
        },
        {
            o: 'typeToEditIsLimited', 
            i: {d: ({typeToEditIsLimited}) => !typeToEditIsLimited},
            s: {type: 'number'}
        },
    ]
});
```

### Example 7d:  Lazy (conditionally) loading / hiding a significant chunk of HTML from a template

In some scenarios, the cost of loading the HTML into memory (including binding instructions), before it is actually viewable and/or useful to the end user, may lead to the conclusion that it would be better to load the HTML from an inert template on demand.

This library provides support for this, by "overloading" the act of setting the hidden property of the template.

So for example:

```html
<div>
    <template>
        <heavy-lifting-boolean-editor></heavy-lifting-boolean-editor>
        <div>hello</div>
    </template>
</div>
```

```Typescript
const model = {
    typeToEdit: 'boolean'
}
Transform<Props, Methods>(form, model, {
    template: [
        {o: 'typeToEdit', i: 'boolean', s: {hidden: false}},
        {o: 'typeToEdit', i: 'number',  s: {hidden: true}},
        {o: 'typeToEdit', i: 'object',  s: {hidden: true}}
    ]
});
```

This library will not take the instruction literally -- it will **not** set the template's hidden property, which wouldn't do anything perceptible to the user.

Instead, it will instantiate the template when .hidden is "set" (virtually) to false, and then hide the instantiated children when/if .hidden is "set" to true.

This is one of many possible ways we can load content lazily.  For other approaches, consider using or creating a custom enhancement, and attaching said enhancement, that precisely matches your needs.  This package's support for lazy/conditional loading is only imported on demand, so no harm done.

### Optimizing Example 7d

At the beginning of this document, one of the key goals that has been set out for trans-render is that we can reuse the streamed HTML, not only as our first instance of the web component, but we can take a snapshot of the HTML, turn it into a template, and that template can serve as the mold for all other instances of the web component, either already present on the page, or that we anticipate will be lazy loaded later.

But in the example above, imagine that the HTML that we streamed from the server had a template contained inside, used for lazy loading content, as shown above.  Tests reveal that it is faster to move that template out, and reference it, so that with each web component instance, we aren't repetitively cloning the template contained within.

This song and dance is performed not by this core package, but by some other packages, that build on trans-rendering -- namely, [xtal-element](https://github.com/bahrus/xtal-element) and [blow-dry](https://github.com/bahrus/blow-dry).  This is all done "behind the scenes", so nothing we said above would stop working.  But to opt-in to this performance optimization, you need to "take the red pill" by simply setting attribute "blow-dry":

```html
<div>
    <template blow-dry>
        <heavy-lifting-boolean-editor></heavy-lifting-boolean-editor>
        <div>hello</div>
    </template>
</div>
```

data-blow-dry also works.

Of course, no harm done if this template isn't used in the context described above, so I recommend doing it in case it is used in that context.

## Modifying the host or model

To support our holy quest for doing as much as possible declaratively, we provide for some ways of **m**odifying the host without requiring writing code in an event handler, to account for a significant number of use cases.

### Example 8a Incrementing a counter

```html
<div>
    <button part=down data-d=-1>-</button><span part=count></span><button part=up data-d=1>+</button>
</div>
```

```TypeScript
const model = {
    count: 30
};
Transform<Props, Methods>(div, model, {
    button: {
        m:{
            on: 'click',
            inc: 'count',
            byAmt: '.dataset.d'
        }
    },
    '% count': 0
});
```

This modifies the count value of the host, incrementing by -1 if clicking the left button, by +1 if clicking on the right button.

> [!Note]
> Notice that we are using the same letter, "s" in two very different ways in this library.  In [example 4](#example-4-setting-props-of-the-element) above, we saw "s" being used outside the "m" object.  In that case, we are setting properties of the target (html) element that was matched by the css match.  *Now* we are seeing "s" being used inside the modify/mutate (m) object, which is specifically modifying the host props.  It is important to keep an alert eye on the context in which "s" is being used, in other words.

### Example 8b  Elevating a value to the host or model

```html
<div>
    <button data-val=pizza>Value 1</button>
    <button data-val=salad>Value 2</button>
    <span itemprop=selectedItem></span>
</div>
```

```TypeScript
const model = {
    selectedItem: 'sandwich'
}
Transform<Props, Methods>(div, model, {
    button: {
        m:{
            on: 'click',
            s: 'selectedItem',
            toValFrom: '.dataset.val'
        }
    },
    '| selectedItem': 0
});
```

### Example 8c Toggling a property from the host or model

```html
<div>
    <button>Toggle Value</button>
    <span id=booleanValue></span>
</div>
```

```TypeScript
const model = {
    booleanValue: false
}
Transform<Props, Methods>(div, model, {
    button: {
        m:{
            on: 'click',
            toggle: 'booleanValue'
        }
    },
    '# booleanValue': 0
});
```

### Example 8d Multiple modifications

```html
<form>
    <input>
    <span id=stringValue></span>
    <span class=booleanValue></span>
</form>
```

```TypeScript
const model: Props & Methods = {
    booleanValue: false,
    stringValue: ''
}
const form = document.querySelector('form')!;

Transform<Props, Methods>(form, model, {
    input: {
        m:[
            {
                on: 'focus',
                toggle: 'booleanValue'
            },
            {
                on: 'input',
                s: 'stringValue',
                toValFrom: 'value'
            }
        ]
            
    },
    '. booleanValue': 0,
    '# stringValue': 0,
});
```

[TODO] Support shortcuts (assume value of on based on context allow for string value that makes lots of assumptions, etc.)  Only do this if a good use case presents itself.  Support "tvf" abbreviation for toValFrom if it comes up repeatedly in some use cases.


### Example 8e - Computed value

The "toValFrom" parameter can be a function:

```TypeScript
toValFrom: (matchingElement, transformer, modUOW) =>  (matchingElement as HTMLInputElement).value.length.toString()
``` 

## Example 8f Hydrating with "load" event

A special pseudo event name -- "load" -- is reserved for setting host properties one time only based on server rendered HTML.  It is expected that once the "ownership" of the value is passed from the server rendered HTML to the host model, other binding instructions will continue to keep them in sync via one-way binding down from the host/model to the UI.

```html
<div itemscope>
    <span>hello</span>
    <label itemprop=greeting></label>
</div>
```

```Typescript
interface Props {
    greeting: string,
}
interface Methods{
    
}
const model: Props & Methods = {
    greeting: ''
}

const div = document.querySelector('div')!;


Transform<Props, Methods>(div, model, {
    span: {
        m:{
            on: 'load',
            s: 'greeting',
            toValFrom: 'textContent'
        }
    },
    "| greeting": 0
});
```

Each such "unit of work" modification only gets executed once, no matter how many matches (span in this case) there are.

## Example 8g Entrusting a server rendered value to the host

A common pattern seems likely to emerge with server-rendered web components:  

The server streams some web components as already rendered HTML, and that HTML contains some pertinent information that the web component host needs to know about.  Once that "transfer" of data takes hold, the element that contains the information "yields" the ownership to the host, and the host will pass updates back down to the element.  It's kind of like two-way binding, only one direction only lasts for the initialization of the component.

```html
<div itemscope>
    <span itemprop=greeting>hello</span>
</div>
```

```Typescript
interface Props {
    greeting: string,
}
interface Methods{
    
}
const model: Props & Methods = {
    greeting: ''
}

const div = document.querySelector('div')!;


Transform<Props, Methods>(div, model, {
    "| greeting": {
        y: 0
    },
});
```

y stands for "yield".

So what this does is the model's greeting value is initialized to "hello" based on the content of the span.  No more data flow in that direction will occur (from the HTML span tag to the host).  Only changes to the model's greeting field will propagate down to the span going forward.


## Part 9 - Nested Objects => Nested Transforms

Up until now, the only way we can bind an HTML element to nested sub properties has been via a derived method, either inline in the transform expression, or via a method of the host model. And even that solution isn't very effective -- modifications made directly to the sub property, done without replacing the full top level property, won't be picked up by the binding. 

For true nested binding, we leverage the microdata itemscope attribute, combined with the itemprop attribute on the same element

## Example 9a - itemscope, itemprop explicitly spelled out.

```html
<div>
    <div itemscope itemprop=address>
        <span itemprop=zipCode></span>
    </div>
</div>
```

```Typescript
const div = document.querySelector('div')!;
const model: Props & Methods = {
    name: 'Bob',
    address: {
        zipCode: '12345'
    }
};

Transform<Props & Methods>(div, model, {
    '$ address': {
        '| zipCode': 0
    } as XForm<AddressProps, AddressMethods>,
});

setTimeout(() => {
    model.address.zipCode = '54321';
}, 2000);
```

This results in the span being kept in sync with model.address.zipCode.

## Part 9 3/4 Parameterized matches [TODO]


## Example 9 3/4 part a - bulk distribution of the model values [TODO]

Say there's lots of elements matching a pattern:

```html
<div itemscope>
    <div itemprop=prop1></div>
    <div itemprop=prop2></div>
    <div itemprop=prop3></div>
    ...
    <div itemprop=prop17></div>
</div>
```

Writing one match per property would be quite redundant.  So we can use a parameterized match, similar to Examples 4*:

```TypeScript
Transform<Props & Methods>(div, model, {
    '| prop:idx': {
        forIdxInRange: [1, 17]
    },
});
```

## Example 9b Rudimentary support for loops

```html
<div>
    <table itemscope itemprop=list>
        <template blow-dry>
            <tr itemscope itemprop=itemListElement itemtype=https://schema.org/ListItem>
                <td itemprop=myProp></td>
            </tr>
        </template>
    </table>
</div>
```

```TypeScript
interface ListItem{
    myProp: string,
}

interface Props{
    list: Array<ListItem>
}

interface Methods{

}

type Model = Props & Methods;

const model: Model = {
    list: [
        {
            myProp: 'row 1'
        },
        {
            myProp: 'row 2'
        }
    ]
};

const div = document.querySelector('div')!;

Transform<Props, Methods>(div, model, {
    '$ list': {
        f:{
            xform:{
                '| myProp': 0
            }
        }
    }
});

setTimeout(() => {
    console.log('update model');
    const list = [...model.list];
    list.push({
        myProp: 'row 3'
    });
    model.list = list;
    
}, 2000);

```

"f" stands for "foreach".

Note that all the attributes of the template and tr elements are optional. (The purpose of the blow-dry attribute was discussed earlier.)


## Part 10 - Updating the model

We've seen examples where we update individual properties/fields of the model, using standard JS field assignments.  But what if we make a back-end call, and retrieve another model, where most of the data is different?

The Transform function returns a class that provides a method for this purpose:

## Example 10a

```Typescript
const model: Model = {
    greeting: 'hello'
};

const tr = await Transform<Model>(div, model, {
    span: 'greeting',
});

setTimeout(async () => {
    await tr.updateModel({
        greeting: 'bye'
    })
}, 2000);
```

## Part 10 -- trans-render the web component

One concern about using TR as we've seen so far, is that the js needs to be separated from the html, which can be more challenging from a developer point of view, especially if it is in a separate file (but no more so than css, fwiw).  It raises concerns about violating "Locality of Behavior" principles.  At least with the style tag, we can intersperse the style tag within the HTML (except for web components that may not perform well).

True, one could also intersperse the HTML with script tags, but there is a certain amount of ceremony in setting the Transformer function up, plus module scripts don't have a good way of being self-aware, as far the DOM.  And it isn't exactly declarative.

Another concern is that lumping the entire transform together doesn't scale well, as the rules grow in complexity.  Breaking up the transform and evaluating them as the HTML streams in seems like a better approach where it makes sense.  The same argument as for inlining style tags into a document.


So the trans-render web component tag provides the equivalent of the style tag.

Use of this tag makes most sense as **a substitute** for [be-hive](https://github.com/bahrus/be-hive).

In this development philosophy, be-hive is best for progressive enhancement of (non repeating) HTML, including within Shadow scopes. But if we let server streamed HTML be used as the basis of a repeating web component, avoiding the use of be-hive altogether, and exclusively using this web component, appears to me to be the better option.

## Option 1 -- pure declarative json inline source

```html
<trans-render xform='{
    "input": {
        ...
    }
}'></trans-render>
```

## Option 2 -- eval (within realm, in the future), inline source

```html
<trans-render onload=doEval xform="{
    input: {

    }
}"></trans-render>
```

## Option 3 -- pure declarative json via external source

```html
<trans-render src=https://example.com/transform.json></trans-render>
```

## Option 4 -- eval (within realm, in the future), external source

```html
<trans-render onload=doEval src=https://example.com/transform.js></trans-render>
```

For now this uses fetch, until all browsers support [JSON modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#browser_compatibility)

This would allow for inline JS expressions, as we've provided examples for above.  Of course, without TypeScript support [for now](https://github.com/tc39/proposal-type-annotations).

The default "scope" for each instance of the tag is the parent element (but other options can be specified via the scope attribute/property).  If no parent element is found, then it defaults to the the Shadow Root.

The default "model" is the web component "host", but we can also specify a (relative) scope indicator, so that the source of the model can come from a peer element inside the Shadow Root.  

We can also specify a sub property path of the host element to bind to. [Untested]

What [blow-dry](https://github.com/bahrus/blow-dry) does is:  [TODO]

1.  Pulls out all instances of trans-render web components, leaving behind unique markers for the DOM scopes, as well as any peer elements that serve as the model, if applicable.  Ignore some trans-render tags based on an agreed upon attribute (once?)
2.  Forms an "uber" set of transforms in memory, applied to each instance of the web component.

But now how do we define web components using be-definitive?  One of the trans-render tags would have the be-definitive config contained within.

## Viewing Your Element Locally

Any web server that can serve static files will do, but...

1.  Install git.
2.  Fork/clone this repo.
3.  Install node.js.
4.  Open command window to folder where you cloned this repo.
5.  > npm install
6.  > npm run serve
7.  Open http://localhost:3030/demo/ in a modern browser.

## Running Tests

```
> npm run test
```

## Using from ESM Module:

```JavaScript
import {Transform} frm 'trans-render/Transform.js';
```

## Using from CDN:

```html
<script type=module crossorigin=anonymous>
    import {Transform} from 'https://esm.run/trans-render';
</script>
```







 

