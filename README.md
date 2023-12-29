# trans-render [WIP]

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

XSLT can take pure XML with no formatting instructions as its input.  Generally speaking, the XML that XSLT acts on isn't a bunch of semantically  meaningless div tags, but rather a nice semantic document, whose intrinsic structure is enough to go on, in order to formulate a "transform" that doesn't feel like a hack.

In the past, this didn't seem workable with HTML.  But today, there is a growing (🎉) list of semantically meaningful native-born DOM Elements which developers can and should utilize, including dialog, datalist, details/summary, popup/tabs (🤞) etc. which can certainly help reduce divitis.

Even more dramatically, with the advent of imported, naturalized custom elements, the ratio between semantically meaningful tag names and divs/spans in the template markup will tend to grow much higher, looking more like XML of yore. trans-render's usefulness grows as a result of the increasingly semantic nature of the template markup.  

In addition, the introduction of the [aria- state and properties](https://developer.mozilla.org/en-US/docs/web/Accessibility/ARIA/Attributes) attributes for accessibility, "part" attributes for externally provided styling, as well as the re-emergence of [microdata attributes](https://github.com/WICG/webcomponents/issues/1013) as a standard that is here to stay, means that using a library like TR nudges us to "do the right thing" and adopt semantic approaches to our HTML, resulting in elegant approaches to binding.  

The bottom line is that like with XSLT, it will be quite rare for this style of development to feel limiting or "hackish".

This can leave the template markup quite pristine, but it does mean that the separation between the template and the binding instructions will tend to require looking in two places, rather than one.  And if the template document structure changes, separate adjustments may be needed to keep the binding rules in sync.  Much like how separate css style rules often need adjusting when the document structure changes.

All the examples described below can [be seen fully here](https://github.com/bahrus/trans-render/tree/baseline/demo/transforms)

# Table of Contents

[Binding from a distance](#binding-from-a-distance)

[Use cases for trans-rendering](#use-cases-for-tr)

[Part 1 - Mapping from props to elements](#part-1---mapping-from-props-to-elements)

[Simplest element to prop mapping](#example-1a---simplest-element-to-prop-mapping)

[Part 2 - Binding using special attributes](#part-2-binding-using-special-standard-attributes)

[Attribute to single prop shortcut with pass through derivation](#example-2a-shortcut-with-pass-through-derivation)

[Attribute to single prop shortcut with value derived from host method](#example-2b-shortcut-but-deriving-value-from-method)

[Declarative interpolation of multiple props](#example-3a-declarative-interpolation)

[Declarative computed derivatives with multiple prop dependencies](#example-3b-declarative-computed-derivations)

[Inline computed derivatives with multiple prop dependencies](#example-3c-instant-gratification-for-computed-derivations)

[Setting multiple props of the matching element](#example-4-setting-props-of-the-element)

[Adding a single event listener, handled by a method of the model](#example-5a---adding-a-single-event-listener-handled-by-the-model)

[Shortcut for adding the most common event handler](#example-5b----adding-a-singe-event-listener-the-most-standard-one)

[Inline single event listener](#example-5c----instant-gratification-event-handlers)

[Multiple event handlers for a single matching element](#example-5d----multiple-event-handlers)

[Engaging with an element](#example-6a---single-engagement)

7. [Conditional Logic](#example-7---conditional-logic)

   1. [Switch statement for string property](#example-7a---switch-statement-for-string-property)

   2. [Custom method for evaluating boolean condition](#example-7b---custom-method-to-check-boolean-condition)

[Modifying the host](#modifying-the-host)

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

And in fact in this example the "d" parameter is saying "**d**erive the span's textContent property from the value of the 0th observed property".  "0" is basically our "identity" derivation, and can actually be dropped, because it is the assumed default derivation.

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

Instead, we encourage the use of some key, standard attributes, where the value of the attribute matches the(camel-cased) name of the property it binds to.

We will very shortly be expounding on exactly what these conventions are.  But before diving into that discussion, I want to nip one concern in the bud.  If your reaction to what follows is thinking "but that will prevent me from using free form css to match my elements," fear not.

There is an "escape hatch" for free form css -- start the expression with "* ".  For example:

```TypeScript
Transform<IModel>(div, model, {
    '* div > p + p ~ span[class$="name"]': 'greeting',
});
```

## Part 2 Binding using special, standard attributes

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

Note that the trans-render library only provides one-way binding support (but more on that in a bit).

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

(Another small timesaver:  As mentioned before, d: 0 is assumed if not specified above.  Also, if only one property needs to be observed, we can forgo the use of the array)

Other symbols for other attributes are specified below:

```TypeScript
export type PropAttrQueryType = 
    | '|' //microdata itemprop
    | '@' //form element name
    | '#' //id
    | '%' //part
    | '.' //class
    | '-' //marker
    | '$' //microdata itemscope + itemprop (nested)
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

## Example 3a  Declarative Interpolation

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

## Example 3b Declarative, computed derivations

```TypeScript
const div = document.querySelector('div')!;
const model: Model = {
    msg1: 'hello',
    msg2: 'world'
    computeMessage: ({msg1, msg2}: Model, uow: UnitOfWorkCtx) => {
        return `msg1: ${msg1}, msg2: ${msg2}`
    }
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
        d: ({msg1, msg2}: Model, uow: UnitOfWorkCtx) => `msg1: ${msg1}, msg2: ${msg2}`
    }
});
```

## Example 4  Setting props of the element

We glossed over a subtlety in our examples above.  Without specifying to do so, we are automatically setting the span's text content, the input's value, based on a single binding.  The property we are setting is assumed based on context.  In the case of the hyperlink (a), we set the href for example.  This decision is inspired by how [microdata works](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/itemprop#values).

But in many cases we need to specify exactly which property we want to set.  We do this using the "s" field value.

For example:

```TypeScript
interface Model{
    msg1: string;
    rO: boolean;
    num: number;
    propName: string;
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
        {o: 'msg1', s: 'value'},
        {o: 'rO',   s: 'readOnly'},
        {o: 'num',  s: 'tabIndex'},
        {o: 'num',  s: '.dataset.num'},
        {o: 'prop', sa: 'itemprop'},
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
    handleChange: (e: Event, {model, propagator}) => {
        model.isHappy = !model.isHappy;
        propagator?.dispatchEvent(new Event('isHappy'));
        
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

## Example 5b -- Adding a singe event listener, the most standard one

There some elements where the most common event we attach is pretty clear - for the button it is click, for the input element is it the input event.

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
            do: (e: Event, {model, propagator}) => {
                model.isHappy = !model.isHappy;
                propagator?.dispatchEvent(new Event('isHappy'));
                
            }
        }
    },
    span: 'isHappy'
});
```

## Example 5d -- Multiple Event Handlers

"a" can also be an array:

```TypeScript
const model: Props & Actions = {
    isHappy: false,
    handleInput: (e: Event, {model, propagator}) => {
        model.isHappy = !model.isHappy;
        propagator?.dispatchEvent(new Event('isHappy'));
    }
}
const form = document.querySelector('form')!;


Transform<Props, Actions>(form, model, {
    input: {
        a: ['handleInput', {
            on: 'change',
            do: (e, {model, propagator}) => {
                model.isHappy = !model.isHappy;
                propagator?.dispatchEvent(new Event('isHappy'));
            }
        }]
    },
    span: 'isHappy'
});
```


## Enhancing / Hydrating /  Engaging with matching elements

What about conditionally loading blocks of HTML?  What about loops / repeating content?  

Traditionally, inline binding libraries have supported this, often as add-on's.  The amount of finessing and tailoring for these solutions makes them an art form.  This library is choosing (for now) to steer away from diving into that thicket.

However, this library has been designed so that the various settings (a, e, i, o, s, etc) can be overridden for more powerful functionality, or extended to support additional functionality, perhaps keyed from new letters / words.  

But more importantly, the Transform function / Transformer class provides a clean way of hooking up DOM elements to [custom enhancements](https://github.com/WICG/webcomponents/issues/1000), that can certainly include support for conditional loading and repeating DOM structures.  For such enhancement to work well with this library, they need to provide a formal api for getting "attached" to the element, not dependent on an inline attribute (which would be clunky, frankly).  

So *trans-render* views the best value-add as being able to specify, during initialization / hydration, a method that can be called, and where we can specify values to pass into that method.  This makes the trans-render extremely loosely coupled / un-opinionated.  

So what follows below, examples 6*, extends example 4 above (just to give a bird's eye view of how this would look in context).

What has been added is the "e" section, which kind of vaguely stands for "engagement" callbacks.

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
                forget: 'cleanupInputElement'
                with: {
                    beCommitted: true
                }
            }
        }
    ]
});
```

The method hydrateInputElement gets called once and only once per input element that gets added or found in the DOM fragment.  It is also called when the input elements are are disconnected from the DOM fragment (with a different argument):

The MethodInvocationCallback interface can be seen [here](https://github.com/bahrus/trans-render/blob/baseline/types.d.ts).

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
            be: 'counted',
            with: 'some attribute value'
        }
    ]
}
```

[TODO]  Do only if a strong use case:  Infer engagement based on the name of the method.  For example, suppose the model looks ike:

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

For conditional statements, we use the letter "i" for if.  It supports various different types of RHS's, in order to ramp up to more complex scenarios.

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

### Example 7b  - Custom method to check boolean condition

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

## Modifying the host

To support our holy quest for doing as much as possible declaratively, we provide for some ways of modifying the host without requiring writing code in an event handler, to account for a significant number of use cases.

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

### Example 8b  Elevating a value to the host

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
    '$ selectedItem': 0
});
```

### Example 8c Toggling a host property

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

### Example 8f - Invoking a method [TODO]

If we want to call a method from the model, passing in the matching element, we can specify with the "invoke" property of the m object.

If we want to 

## Example 8h Hydrating with "load" event

A special event name -- "load" -- is reserved for setting host properties one time only based on server rendered HTML.  It is expected that once the "ownership" of the value is passed from the server rendered HTML to the host model, other binding instructions will continue to keep them in sync via one-way binding down from the host/model to the UI.

## Part 9.  Nested Objects => Nested Transforms

```html
<div itemscope itemprop=subObj>
    <span itemprop=subProp1></span>
</div>
```

```Typescript
{
    $ subObj: [
        {propagator: {path: '.xtalState', props: ['subProp1']}},
        {
            '| subProp1': 0
        }
    ]
}
```

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







 

