# Template Instantiation Support for Microdata

A good [percentage](https://w3techs.com/technologies/details/da-microdata#:~:text=Microdata%20is%20used%20by,24.2%25%20of%20all%20the%20websites) of websites use [microdata](http://html5doctor.com/microdata/).

I think nudging developers to make use of this feature by making it super easy, when working with template instantiation, would have beneficial impact for the web and society in general.

At a more mundane level, it could have significant performance benefits. It could allow applications to hydrate without the need for passing down the data separately. With the help of meta tags, we can extract "water from rock", passing the data used by the server to generate the HTML output within attributes of the HTML output, consistent with what the client would generate via the template and applied to the same data.  

The specific syntax of this proposal is not meant to be read as a particular endorsement of any particular schema (i.e. handlebar vs moustache vs xslt), and is up in the air, as far as I know, so please interpret the examples "non-literally".

Because there's a performance cost to adding microdata to the output, it should be something that can be opt-in (or opt-out), unless having microdata contained in the output proves to be so beneficial to the ability of specifying parts, that it makes sense to always emit the microdata.

This proposal consists of several, somewhat loosely coupled sub-proposals:

1.  Allow the meta tag to be left unperturbed in most all HTML, including the table element between rows, and inside a select tag (just as we can do with the template element).
2.  Until 1 is fulfilled, use the template element as a stand-in for the meta tag as a last resort (table row groupings, select tags, maybe others).
3.  Specify some decisions for how microdata would be emitted in certain scenarios.

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


Option 1:

```html
<div>Hello <meta itemprop=name>Bob<meta content>, the event will begin at <time itemprop=eventDate datetime=2011-11-18T14:54:39.929Z>11/18/2011</time></div>
```

Option 2:

```html
<div>Hello <meta itemprop=name>Bob<meta content>, the event will begin at <meta itemprop=eventDate itemtype=https://schema.org/DateTime content=2011-11-18T14:54:39.929Z>11/18/2011</time></div>
```

Option 2 may be a bit controversial, but, until there are more HTML tags to represent things like numbers, booleans, we have little choice, it seems to me:

|Type     |Url                         |Content value   
|---------|----------------------------|-------------
|Number   |https://schema.org/Number   |num.toString()
|Date     |https://schema.org/DateTime |date.toISOString()
|Boolean  |https://schema.org/Boolean  |bn.toString()
|Object   |https://schema.org/Thing    |JSON.stringify(obj)

Data elements that resolve to null or undefined would not emit anything in an interpolation.

## Loops

Loops that repeat a single element (with light children), we can simply add attribute itemscope to each top level parent:

```html
<template>
    <ul>
        <li repeat="{{item of items}}">
            <div>
                {{item.message}}
            </div>
        </li>
    </ul>
</template>
```

would generate:

```html
<ul>
    <li itemscope itemprop=items>
        <div itemprop=message>Message 1</div>
    </li>
    <li itemscope itemprop=items>
        <div itemprop=message>Message 2</div>
    </li>
</ul>
```

If the loop has two or more elements, use the meta tag to group them in the output:

```html
<template>
<dl>
    <template repeat="{{item of items}}">
        <dt>{{item.word}}</dt>
        <dd>{{item.meaning}}</dd>
    </template>
</dl>
</template>
```

would generate:

```html
<dl>
    <meta itemscope itemprop=items>
    <dt itemprop=word>Beast of Bodmin</dt>
    <dd itemprop=meaning>A large feline inhabiting Bodmin Moor.</dd>

    <meta itemscope itemprop=items>
    <dt itemprop=word>Morgawr</dt>
    <dd itemprop=meaning>A sea serpent.</dd>

    <meta itemscope itemprop=items>
    <dt itemprop=word>Owlman</dt>
    <dd itemprop=meaning>A giant owl-like creature.</dd>
</dl>
```

Unfortunately, this will not work (for now) with table elements.  

This proposal includes an urgent call to make the meta tag "stick" within a table.  

But for now, this will have to do:

```html
<template>
    <table>
        <tbody>
            <template repeat="{{item of items}}">
                <tr class=odd>
                    <td>{{item.to}}</td>
                    <td>{{item.from}}</td>
                </tr>
                <tr class=even>
                    <td>{{item.subject}}</td>
                    <td>{{item.message}}</td>
                </tr>
            <template>
        </tbody>
    </table>
</template>
```

would generate:

```html
<table>
    <tbody>
        <template itemscope itemprop=items></template>
        <tr class=odd>
            <td itemprop=to>Foo</td>
            <td itemprop=from>Bar</td>
        </tr>
        <tr class=even>
            <td itemprop=subject>Baz</td>
            <td itemprop=message>Qux</td>
        </tr>
        
        <template itemscope itemprop=items></template>
        <tr class=odd>
            <td itemprop=to>Quux</td>
            <td itemprop=from>Quuz</td>
        </tr>
        <tr class=even>
            <td itemprop=subject>Corge</td>
            <td itemprop=message>Grault</td>
        </tr>
    </tbody>
</table>
```





