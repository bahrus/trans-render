# Directed Scoped Specifiers (DSS)

"Directed Scoped Specifiers" (DSS) is a string pattern specification that is inspired by CSS, but whose goal is far more limited and specialized:  It provides a syntax to:

1.  Make it easy to describe a relationship to another DOM element "in its vicinity", including the (custom element) host containing the element.
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

