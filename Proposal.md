# Template Instantiation Support for Microdata

A good [percentage](https://w3techs.com/technologies/details/da-microdata#:~:text=Microdata%20is%20used%20by,24.2%25%20of%20all%20the%20websites) of websites use [microdata](http://html5doctor.com/microdata/).  It is still lagging behind some competitors.  

## Historical backdrop

Given the age of the second link above, it is natural to ask the question, why did it take so long for anyone to raise the possibility of integrating template binding with microdata?  Or is there some fatal flaw in even trying?  I was ready to attribute this to a massive market failure on the part of the web development community, including myself, but the explanation isn't that simple, thankfully.

What I've learned is that for years, the microdata initiative was in a kind of simmering battle with another proposal, RDFa, as far as which one would be embraced as the standard.

The microdata proposal suffered a significant setback in the early 2010's, and only in the late 2010's did it experience a comeback, and it seems safe now to conclude that microdata has won out, permanently.  Some sites haven't [been properly updated](https://caniuse.com/sr_microdata) to reflect that fact, which can partly explain why this comeback seems to have slipped under the development community's radar.

## Nudging developers

I think nudging developers to make use of this [standard](https://html.spec.whatwg.org/multipage/#toc-microdata) by making it super easy, when working with template instantiation, would have a beneficial impact for the web and society in general.

## Benefits

At a more mundane level, it could have significant performance benefits. It could allow applications to hydrate without the need for passing down the data separately, and significantly reduce the amount of custom boilerplate in the hydrating code. 

The biggest cost associated with supporting microdata, is whether *updates* to the HTML should include updates to hidden meta tags.  Not updating them would have no effect on hydrating, but *might* have an impact on search results / indexing.

With the help of the meta tag and microdata attributes, we can [extract](https://html.spec.whatwg.org/multipage/microdata.html#converting-html-to-other-formats) "water from rock", passing the data used by the server to generate the HTML output within attributes of the HTML output, consistent with what the client would generate via the template and applied to the same data.  **The hydration could happen real time as the html streams in**.

## Caveats

The specific syntax of this proposal is just my view of the best way of representing integration with microdata, and is not meant to imply any "final decision", as if I'm in a position to do so.  I'm not yet an expert on the microdata standard, so it is possible that some of what I suggests contradict some fine point specified somewhere in the standard.  But I do hope others find this helpful.

Because there's a tiny performance cost to adding microdata to the output, it should perhaps be something that can be opt-in (or opt-out).  If having microdata contained in the output proves to be so beneficial to the ability of specifying parts and working with streaming declarative shadow DOM, that it makes sense to always integrate with microdata, in my view the performance penalty is worth it, and would do much more good than harm (the harm seems negligible).

## Highlights

This proposal consists of several, somewhat loosely coupled sub-proposals:

1.  Allow the meta tag to be left unperturbed in most all HTML, including the table element between rows, and inside a select tag (just as we can do with the template element).
2.  Until 1 is fulfilled, use the template element as a stand-in for the meta tag as a last resort (table row groupings, select tags, maybe others).
3.  Specify some decisions for how microdata would be emitted in certain scenarios.
4.  Add the minimal required schemas to schema.org so that everything is legitimate and above board.
5.  Resurrect the Metadata API. 

So basically, for starters, unless this proposal is required for the handshake between server generated HTML and the client template instantiation to work properly, we would need to specify a setting when invoking the Template Instantiation API:  **integrateWithMicrodata**.

## Simple Object Example

What this would do:

Let's say our (custom element) host object looks like:

```JavaScript
const host = {
    name: 'Bob'
    eventDate: new Date(),
    secondsSinceBirth: 1_166_832_000,
    isVegetarian: true,
    address: {
        street: '123 Penny Lane',
        zipCode: 12345
    }
}
```

There are two fundamental scenarios to consider:

1.  If the author specifies the itemtype for the itemscope surrounding the html element where the binding takes place.
2.  No such schema is provided.

In what follows, we consider the latter scenario, so that emitting the type is critical for us to be able to hydrate the data accurately.

### Binding to simple primitive values, and simple, non repeating objects with non semantic tags

Let us apply the template to the host object defined above:

```html
<template>
    <span>{{name}}</span>
    <span>{{eventDate}}</span>
    <span>{{secondsSinceBirth}}</span>
    <span>{{isVegetarian}}</span>
    <span>{{address}}</span>
    <div itemscope itemprop=address>
        <span>{{street}}</span>
    <div>
    <span>{{address.street}}</span>
</template>
```

then with the integrateWithMicrodata setting enabled it would generate (with US as the locale):

```html
<span itemprop=name>Bob</span>
<span itemprop=eventDate itemtype=https://schema.org/DateTime>5/11/2023</span>
<span itemprop=secondsSinceBirth itemtype=https://schema.org/Number>1,166,832,000</span>
<span itemprop=isVegetarian itemtype=https://schema.org/Boolean>true</span>
<span><meta itemprop=address itemtype=https://schema.org/Thing content='{"street": "123 Penny Lane", "zipCode": 12345}'></span>
<div itemscope itemprop=address>
    <span itemprop=street>123 Penny Lane</span>
</div>
<span itemscope itemprop=address><meta itemprop=street content>123 Penny Lane</span>
```

The last

I think we could save bandwidth if we suppress "itemtype" if the value is a string.

The rules for what we are doing are summarized below:

|Type     |Url                         |Content value        |Visible content
|---------|----------------------------|---------------------|----------------
|Number   |https://schema.org/Number   |num.toString()       |num.toLocaleString()
|Date     |https://schema.org/DateTime |date.toISOString()   |date.toLocaleDateString()
|Boolean  |https://schema.org/Boolean  |bln.toString()       |true/false
|Object   |https://schema.org/Thing    |JSON.stringify(obj)  |Whatever the browser uses to display JSON when opening a JSON file/url in the browser, (or none)

All these primitive types are [officially recognized](https://schema.org/DataType) by schema.org, with the possible exception of the last one.  If the usage above for the last one is considered incorrect (which, honestly, I think it is), I would suggest https://schema.org/DataType/SchemalessObject be added to schema.org.  It is a controversial move, as now we are almost encouraging sites to send information not viewable by the user, which is inefficient (especially when updating initial values sent down from the server), could lead to yet more gaming of page rankings.  However, it would speed up development, in my opinion.  I'm leaning towards dropping that one. 

Not that with the nested object, the div is actually using microdata bindings in conjunction with moustache syntax.  I initially was using the phrase "emitMicrodata" to describe what this proposal is all about.  But that example, if it is supported, is doing more than emitting.  So assuming that example holds, the correct phrase should be integrateWithMicrodata.


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

Option 2 may be the lesser appealing one, to me at least.  But until there are more HTML tags to represent things like numbers, booleans, we have little choice, it seems to me, but to go with option 2.  Should HTML tags be introduced for numbers, booleans, objects, this could become a future configuration setting, "semanticTagMapping" or something like that, which would allow the developer to specify which tag to use for which object type.


My tentative recommendation:  Use option 2.  

For now, this question is the very last thing we should be fretting about.  It is so little effort for the developer to opt to replace the moustache binding with the time tag, that we should leave this decision to the developer, and just use option 2 for simplicity.

Data elements that resolve to null or undefined would not emit anything in an interpolation.


## Loops

The scenarios get a bit complicated here.  What follows assumes that the developer wants to be able to "reverse engineer" the output, and be able to guarantee they can distinguish between content that came from a loop, vs. content that came from a single sub property.  In what follows, I assume the tougher case.  If no such requirements exist, the developer can drop specifying the itemtype.

For loops that repeat a single element (with light children), the developer needs to add an itemtype with two url's, each of which is supposed to point to a schema (but the w3c police will probably overlook invalid url's).  The template instantiation engine would emit the itemscope attribute, and split the two itemtypes, the first one landing in the parent's itemtype, leaving one in the element that represents each item of the loop.  Easier to explain by examples:

```html
<template>
    <ul>
        <li repeat="{{item of items}}" itemtype="https://mywebsite/mySchemaType.TODO.json of https://mywebsite/mySchemaType.TODOList.json">
            <div>
                {{item.}}
            </div>
        </li>
    </ul>
</template>
```

would generate:

```html
<ul itemscope itemtype=https://mywebsite/mySchemaType.TODOList.json>
    <li itemscope itemprop=items itemtype="https://mywebsite/mySchemaType.TODO.json">
        <div itemprop=task>Brush teeth</div>
    </li>
    <li itemscope itemprop=items itemtype="https://mywebsite/mySchemaType.TODO.json">
        <div itemprop=message>Comb hair</div>
    </li>
</ul>
```

~~So basically, an element with one or more itemtypes but not an itemprop is assumed to be an "array" possessor.~~

Of course, developers would be encouraged to search first for an existing schema before creating their own (or pretending to do so).  If the developer pretends to do so, I suspect the platform won't be able to provide much if any help as far as hydrating, if/when it resurrects the Metadata API. 



If the loop has two or more elements, use the meta tag to group them in the output:

```html
<template>
<dl>
    <template repeat="{{item of items}}" itemtype="https://mywebsite/mySchemaType.TODO.json of https://mywebsite/mySchemaType.TODOList.json">
        <dt>{{item.word}}</dt>
        <dd>{{item.meaning}}</dd>
    </template>
</dl>
</template>
```

would generate:

```html
<dl itemscope itemtype=https://mywebsite/mySchemaType.TODOList.json >
    <meta itemscope itemprop=items  itemtype=https://mywebsite/mySchemaType.TODO.json>
    <dt itemprop=word>Beast of Bodmin</dt>
    <dd itemprop=meaning>A large feline inhabiting Bodmin Moor.</dd>

    <meta itemscope itemprop=items  itemtype=https://mywebsite/mySchemaType.TODO.json>
    <dt itemprop=word>Morgawr</dt>
    <dd itemprop=meaning>A sea serpent.</dd>

    <meta itemscope itemprop=items  itemtype=https://mywebsite/mySchemaType.TODO.json>
    <dt itemprop=word>Owlman</dt>
    <dd itemprop=meaning>A giant owl-like creature.</dd>
</dl>
```

Unfortunately, this will not work (for now) with table elements.  

This proposal includes an urgent call to make the meta tag "stick" within a table, like the template element does.  

But for now, this will have to do:

```html
<template>
    <table>
        <tbody>
            <template repeat="{{item of items}}" itemtype="https://mywebsite/mySchemaType.TODO.json of https://mywebsite/mySchemaType.TODOList.json">
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
    <tbody itemscope itemtype=https://mywebsite/mySchemaType.TODOList.json>
        <template itemscope itemprop=items itemtype=https://mywebsite/mySchemaType.TODO.json></template>
        <tr class=odd>
            <td itemprop=to>Foo</td>
            <td itemprop=from>Bar</td>
        </tr>
        <tr class=even>
            <td itemprop=subject>Baz</td>
            <td itemprop=message>Qux</td>
        </tr>
        
        <template itemscope itemprop=items itemtype=https://mywebsite/mySchemaType.TODO.json></template>
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





