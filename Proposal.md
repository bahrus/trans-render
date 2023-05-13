# Template Instantiation Support for Microdata

A good [percentage](https://w3techs.com/technologies/details/da-microdata#:~:text=Microdata%20is%20used%20by,24.2%25%20of%20all%20the%20websites) of websites use [microdata](http://html5doctor.com/microdata/).  It is still lagging behind some competitors which aren't of the whatwg standard, however.  Let's try to fix that!  

## Historical backdrop

Given the age of the second link above, it is natural to ask the question, why did it take so long for anyone to raise the possibility of integrating template binding with microdata?  Or is there some fatal flaw in even trying?  I was ready to attribute this to a massive market failure on the part of the web development community, including myself, but I don't think the explanation is that simple, thankfully.

What I've learned is that for years, the microdata initiative was in a kind of simmering battle with another proposal, RDFa, as far as which one would be embraced as the one true standard.

The microdata proposal suffered a significant setback in the early 2010's, and only in the late 2010's did it experience a comeback, and it seems safe now to conclude that microdata has won out, permanently, in terms of built-in integration with the browser.  Some sites haven't [been properly updated](https://caniuse.com/sr_microdata) to reflect that fact, which can partly explain why this comeback seems to have slipped under the development community's radar.

## Nudging developers

I think nudging developers to make use of this [standard](https://html.spec.whatwg.org/multipage/#toc-microdata) by making it super easy and reliable, when working with template instantiation, would have a beneficial impact for the web and society in general.  As we will see, we want to ensure that all bindings are in sync, by avoiding the need to repeat ourselves.  Since what the search engine sees is so difficult to determine (hydration would catch most issues though), I think it's important to build in that reliability, hence the extra complexity I'm requesting to ensure that we get that reliability.

## Benefits

At a more mundane level, it could have significant performance benefits. It could allow applications to hydrate without the need for passing down the data separately, and significantly reduce the amount of custom boilerplate in the hydrating code. 

With the help of the meta tag and microdata attributes, we can [extract](https://html.spec.whatwg.org/multipage/microdata.html#converting-html-to-other-formats) "water from rock", passing the data used by the server to generate the HTML output within attributes of the HTML output, consistent with what the client would generate via the template and applied to the same data.  **The hydration could happen real time as the html streams in**.

## Caveats

The biggest cost associated with supporting microdata, is whether *updates* to the HTML should include updates to hidden meta tags.  Not updating them would have no effect on hydrating, or what the user sees, but might, I suspect, have an impact on limiting search result accuracy and indexing.

The specific syntax of this proposal is just my view of the best way of representing integration with microdata, and is not meant to imply any "final decision", as if I'm in a position to do so.  I'm not yet an expert on the microdata standard, so it is possible that some of what I suggest below contradicts some fine point specified somewhere in the standard.  But I do hope others find this helpful, especially if it triggers a competing proposal that tries to "get it right".

Because there's a tiny performance cost to adding microdata to the output, it should perhaps be something that can be opt-in (or opt-out).  But if having microdata contained in the output proves to be so beneficial to the ability of specifying parts and working with streaming declarative shadow DOM, that it makes sense to always integrate with microdata, in my view the performance penalty is worth it, and would do much more good than harm (the harm seems negligible).


## Highlights

This proposal consists of several, somewhat loosely coupled sub-proposals:

1.  Specify some decisions for how microdata would be emitted in certain scenarios.
2.  Add the minimal required schemas, if any, to schema.org so that everything is legitimate and above board.
3.  Provide a built-in function that can [convert](https://html.spec.whatwg.org/multipage/microdata.html#json) microdata encoded HTML to JSON.  However, **the specs for this conversion seem to indicate that the JSON output would be far more verbose than what an application using template instantiation would want**, as it seems to convert to a schema-like representation of the object.  An application would want to be able to reconstruct the simple, exact object structure that was used to generate the output in conjunction with the template bindings.  So one more function would be needed to collapse this generic object representation into a simple POJO, which is easy enough to build in userland.
4.  Add [semantic tags](https://github.com/whatwg/html/issues/8693) for booleans, schema-less objects.  "meter" is a nice tag, but maybe a simpler one is also needed for plain old numbers.

So basically, for starters, unless this proposal is *required* for the handshake between server generated HTML and the client template instantiation to work properly, we would need to specify an option when invoking the Template Instantiation API:  **integrateWithMicrodata**.

## Simple Object Example

Let's say our (custom element) host object looks like:

```JavaScript
const host = {
    name: 'Bob',
    eventDate: new Date(),
    secondsSinceBirth: 1_166_832_000,
    isVegetarian: true,
    address: {
        street: '123 Penny Lane',
        zipCode: '12345',
        gpsCoordinates: {
            latitude: 35.77804334830908,
            longitude: -78.64528572271688
        }

    }
}
```

There are two fundamental scenarios to consider:

1.  If the author defines or reuses a schema definition for the structure, and specifies the itemtype for the itemscope surrounding the html element where the binding takes place.
2.  No such schema is provided.

In what follows, we consider the latter scenario, so that emitting the type of non string primitives is critical for us to be able to hydrate the data accurately.

### Binding to simple primitive values, and simple, non repeating objects with non semantic tags

Let us apply the template to the host object defined above:

```html
<template>
    <span>{{name}}</span>
    <span>{{eventDate as https://schema.org/DateTime}}</span>
    <span>{{secondsSinceBirth as https://schema.org/Number}}</span>
    <span>{{isVegetarian as https://schema.org/Boolean}}</span>
    <span>{{address as https://schema.org/Thing}}</span>
    <div itemscope itemprop=address>
        <span>{{street}}</span>
    <div>
    <span>{{address.zipCode}}</span>
    <div itemscope itemprop=address>
        <div itemscope itemprop=gpsCoordinates>
            <span>{{address.gpsCoordinates.latitude.toFixed|2 as https://schema.org/Number}}</span>
        </div>
    </div>
    <div>{{address.gpsCoordinates.longitude.toFixed|3 as https://schema.org/Number}}</div>
</template>
```

Then with the integrateWithMicrodata setting enabled it would generate (with US as the locale):

```html
<span itemprop=name>Bob</span>
<span itemprop=eventDate itemtype=https://schema.org/DateTime>5/11/2023</span>
<span itemprop=secondsSinceBirth itemtype=https://schema.org/Number>1,166,832,000</span>
<span itemprop=isVegetarian itemtype=https://schema.org/Boolean>true</span>
<span><meta itemprop=address itemtype=https://schema.org/Thing content='{"street": "123 Penny Lane", "zipCode": 12345}'></span>
<div itemscope itemprop=address>
    <span itemprop=street>123 Penny Lane</span>
</div>
<span itemscope itemprop=address><meta itemprop=zipCode content=12345>12345</span>
<div itemscope itemprop=address>
    <div itemscope itemprop=gpsCoordinates>
        <span><meta itemprop=latitude itemtype=https://schema.org/Number content=35.77804334830908>35.78</span>
    </div>
</div>
<div itemscope itemprop=address>
    <!-- line feeds are for readability -->
    <meta itemscope itemref=a7c4c3a74-272e-4cf5-bf53-60ad9672206f itemprop=gpsCoordinates>
    <meta id=a7c4c3a74-272e-4cf5-bf53-60ad9672206f itemprop=longitude content=-78.64528572271688>
    -78.645
</div>
```

The rules for what we are doing are summarized below:

|Type     |Url                         |Content value        |Visible content
|---------|----------------------------|---------------------|----------------
|Number   |https://schema.org/Number   |num.toString()       |num.toLocaleString()
|Date     |https://schema.org/DateTime |date.toISOString()   |date.toLocaleDateString()
|Boolean  |https://schema.org/Boolean  |bln.toString()       |true/false
|Object   |https://schema.org/Thing    |JSON.stringify(obj)  |None

All these primitive types are [officially recognized](https://schema.org/DataType) by schema.org, with the possible exception of the last one.  If the usage above for the last one is considered incorrect, I would suggest https://schema.org/DataType/SchemalessObject be added to schema.org.  Supporting this "primitive" type would speed up development, in my opinion. 

It should be noted that for each of these primitive types, a phrase like this is used in the documentation:

> Instances of Number may appear as a value for the following properties

They use the word "may" rather than "must" or "may only".  Maybe that's legalese.  If this is considered improper, maybe a schema should be created specifically for template instantiation where such usage is explicitly granted?  If it is acceptable to use the values above, I suspect search engines would properly know that these values are numbers, even if there's no grander schema that the content is part of.

I don't think the template instantiation engine itself would benefit internally from emitting these types.  The purpose of the types is hydration of server-rendered content, and better search engine accuracy only, which I think is outside the purview of template instantiation.

So all of these typings are purely optional, up to the developer.  The template instantiation engine would only emit them if provided.  I think tooling could come to the rescue to make these typings reliable (in conjunction with typescript).

So when do we need to use the meta tag?

1.  When evaluating an interpolating expression.  (see below)
2.  When the moustache expression does any manipulation of the data beyond to[Locale][*]String(), making deriving the underlying value impossible.
3.  When the moustache expression contains a nested property path.  If the path goes beyond two levels, guid id's would need to be created automatically to manage the hierarchy.

Note that with the nested objects, the divs are actually using microdata bindings in conjunction with moustache syntax.  I initially was using the phrase "emitMicrodata" to describe what this proposal is all about.  But those examples, if template instantiation supports them, kind of burst through the initial understanding.  It is doing more than emitting.  So assuming those examples hold, the correct phrase should be integrateWithMicrodata.


## Formatting

If template instantiation supports formatting:

```html
<template>
    <time>{{eventDate.toLocaleDate|ar-EG, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }}}</time>
<template>
```

it would generate:

```html
<time itemprop=eventDate datetime=2011-11-18T14:54:39.929Z>الجمعة، ١٢ مايو ٢٠٢٣</time>
```

Now let's talk about the dreaded interpolation scenario.

```html
<template>
    <div>Hello {{name}}, the event will begin at {{eventDate as https://schema.org/DateTime }}</div>
</template>
```


This would generate:

```html
<div>Hello <meta itemprop=name content=Bob>Bob<meta content>, the event will begin at <meta itemprop=eventDate itemtype=https://schema.org/DateTime content=2011-11-18T14:54:39.929Z>11/18/2011</div>
```


## Loops

The scenarios get a bit complicated here.  What follows assumes that the developer wants to be able to "reverse engineer" the output, and be able to guarantee they can distinguish between content that came from a loop, vs. content that came from a single sub property.  In what follows, I assume the tougher case.  If no such requirements exist, the developer can drop specifying the itemtype.



### Example 1

Suppose we have a list of todo items:

```JSON
{
  "todos": [
    {
      "id": 1,
      "todo": "Do something nice for someone I care about",
      "completed": true,
      "userId": 26
    },
    {...},
    {...}
    // 30 items
  ]
}
```


```html
<template>
    <ul itemscope itemtype=https://schema.org/ItemList>
        <li itemscope itemprop="{{itemListElement of todos}}" itemtype="https://mywebsite.com.com/TODOItemSchema.json">
            <div>{{itemListElement.todo}}</div>
        </li>
    </ul>
</template>
```

would [generate](https://schema.org/ItemList):

```html
<ul itemscope itemprop=todos itemtype="https://schema.org/ItemList">
    <li itemscope itemprop="itemListElement"  itemtype="https://mywebsite.com.com/TODOItemSchema.json">
        <div itemprop=todo>Do something nice for someone I care about</div>
    </li>
    ...
</ul>
```

I *think* now when hydrating, even when there's a single child list item, that we can tell we are working with an array of items, rather than a sub property.  All of the types pointing to schema.org and to mywebsite.com are optional.  I don't think template instantiation would need them for anything.

## Creating artificial hierarchies with itemref

```html
<template >
<dl itemscope itemtype=https://schema.org/ItemList>
    <template>
        <dt itemprop="{{itemListElement of monsters}}" itemref={{itemListElement.id}}_description>
            <span>{{itemListElement.name}}</span>
        </dt>
        <dd id={{itemListElement.id}}_description>{{itemListElement.description}}</dd>
    </template>
</dl>
</template>
```

would generate:

```html
<dl itemscope itemprop=monsters itemtype=https://schema.org/ItemList>
    <dt itemref=monster_1_description itemscope itemprop=itemListElement itemtype=https://mywebsite.com/Monster.json>
        <span itemprop=name>Beast of Bodmin</span>
    </dt>
    <dd id=monster_1_description itemprop=description>A large feline inhabiting Bodmin Moor.</dd>

    
    <dt itemref=monster_2_description itemscope itemprop=itemListElement itemtype=https://mywebsite.com/Monster.json>
        <span itemprop=name>Morgawr</span>
    </dt>
    <dd id=monster_2_description itemprop=itemListElement>A sea serpent.</dd>

    <dt itemref=monster_3_description itemscope itemprop=itemListElement itemType=https://mywebsite.com/Monster.json>
        <span itemprop=name>Owlman></span>
    </dt>
    <dd id=monster_3_description itemprop=description>A giant owl-like creature.</dd>
</dl>
```

An open question here is whether template instantiation could provide any shortcuts for specifying this itemref/id pairing, so they are guaranteed to stay in sync?

Suggested syntax for that shortcut:

```html
<template >
<dl itemscope itemtype=https://schema.org/ItemList>
    <template>
        <dt itemprop="{{itemListElement of monsters}}" itemref={{##dd}}>
            <span>{{itemListElement.name}}</span>
        </dt>
        <dd id={{itemListElement.id}}_description>{{itemListElement.description}}</dd>
    </template>
</dl>
</template>
```

Basically, the itemref attribute would be populated with a space delimited list of id's from the dd elements in rhe template.

Similarly for grouped table rows:

```html
<template>
    <table itemscope itemtype=https://schema.org/ItemList>
        <tbody>
            <template>
                <tr itemprop="{{itemListElement of items}}" itemref={{itemListElement.id}}_even class=odd>
                    <td>{{itemListElement.to}}</td>
                    <td>{{itemListElement.from}}</td>
                </tr>
                <tr id={{itemListElement.id}}_even class=even>
                    <td>{{itemListElement.subject}}</td>
                    <td>{{itemListElement.message}}</td>
                </tr>
            <template>
        </tbody>
    </table>
</template>
```

would generate:

```html
<table>
    <tbody itemscope itemprop=items itemtype=https://schema.org/ItemList>
        <tr itemref=first_item itemscope itemprop=itemListElement itemtype=https://mywebsite.com/Message.json class=odd>
            <td itemprop=to>Foo</td>
            <td itemprop=from>Bar</td>
        </tr>
        <tr id=first_item class=even>
            <td itemprop=subject>Baz</td>
            <td itemprop=message>Qux</td>
        </tr>
        
        <tr itemref=second_item itemscope itemprop=itemListElement itemtype=https://mywebsite.com/Message.json class=odd>
            <td itemprop=to>Quux</td>
            <td itemprop=from>Quuz</td>
        </tr>
        <tr id=second_item class=even>
            <td itemprop=subject>Corge</td>
            <td itemprop=message>Grault</td>
        </tr>
    </tbody>
</table>
```





