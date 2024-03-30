# Directed Scoped Specifiers (DSS)

"Directed Scoped Specifiers" (DSS) is a string pattern specification that is inspired by CSS selectors, but whose goal is far more targeted:  It provides a syntax to:

1.  Make it easy to describe a relationship to another DOM element "in its vicinity", including the (custom element) host containing the element.
2.  Included in that information can be highly useful information including the name of the property to bind to, and the event name to listen for.
2.  It is compatible with HTML that could be emitted from template instantiation built into the browser, that adopts [this proposal](https://github.com/WICG/webcomponents/issues/1013).
3.  It nudges the developer to name things in a way that will be semantically meaningful.

## Special Symbols

At the core of DSS are some some special symbols used in order to keep the statements small.


| Symbol       | Meaning                        | Notes                                                                                             |
|--------------|--------------------------------|---------------------------------------------------------------------------------------------------|
| /propName    |"Hostish"                       | Attaches listeners to "propagator" EventTarget.                                                   |
| @propName    |Name attribute                  | Listens for input events by default.                                                              |
| \|propName   |Itemprop attribute              | If contenteditible, listens for input events by default.  Otherwise, uses be-value-added.         |
| #propName    |Id attribute                    | Listens for input events by default.                                                              |
| %propName    |match based on part attribute   | Listens for input events by default.                                                              |
| -prop-name   |Marker indicates prop           | Attaches listeners to "propagator" EventTarget.                                                   | 
| ~elementName |match based on element name     | Listens for input events by default.                                                              |
| $0           |adorned element                 | Useful for specifying constants (TODO)                                                            |
| ::eventName  |name of event to listen for     |                                                                                                   |


"Hostish" means:

1.  First, do a "closest" for an element with attribute itemscope, where the tag name has a dash in it.  Do that search recursively.  
2.  If no match found, use getRootNode().host.

We are often (but not always in the case of 2. below) making some assumptions about the elements we are comparing -- 

1.  The value of the elements we are comparing are primitive JS types that are either inferrable, or specified by a property path.
2.  The values of the elements we are comparing change in conjunction with a (user-initiated) event. 

## By Example

DSS is used throughout many of the components / enhancements built upon this package.  The best way to explain this *lingua franca* is by example

## *fetch-for*

The *fetch-for* [web-component](https://github.com/bahrus/fetch-for) uses DSS extensively:

```html
<input name=op value=integrate>
<input name=expr value=x^2>
<fetch-for
    for="@op @expr"
    oninput="
        event.href=`https://newton.now.sh/api/v2/${event.forData.op.value}/${event.forData.expr.value}`
    "
    target=-object
    onerror=console.error(href)
>
</fetch-for>
...
<json-viewer -object></json-viewer>
```

@op and @expr is saying "find elements within the nearest form or root note with attributes op and expr.  Use whatever default events and methods of extracting the value from these elements up to the individual library to determine, that is outside the scope of DSS".

Likewise, the marker "-object" is saying "find element with attribute -object" and pass whatever this library wants to pass to it (say myStuff), via the local property oJsonViewer.object = myStuff".

## Conditional display with *be-switched*

[*be-switched*](https://github.com/bahrus/be-switched#readme) is a custom enhancement that can lazy load HTML content when conditions are met.  It uses DSS syntax to specify dependencies on nearby elements (or the host).  For example:

```html
<label for=lhs>LHS:</label>
<input id=lhs>
<label for=rhs>RHS:</label>
<input id=rhs>
<template be-switched='on when #lhs equals #rhs.'>
    <div>LHS === RHS</div>
</template>
```

To specify more nuanced locations, use the "upstream" ^ operator:

```html
These should be ignored:
<div>
    <label for=lhs>LHS:</label>
    <input name=lhs>
    <label for=rhs>RHS:</label>
    <input name=rhs>
</div>
These should be active:
<section>
    <label>
        LHS:
        <input name=lhs>
    </label>
    
    <label>RHS:
        <input name=rhs>
    </label>
    
    <template be-switched='on when ^section@lhs eq ^section@rhs.'>
        <div>LHS === RHS</div>
    </template>
</section>
```

## Directional Symbols

| Symbol       | Meaning                        | Notes                                                                                             |
|--------------|--------------------------------|---------------------------------------------------------------------------------------------------|
| ^            | Single closest match           |                                                                                                   |
| ^^           | Recursive closest match        |                                                                                                   |
| ^*           | UpSearch                       | Checks previous siblings as well as parent, previous elements of parent, etc. [TODO]              |
| Y            | Single downward match.         | Doesn't check inside each downward element [TODO]                                                 |
| Y*           | Thorough downward match.       | Checks stuff inside each downward element [TODO]                                                   |


## Specifying events

[*be-bound*](https://github.com/bahrus/be-bound?tab=readme-ov-file#special-logic-for-forms) has an example where we specify the property name, and the  event name to listen for:

```html
<input id=alternativeRating type=number>
<form be-bound='between rating:value::change and #alternativeRating.'>
    <div part=rating-stars class="rating__stars">
        <input id="rating-1" class="rating__input rating__input-1" type="radio" name="rating" value="1">
        <input id="rating-2" class="rating__input rating__input-2" type="radio" name="rating" value="2">
        <input id="rating-3" class="rating__input rating__input-3" type="radio" name="rating" value="3">
        <input id="rating-4" class="rating__input rating__input-4" type="radio" name="rating" value="4">
        <input id="rating-5" class="rating__input rating__input-5" type="radio" name="rating" value="5">
    </div>  
</form>
```
