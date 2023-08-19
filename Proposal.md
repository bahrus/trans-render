# Template Instantiation Developer Productivity Proposal

The following outlines some productivity (and higher reliability) enhancement proposals that would make template instantiation more effective.

## Support for Microdata, Name and ID attributes, toLocaleString/toLocaleDateString

Idea for this (updated) section of the proposal is partly inspired by [(misreading?) this article](https://eisenbergeffect.medium.com/the-future-of-native-html-templating-and-data-binding-5f3e52fda259).

A common "chore" developers need to perform when binding to forms, is to "repeat oneself" when binding the value and name and id of a form field.  [For example](https://www.freecodecamp.org/news/how-to-build-forms-in-react/):

```JSX
export default function Multiple() {
  ...

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">Name:</label>
      <input type="text" id="name" name="name" value={formData.name} onChange={handleChange}/>

      <label htmlFor="email">Email:</label>
      <input type="email" id="email" name="email" value={formData.email} onChange={handleChange}/>

      <label htmlFor="message">Message:</label>
      <textarea id="message" name="message" value={formData.message} onChange={handleChange}/>

      <button type="submit">Submit</button>
    </form>
  );
}
```

The property names "name", "email", "message" are repeated no less than three time per field, causing unnecessary carpel syndrome, and room for errors.

## Microdata support

A good [percentage](https://w3techs.com/technologies/details/da-microdata#:~:text=Microdata%20is%20used%20by,24.2%25%20of%20all%20the%20websites) of websites use [microdata](http://html5doctor.com/microdata/).  It is still lagging behind some competitors which aren't of the WHATWG standard, however.  Let's try to fix that! 

### Historical backdrop

Given the age of the second link above, it is natural to ask the question, why did it take so long for anyone to raise the possibility of integrating template binding with microdata, [at least for a while](https://www.codeproject.com/Articles/233896/ASP-NET-MVC-Add-HTML-Microdata-to-Your-Application)?  Or is there some fatal flaw in even trying?  I was ready to attribute this to a massive market failure on the part of the web development community, including myself, but I don't think the explanation is that simple, thankfully.

What I've learned is that for years, the microdata initiative was in a kind of simmering battle with another proposal, RDFa, as far as which one would be embraced as the one true standard.

The microdata proposal suffered a significant setback in the early 2010's, and only in the late 2010's did it experience a comeback, and it seems safe now to conclude that microdata has won out, permanently, in terms of built-in integration with the browser.  Some sites haven't [been properly updated](https://caniuse.com/sr_microdata) to reflect that fact, which can partly explain why this comeback seems to have slipped under the development community's radar.

### Nudging developers

I think nudging developers to make use of this [standard](https://html.spec.whatwg.org/multipage/#toc-microdata) by making it super easy and reliable, when working with template instantiation, would have a beneficial impact for the web and society in general.  As we will see, we want to ensure that all bindings are in sync, by avoiding the need to repeat ourselves.  Since what the search engine sees is so difficult to determine, I think it's important to build in that reliability, hence the extra complexity I'm requesting to ensure that we get that reliability.

### Benefits

At a more mundane level, it could have significant performance benefits. It could allow applications to hydrate without the need for passing down the data separately, and significantly reduce the amount of custom boilerplate in the hydrating code. 

With the help of the semantic tags and microdata attributes, we can [extract](https://html.spec.whatwg.org/multipage/microdata.html#converting-html-to-other-formats) "water from rock", passing the data used by the server to generate the HTML output within attributes of the HTML output, consistent with what the client would generate via the template and applied to the same data.  **The hydration could happen real time as the html streams in**.

### Caveats

The biggest cost associated with supporting microdata, is whether *updates* to the HTML should include updates to data tags' value attributes.  Not updating them would have no effect on hydrating, or what the user sees, but might, I suspect, have an impact on limiting search result accuracy and indexing.

The specific syntax of this proposal is just my view of the best way of representing integration with microdata, and is not meant to imply any "final decision", as if I'm in a position to do so.  I'm not yet an expert on the microdata standard, so it is possible that some of what I suggest below contradicts some fine point specified somewhere in the standard.  But I do hope others find this helpful, especially if it triggers a competing proposal that tries to "get it right".

Because there's a tiny performance cost to adding microdata to the output, it should perhaps be something that can be opt-in (or opt-out).  But if having microdata contained in the output proves to be so beneficial to the ability of specifying parts and working with streaming declarative shadow DOM, that it makes sense to always integrate with microdata, in my view the performance penalty is worth it, and would do much more good than harm (the harm seems negligible).


### Highlights

This proposal consists of several, somewhat loosely coupled sub-proposals.  

1.  Specify some decisions for how microdata and other attributes would be emitted in certain scenarios.  Described below.
2.  Support for quaternion expressions.
3.  Support for dynamic id management.
4.  Provide a built-in function that can [convert](https://html.spec.whatwg.org/multipage/microdata.html#json) microdata encoded HTML to JSON.  However, **the specs for this conversion seem to indicate that the JSON output would be far more verbose than what an application using template instantiation would want**, as it seems to convert to a schema-like representation of the object.  An application would want to be able to reconstruct the simple, exact object structure that was used to generate the output in conjunction with the template bindings.  So one more function would be needed to collapse this generic object representation into a simple POJO, which is easy enough to build in userland.
5.  Add [semantic tags](https://github.com/whatwg/html/issues/8693) for numbers.  "meter" is a nice tag, but maybe a simpler one is also needed for plain old [numbers](https://github.com/whatwg/html/issues/9294).  Enhance [the time tag](https://github.com/whatwg/html/issues/2404). This would lighten the load on template instantiation having to make up syntax for extremely common place requirements, and add much needed context for search engines and hydrating code.
6.  Extend the microdata standard to allow specifying itemprops that come from individual attributes, and provide support for it with template instantiation.


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

1.  If the author defines or reuses a schema definition for the structure, and specifies the itemtype for the itemscope surrounding the html element where the binding takes place.  Most web component libraries can [auto generate](https://www.npmjs.com/package/web-component-analyzer) a schema file for the custom element manifest, so maybe not a stretch to expect this to be common place?
2.  No such schema is provided.

I don't think template instantiation needs to care which scenario the developer is following.  Despite my initial suspicion that it would be helpful, on reflection, I think we should stay clear of making template instantiation emit any itemtype information beyond what the developer specifies explicitly in the attribute. 

## Suggested symbol shortcuts

| Symbol | Attribute | Connection                                                                    |
|--------|-----------|-------------------------------------------------------------------------------|
| #      | id        | # used by css for id                                                          |
| @      | itemscope | [scoping css](https://css.oddbird.net/scope/explainer/#proposed-solution)     |
| &      | name      | Query string uses & to separate field names                                   |
| i      | itemprop  | First letter of itemprop                                                      |



### Binding to simple primitive values, and simple, non repeating objects with non semantic tags

Let's apply the following template: 

```html
<template>
    <span>{{i name}}</span>
    <span>{{#i name}}</span>
    <input value="{{& name}}">
    <meta content="{{i name}}">
    <span>{{i eventDate.toLocaleDate|ar-EG, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }}}</span>
    <span>{{i secondsSinceBirth}}</span>
    <span aria-checked={{isVegetarian}}>{{i isVegetarian ? 'Is vegetarian' : 'Is not vegetarian' : 'Not specified.'}}</span>
    <link href="{{i isVegetarian ? 'https://schema.org/True' : 'https://schema.org/False' : ''}}">
    <span>{{i isVegetarian}}</span>
    <div  {{@i address}}>
        <span>{{i street}}</span>
    <div>
    <span>{{i address.zipCode}}</span>
    <div {{@i address}}>{{@i gpsCoordinates.latitude.toFixed|2}}</div>
</template>
```

... to the host object defined above.  What template instantiation would emit is:


```html
<span itemprop=name>Bob</span>
<span id=name itemprop=name>Bob</span>
<input name=name value=Bob>
<meta itemprop=name content=Bob>
<span><time itemprop=eventDate datetime=2011-11-18T14:54:39.929Z>الجمعة، ١٢ مايو ٢٠٢٣</time></span>
<span><data itemprop=secondsSinceBirth value="1166832000">1,166,832,000</span>
<span aria-checked=true><data itemprop=isVegetarian value=true>Is vegetarian</data></span>
<link itemprop=isVegetarian href=https://schema.org/True>
<span><data itemprop=isVegetarian value=true>true</span>
<div itemscope itemprop=address>
    <span itemprop=street>123 Penny Lane</span>
</div>
<span itemprop=address><span itemprop=zipCode>12345</span></span>
<div itemscope itemprop=address><span itemscope itemprop=gpsCoordinates><data itemprop=latitude value=35.77804334830908>35.78</data></span></div>
```

All numbers, dates, booleans are, unless specified, emitted to the user via .toLocaleString/toLocaleDateString.

If expressions involve more than one property, I think here we should leave it up the developer to provide the needed tags (including meta) to provide the needed microdata reflection.

For the aria-checked property, if the value of isVegetarian is true/false, set the value to isVegetarian.toString().  Otherwise, set it to "mixed".

This proposal is also advocating support for "quaternio" conditional expressions (condition ? true : false : other). 

Now let's talk about the dreaded interpolation scenario.

```html
<template>
    <div>Hello {{i name}}, the event will begin at {{i eventDate}}.</div>
</template>
```


This would generate:

```html
<div>Hello <span itemprop=name>Bob</span>, the event will begin at <time itemprop=eventDate datetime=2011-11-18T14:54:39.929Z>11/18/2011</time>.</div>
```

Should there exist, in the future, a semantic tag for numbers and booleans, the template instantiation would use it, but we would need to "enable" it for backwards compatibility.  For now, use data tags for numbers and booleans, span's for string values, and time for dates.

What this example demonstrates is we apparently don't need the use of ranges, when performing interpolation, if we want to support microdata.  If there is a significant performance benefit to using ranges, with meta tags, or link tags for binaries, that could be used as an alternative (that was my original thought on this question).  If the performance difference is tiny, I think the simplicity argument should prevail.

## id management

### Referential support with user specified reference id.

It often arises that the id for one element should be dynamic, and another element needs to reference this dynamic value.

Examples are the label's for attribute, numerous aria- attributes, and microdata's itemref attributes.

Suggested [syntax](https://github.com/behowell/aom/blob/element-handles-explainer/element-handles-explainer.md):

```html
<template>
    <span
    role="checkbox"
    aria-checked="false"
    tabindex="0"
    aria-labelledby="{{handle(my-handle)}}"></span>
    <span handle=my-handle id="terms_and_conditions_{{item_id}}">I agree to the Terms and Conditions.</span>
</template>
```

This would generate:

```html
<span
    role="checkbox"
    aria-checked="false"
    tabindex="0"
    aria-labelledby="terms_and_conditions_17811"></span>
    <span handle=my-handle id="terms_and_conditions_17811">I agree to the Terms and Conditions.</span>
```

### Referential support with auto-generated id's.

```html
<template>
    <span
    role="checkbox"
    aria-checked="false"
    tabindex="0"
    aria-labelledby="{{handle(my-handle)}}"></span>
    <span handle=my-handle id={{generate-id()}}>I agree to the Terms and Conditions.</span>
</template>
```

## Conditions

Suppose we want a conditional to output more than one root element.  In this case, we could use a template wrapper around the conditional content:

```html
<template>
    <ul>
        <template itemscope itemprop=USAddress itemref="{{if IsUSAddress}}">
            <li id=name>{{addresseeName}}</li>
            <ul itemscope itemprop=Address>
                <li>{{StreetAddress}}</li>
            </ul>
        </template>
    </ul>
</template>     
```

Template instantiation with integrateMicrodata would emit:

```html
<ul>
    <template itemscope itemprop=USAddress itemref="name a5a116a19-263d-4d89-8e9c-45b0b8ba77de"></template>
    <li itemprop=addresseeName id=name>Bob</li>
    <ul id="a5a116a19-263d-4d89-8e9c-45b0b8ba77de" itemscope itemprop=Address>
        <li itemprop=StreetAddress>123 Penny Lane</li>
    </ul>
</ul>
```

So we use itemref to maintain a hierarchical tree logical structure, even though the DOM structure is flat.  Leaving the template element in the output may make it easier to implement logic to recreate the DOM elements when the condition becomes false, then true again (if the previous content is deleted).  So even if the performance is slightly worse than a meta tag on the initial render, I suspect the simplicity and even performance may argue in favor of keeping the template element.  It is also more transparent how the rendered content relates to the original template.

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
        <dt itemscope itemtype=https://mywebsite.com/Monster.json itemprop="{{itemListElement of monsters}}" itemref={{itemListElement.id}}_description>
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
        <dt  itemtype=https://mywebsite.com/Monster.json itemprop="{{itemListElement of monsters}}" itemref={{#dd}}>
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
        <tr id=first_item_even class=even>
            <td itemprop=subject>Baz</td>
            <td itemprop=message>Qux</td>
        </tr>
        
        <tr itemref=second_item itemscope itemprop=itemListElement itemtype=https://mywebsite.com/Message.json class=odd>
            <td itemprop=to>Quux</td>
            <td itemprop=from>Quuz</td>
        </tr>
        <tr id=second_item_even class=even>
            <td itemprop=subject>Corge</td>
            <td itemprop=message>Grault</td>
        </tr>
    </tbody>
</table>
```

## Conveying searchable content via attributes.

One limitation of microdata, is that much useful information is conveyed from the server in attributes, such as alt, title, value and data-*, and there is no way to specify itemprops for those attributes.

Suppose whatwg adopted another microdata attribute, say itempropmap, that would allow us to provide more useful information:


```html
<img
     alt="description of image" 
     data-date-of-image=2011-11-18T14:54:39.929Z 
     itempropmap="alt:imageDescription;data-date-of-image:imageDateTime;"
>
```

Template instantiation could help generate these mappings with reliability:

```html
<template>
    <img alt={{imageDescription}} data-date-of-image={{imageDateTime}}>
</template>
```








