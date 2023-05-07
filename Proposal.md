A good [percentage](https://w3techs.com/technologies/details/da-microdata#:~:text=Microdata%20is%20used%20by,24.2%25%20of%20all%20the%20websites) of websites use [microdata](http://html5doctor.com/microdata/) .

I think nudging developers to make use this feature by making it super-easy, when working with template instantiation, would have beneficial impact for the web and society in general.

<details>
    <summary>My (hidden) agenda</summary>
    [TODO]
</details>

The specific syntax of this proposal is not meant to be read as a particular endorsement of any particular syntax (i.e. handlebar vs moustache), and is up in the air, as far as I know, so please interpret the examples "non-literally".

Because there's a performance cost to adding microdata to the output, it should be something that can be opt-in (or opt-out).

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
<div>Hello <meta itemprop=name/>Bob<meta content>, the event will begin at <meta itemprop=eventDate itemtype=date content=2011-11-18T14:54:39.929Z>11/18/2011</div>
```

