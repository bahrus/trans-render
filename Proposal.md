# Template Instantiation Support for Microdata

A good [percentage](https://w3techs.com/technologies/details/da-microdata#:~:text=Microdata%20is%20used%20by,24.2%25%20of%20all%20the%20websites) of websites use [microdata](http://html5doctor.com/microdata/).

I think nudging developers to make use of this feature by making it super easy, when working with template instantiation, would have beneficial impact for the web and society in general.

At a more mundane level, it could have significant performance benefits, in that it could allow applications to hydrate without the need for an additional requirement on the payload for passing down the data that was used on the server to generate the HTML output that is consistent with what the Template Instantiation would produce on the client with the same data.

The specific syntax of this proposal is not meant to be read as a particular endorsement of any particular syntax (i.e. handlebar vs moustache vs xslt), and is up in the air, as far as I know, so please interpret the examples "non-literally".

Because there's a performance cost to adding microdata to the output, it should be something that can be opt-in (or opt-out), unless having microdata contained in the output proves to be beneficial anyway.

This proposal consists of several, somewhat loosely coupled sub-proposals:

1.  Allow the meta tag to be left unperturbed in most all HTML.
2.  Until 1 is fulfilled, use the template element as a stand-in for the meta tag.
3.  Standardize on some url's for intrinsic JavaScript types as far as use of the itemtype attribute.

But basically, for starters, there would be an option we could specify when invoking the Template Instantiation API:  emitMicrodata.

What this would do:

Let's say our (custom element) host object looks like:

```JavaScript
const host = {
    name: 'Bob'
    eventDate: new Date()
}
```

And we apply it to the template:

```html
<template>
    <span>{{name}}</span>
</template>
```

then with the emitMicrodata setting it would generate:

```html
<span itemprop=name>Bob</span>
```

## Formatting

If template instantiation supports formatting:

```html
<template>
    <time>{{eventDate.toLocaleDate|ar-EG, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }}}</time>
<template>
```

it would generate:

```html
    <time itemprop=eventDate datetime=2011-11-18T14:54:39.929Z>11/18/2011</time>
```

Now let's talk about the dreaded interpolation scenario.

```html
<template>
    <div>Hello {{name}}, the event will begin at {{eventDate}}</div>
</template>
```

Template instantiation would generate:

```html
<div>Hello <meta itemprop=name/>Bob<meta content>, the event will begin at <time itemprop=eventDate datetime=2011-11-18T14:54:39.929Z>11/18/2011</div>
```

