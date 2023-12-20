# trans-render

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/trans-render)
[![NPM version](https://badge.fury.io/js/trans-render.png)](http://badge.fury.io/js/trans-render)
[![Playwright Tests](https://github.com/bahrus/trans-render/actions/workflows/CI.yml/badge.svg?branch=baseline)](https://github.com/bahrus/trans-render/actions/workflows/CI.yml)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/trans-render?style=for-the-badge)](https://bundlephobia.com/result?p=trans-render)
<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/trans-render?compression=gzip">

## Binding from a distance

*trans-rendering* (TR) provides a methodical way of "binding from a distance" -- updating DOM fragments without the need for custom inline binding instructions.  It originally drew inspiration from the (least) popular features of XSLT, and more significantly, CSS.  Like those syntaxes, *TR* performs transforms on elements by matching tests on those elements.  *TR* uses css selector tests on elements via the element.matches() and element.querySelectorAll() methods.  Unlike XSLT/CSS, though, the transform is defined with JavaScript, adhering to JSON-like declarative constraints as much as possible.

*TR* rests on:

1.  A JavaScript object -- the model.
2.  A DOM fragment to update / enhance.
3.  A user defined "Fragment Manifest" where the binding rules are defined, mostly declaratively.
4.  Optionally, an EventTarget that emits events when properties of the model change.

*TR* is designed to provide an alternative to the proposed [Template Instantiation proposal](https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Template-Instantiation.md), the idea being that TR could continue to supplement what that proposal includes if/when template instantiation support lands in browsers.

To achieve the css-like ability to respond to new elements being dynamically added / removed, TR builds on top of the MountObserver api [proposal](https://github.com/WICG/webcomponents/issues/896) / [polyfill](https://github.com/bahrus/mount-observer). 

## Use cases for TR

1.  Hydrating / adjusting server-rendered content.
2.  Hydrating / adjusting (third party) HTML retrieved via fetch.
3.  Hydrating / adjusting (third party) HTML output from an XSLT transform.
4.  Combined with [progressive element enhancement](https://github.com/WICG/webcomponents/issues/1000) (custom attribute) libraries, such as [be-enhanced](https://github.com/bahrus/be-enhanced), that can also be attached "from a distance", we can build custom elements that can easily evolve over time with absolutely no framework lock-in.

XSLT can take pure XML with no formatting instructions as its input.  Generally speaking, the XML that XSLT acts on isn't a bunch of semantically  meaningless div tags, but rather a nice semantic document, whose intrinsic structure is enough to go on, in order to formulate a "transform" that doesn't feel like a hack.

There is a growing (🎉) list of semantically meaningful native-born DOM Elements which developers can and should utilize, including dialog, datalist, details/summary, popup/tabs (🤞) etc. which can certainly help reduce divitis.

But even more dramatically, with the advent of imported, naturalized custom elements, the ratio between semantically meaningful tag names and divs/spans in the template markup will tend to grow much higher, looking more like XML of yore. trans-render's usefulness grows as a result of the increasingly semantic nature of the template markup.  

In addition, the introduction of the aria- attributes for accessibility, "part" attributes for styling, as well as the re-emergence of [microdata attributes](https://github.com/WICG/webcomponents/issues/1013) as a standard that is here to stay, means that using a library like TR nudges us to "do the right thing" and adopt semantic approaches to our HTML, resulting in elegant approaches to binding, and it will be quite rare for this style of development to feel limiting or "hackish".

This can leave the template markup quite pristine, but it does mean that the separation between the template and the binding instructions will tend to require looking in two places, rather than one.  And if the template document structure changes, separate adjustments may be needed to keep the binding rules in sync.  Much like how separate css style rules often need adjusting when the document structure changes.

## Example 1

Suppose our HTML looks as follows:

```html
<div>
    <span></span>
</div>
```

We can bind to this DOM fragment as follows:

```TypeScript
interface IModel{
    greeting: string;
}

const div = document.querySelector('div')!;
const model: IModel = {
    greeting: 'hello'
};
const et = new EventTarget();

const transform = new Transformer<IModel>(div, model, {
    span: {
        o: ['greeting'],
        u: 0
    },
}, et);
```

Explanation:

The critical transform definition is this snippet from above:

```JavaScript
{
    span: {
        o: ['greeting'],
        u: 0
    },
}
```

The "span" css-selector is saying watch for any span tags within the observed fragment.

The "o" parameter is specifying the list of properties to **o**bserve from the model.  The order is important, as the rest of the transform mapping will frequently reference these observed properties via the index of this array.  

And in fact in this example the "u" parameter is saying "update the span from the value of the 0th observed property".

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

//script #2
setTimeout(() => {
    model.greeting = 'bye';
    et.dispatchEvent(new Event('greeting'));
}, 2000);
```

So dynamically adding new HTML elements that match the css selector will immediately get bound, as does dispatching events matching the property names.  Using an event target as our mechanism [TODO] continuing pontificating on this.

## The 80% rule.

Is the syntax above the most readable thing you have ever seen?  Probably not.  This library is striving to balance a number of concerns:  

1.  Minimizing unnecessary renders by being precise about what needs to be re-rendered, when, and
2.  Keeping repetitive syntax small.  Potentially, it could serve as a compile-time target to a more verbose, expressive syntax.  But like css, we believe the syntax can be "gotten used to", and we remember having a similar reaction when encountering css for the first time.
3.  It should be JSON serializable as much as possible.

In fact, the syntax above is so likely to appear repeatedly, that we provide the following shortcut for it:

We can replace:

```TypeScript
const transform = new Transformer<IModel>(div, model, {
    span: {
        o: ['greeting'],
        u: 0
    },
}, et);
```

with the shortcut:

## Example 1a

```TypeScript
Transform<IModel>(div, model, {
    span: 'greeting',
}, et);
```

But it is important to know what the shortcut is for, just as in calculus it is important to know that y' is shorthand for dy/dx.

Throughout the rest of the document, we will refer to the css selector key (in this case "span") as the "LHS", and the stuff to the right of the colon as the "RHS" ('greeting') in this case.

The syntax above should give anyone who works with css a warm and fuzzy feeling:  "span" is, after all, a valid css selector.  However, that warm and fuzzy feeling will quickly fade as we look closely at shortcuts that we will discuss below, designed to optimize on the 80% of anticipated use cases, use cases we will encounter repeatedly.  Whereas css doesn't require (or allow for that matter) quotes around the selector, JSON does, as does JS as soon as non alphanumeric characters get introduced.  An earlier attempt to avoid the quotes issue by encouraging camel-case to kebab conversions, while useful, no longer appears, after experimenting with that syntax for a few years, to be the most helpful syntactic sugar we can provide as far as reducing repetitive/verbose configuration.  

Instead, we encourage the use of some key, standard attributes, where the value of the attribute matches the(camel-cased) name of the property it binds to.

We will very shortly be expounding on exactly what these conventions are.  But don't worry, if you are thinking "but that will prevent me from using free form css to match my elements."

There is an "escape hatch" for free form css -- start the expression with "* ":

```TypeScript
Transform<IModel>(div, model, {
    '* div > p + p ~ span[class$="name"]': 'greeting',
}, et);
```

## Example 2 -- binding using the name attribute [TODO]

We often find ourselves defining in our HTML input (or other form-associated) elements, where it is reasonable and less taxing to avoid confusing mapping, and make the name of the form element match the name of the property from the domain object / model from which it derives and/or updates.  So if the developer follows this convention, the example below illustrates how we make the amount of boilerplate syntax as small as possible.

So say our HTML looks as follows:

```html
    <form>
        <input name=greeting>
    </form>
```

And say our model/domain object contains a property with matching name *greeting*.  Then we can bind from a distance using TR as follows:

```TypeScript
Transform<IModel>(form, model, {
    '@ greeting': 0,
}, et);
```

The relationship between "@" and the name attribute is a bit weak but here it is:  It looks like the second letter of the word "name", and also in github and many social media sites, to refer to a person "by name" the character that is typed is the @ symbol.  

Why the space between @ and greeting?  The extra work necessary to type the space is there to make it clear that this is *not* a css selector, but a convenient shortcut that essentially maps to [name='greeting']

Going back to our calculus analogy, where the syntax above is equivalent to y', the syntax above gets immediately "transpiled" to the following syntax:

```TypeScript
new Transformer<IModel>(form, model, {
    '* [name="greeting"]': {
        o: ['greeting'],
        u: 0
    },
}, et);
```

which does the same exact thing.
