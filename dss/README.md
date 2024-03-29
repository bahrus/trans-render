# Directed Scoped Specifiers (DSS)

"Directed Scoped Specifiers" (DSS) is a string pattern specification that is inspired by CSS, but whose goal is far more limited:  It provides a syntax to:

1.  Make it easy to describe a relationship to another DOM element "in it's vicinity", including the (custom element) host containing the element.
2.  It is compatible with HTML that could be emitted from template instantiation built into the browser, that adopts [this proposal](https://github.com/WICG/webcomponents/issues/1013).
3.  It nudges the developer to name things in a way that will be semantically meaningful.
