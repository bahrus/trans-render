# Template Instantiation Developer Productivity Proposal

Author:  Bruce B. Anderson
Last Updated: 2024-3-10

The following outlines some productivity, and higher reliability enhancement proposals, that would make template instantiation more effective.

## Support for Microdata, Name and ID attributes, toLocaleString/toLocaleDateString

Idea for this updated section of the proposal is partly inspired by [(misreading?) this article](https://eisenbergeffect.medium.com/the-future-of-native-html-templating-and-data-binding-5f3e52fda259).

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

The property names "name", "email", "message" are repeated no less than three time per field, causing unnecessary carpal syndrome, and room for errors.

So eliminating this unreliability caused by needing to keep all three in sync would be a great benefit.  Especially if the same idea could be extended to at least one additional attribute:  itemprop.  I.e. it would be great if template instantiation provided...

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

As mentioned above, what we want to do is allow developers to easily emit the name of the property they are binding to to various attributes of the element.  Each attribute binding would be specified by a single character in the binding instruction, to keep this added support light and small.  Suggested symbols are below:

| Symbol | Translates to         | Connection / meaning                                                                                                                             |
|--------|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| #      | id                    | # used by css for id, also bookmarks in urls that points to id's                                                                                 |
| \|     | itemprop              | "Pipe" is kind of close to itemprop, and is half of a dollar sign, and it kind of looks like an I                                                |
| @      | name                  | Second letter of name. Also, common in social media sites/github to type this letter in order to select someone's name.                          |
| $      | itemscope + itemprop  | Combination of S for Scope and Pipe which resembles itemprop a bit                                                                               |
| %      | part                  | Starts with p, percent is used for indicating what proportion something is.                                                                      |
| .      | class                 | css selector                                                                                                                                     |
| ^      | "upsearch"            | Points upward.  Look to previous siblings, then parent, then previous siblings of parent until a match is found.  Stops at first match.          |
| Y      | "downsearch"          | Point downward.  Look for downstream sibling.  Stands for Yertdrift.  Stops at first match.   |
| *      | free form css match   | Used in css, regular expressions for roughly this purpose.  Searches everywhere within the helper block of markup i.e. within each {{#each}} or {{#if}}                                                                 |

Let's see some examples of this in action:

### Binding to simple primitive values, and simple, non repeating objects with non semantic tags

Let's apply the following template: 

```html
<template>
    <span>{{| name}}</span>
    <span>{{#| name}}</span>
    <input part=my-input class=my-input value="{{@#%. name}}">
    <meta content="{{| name}}">
    <span>{{| eventDate.toLocaleDate|ar-EG, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }}}</span>
    <span>{{| secondsSinceBirth}}</span>
    <span aria-checked={{isVegetarian}}>{{| isVegetarian ? 'Is vegetarian' : 'Is not vegetarian' : 'Not specified.'}}</span>
    <link href="{{| isVegetarian ? 'https://schema.org/True' : 'https://schema.org/False' : ''}}">
    <span>{{| isVegetarian}}</span>
    <div  {{$ address}}>
        <span>{{| street}}</span>
    <div>
    <span>{{$ address.zipCode}}</span>
    <div {{$ address}}>{{$ gpsCoordinates.latitude.toFixed|2}}</div>
</template>
```

... to the host object defined above.  What template instantiation would emit is:


```html
<span itemprop=name>Bob</span>
<span id=name itemprop=name>Bob</span>
<input id=name name=name part="my-input name" class="my-input name" value=Bob>
<meta itemprop=name content=Bob>
<span><time itemprop=eventDate datetime=2011-11-18T14:54:39.929Z>الجمعة، ١٢ مايو ٢٠٢٣</time></span>
<span><data itemprop=secondsSinceBirth value="1166832000">1,166,832,000</data></span>
<span aria-checked=true><data itemprop=isVegetarian value=true>Is vegetarian</data></span>
<link itemprop=isVegetarian href=https://schema.org/True>
<span><data itemprop=isVegetarian value=true>true</data></span>
<div itemscope itemprop=address>
    <span itemprop=street>123 Penny Lane</span>
</div>
<span itemscope itemprop=address><span itemprop=zipCode>12345</span></span>
<div itemscope itemprop=address><span itemscope itemprop=gpsCoordinates><data itemprop=latitude value=35.77804334830908>35.78</data></span></div>
```

All numbers, dates, booleans are, unless specified, emitted to the user via .toLocaleString/toLocaleDateString.

If expressions involve more than one property, I think here we should leave it up to the developer to provide the needed tags (including meta) to provide the desired microdata reflection.

For the aria-checked property, if the value of isVegetarian is true/false, set the value to isVegetarian.toString().  Otherwise, set it to "mixed".

This proposal is also advocating support for "quaternion" conditional expressions (condition ? === true : === false : other). 

Now let's talk about the dreaded interpolation scenario.

```html
<template>
    <div>Hello {{| name}}, the event will begin at {{| eventDate}}.</div>
</template>
```


This would generate:

```html
<div>Hello <span itemprop=name>Bob</span>, the event will begin at <time itemprop=eventDate datetime=2011-11-18T14:54:39.929Z>11/18/2011</time>.</div>
```

Should there exist, in the future, a semantic tag for read only numbers and booleans, the template instantiation would use it, but we would need to "enable" it for backwards compatibility.  For now, use data tags for numbers and booleans, span's for string values, and time for dates.

What this example demonstrates is we apparently don't need the use of ranges, when performing interpolation, if we want to support microdata.  If there is a significant performance benefit to using ranges, with meta tags, or link tags for binaries, that could be used as an alternative (that was my original thought on this question).  If the performance difference is tiny, I think the simplicity argument should prevail.

## id management

### Referential support with user specified reference id.

It [often arises](https://github.com/whatwg/html/issues/10143) that the id for one element should be dynamic, and another element needs to reference this dynamic value.

Examples are the label's for attribute, numerous aria- attributes, and microdata's itemref attributes.  In many cases (itemref, output's for attribute) we allow for a space delimited list of id's.

To help with this, I propose:

```html
<template>
    {{#each items}}
        <span
        role="checkbox"
        aria-checked="false"
        tabindex="0"
        aria-labelledby="{{idref(Y)}}"></span>
        <span id="terms_and_conditions_{{item_id}}">I agree to the Terms and Conditions.</span>
    {{/each}}
</template>
```

... would generate:

```html
<span
    role="checkbox"
    aria-checked="false"
    tabindex="0"
    aria-labelledby="terms_and_conditions_17811"></span>
<span id="terms_and_conditions_17811">I agree to the Terms and Conditions.</span>
```

Maybe the Y symbol should be followed by a \*, but the point is, what follows the v or ¥ symbol, if anything, could be a css query to match for everything *below* the adorned element.  To reference the previous element, use ^, followed by a css query if applicable.  In either case, stop at the first match.  

We could also perform a general css search inside the idref function, that would need to be done carefully within the #each block, so that if multiple elements are found matching the css query within that block, then the attribute is a space delimited list of all the id's of matching elements. In this case, instead of using ^ or v, the tentative recommendation is to start with query with a * followed by a space.  If we want to specify a query based on one of the special symbols listed in the table at the top of this document, this could be done as well. Examples of such rules are spelled out in more detail [here (WIP)](https://github.com/bahrus/be-switched), where we are trying to make that userland library conform with this proposal, basically a POC of sorts.

### Referential support with auto-generated id's.

```html
<template>
    {{#each items}}
        <span
        role="checkbox"
        aria-checked="false"
        tabindex="0"
        aria-labelledby="{{idref(Y)}}"></span>
        <span id={{generate-id()}}>I agree to the Terms and Conditions.</span>
    {{/each}}
</template>
```

## Conditions with microdata

Suppose we want a conditional to output more than one root element.  It's unclear to me what the final outcome will be as far as whether built-in template instantiation will use some "marker" in the live DOM tree that can be used to remember the contents of the template from which the conditional content derived.  Such a marker could be useful, if the condition changes to be false, and the conditional content is removed, and then the condition changes back to true.  Perhaps built-in template instantiation could be smart enough to do this without any markers in the live DOM tree.  We assume below that template instantiation would rely on such a marker, and suggest that that marker be an empty template element (with the already parsed "content" stored in some memory location, so that no parsing of the inner HTML would be required).

If no such markers are needed, then it seems to me there will be some inevitable loss of information as far as microdata is concerned, and as far as "reverse engineering" the output in order to infer the template is concerned.  But if the performance improvement from not needing a marker is significant enough, that should probably trump concerns about loss of information.


```html
<template>
    <ul>
        {{#if | isUSAddress $ USAddress}}
            <li>{{| addresseeName}}</li>
            <ul {{$ Address}}>
                <li>{{| StreetAddress}}</li>
            </ul>
        {{/if}}
    </ul>
</template>     
```

... would generate:

```html
<ul>
    <data itemprop=isUSAddress value=true></data>
    <template itemscope itemprop="USAddress" itemref="a23241 c72389"></template>
    <li id="a23241" itemprop=addresseeName>Bob</li>
    <ul id="c72389" itemscope itemprop=address>
        <li itemprop=streetAddress>123 Penny Lane</li>
    </ul>
</ul>
```

So we use itemref to maintain a hierarchical tree logical structure, even though the DOM structure is flat. 

Also, the template instantiation would automatically add the equivalent of id={{generate-id()}} to all elements inside the condition, unless the developer specifies an id.

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
    <ul itemtype=https://schema.org/ItemList>
        {{foreach $ itemListElement of $ todos}}
            <li itemtype="https://mywebsite.com.com/TODOItemSchema.json">
                <div>{{| itemListElement.todo}}</div>
            </li>
        {{/foreach}}
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

## Creating artificial hierarchies with itemref and loops

Similar to the conditional:

```html
<template >
<dl itemtype=https://schema.org/ItemList>
    {{ foreach $ itemListElement of $ monsters }}
        <dt itemtype=https://mywebsite.com/Monster.json>
            <span>{{| itemListElement.name}}</span>
        </dt>
        <dd id={{itemListElement.id}}_description>{{| itemListElement.description}}</dd>
    {{/foreach}}
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


## Conveying searchable content via attributes.

One serious limitation of the microdata standard, is that much useful information is conveyed from the server in attributes, such as alt, title, value and data-*, and there is no way to specify itemprops for those attributes.

Suppose WHATWG adopted another microdata attribute, say itempropmap, that would allow us to provide more useful information:


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
    <img alt="{{i imageDescription}}" data-date-of-image="{{i imageDateTime}}">
</template>
```
