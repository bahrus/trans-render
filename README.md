# trans-render

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/trans-render)

<a href="https://nodei.co/npm/trans-render/"><img src="https://nodei.co/npm/trans-render.png"></a>

[![Actions Status](https://github.com/bahrus/trans-render/workflows/CI/badge.svg)](https://github.com/bahrus/trans-render/actions?query=workflow%3ACI)

<img src="https://badgen.net/bundlephobia/minzip/trans-render">


*trans-render* provides a methodical way of instantiating a template.  It draws inspiration from the (least) popular features of XSLT.  Like XSLT, tr performs transforms on elements by matching tests on elements.  Whereas XSLT uses XPath for its tests, tr uses css path tests via the element.matches() and element.querySelectorAll() methods.  Unlike XSLT, though, the transform is defined with JavaScript, adhering to JSON-like declarative constraints as much as possible.

It's designed to provide an alternative to the proposed [Template Instantiation proposal](https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Template-Instantiation.md), with the idea being that it could continue to supplement what that proposal provides if/when it lands in browsers.

XSLT can take pure XML with no formatting instructions as its input.  Generally speaking, the XML that XSLT acts on isn't a bunch of semantically  meaningless div tags, but rather a nice semantic document, whose intrinsic structure is enough to go on, in order to formulate a "transform" that doesn't feel like a hack.

Likewise, with the advent of custom elements, the template markup will tend to be much more semantic, like XML. trans-render's usefulness grows as a result of the increasingly semantic nature of the template markup, because often the markup semantics provide enough clues on how to fill in the needed "potholes," like textContent and property setting, without the need for custom markup, like binding attributes.  But trans-render is completely extensible, so it can certainly accommodate custom binding attributes by using additional, optional helper libraries.

This can leave the template markup quite pristine, but it does mean that the separation between the template and the binding instructions will tend to require looking in two places, rather than one.  And if the template document structure changes, separate adjustments may be needed to keep the binding rules in sync.  Much like how separate style rules often need adjusting when the document structure changes.

<!--Not designed for binding a single element -- that can be handled by xtal-element's PEA support.

Doesn't need to support what can be supported by custom elements -- loops, conditionals

Use cases:

Interpolation
tag replacement 

supportsGeneralQuery by ending:  part, class, data, element

-->

## The core library

The core library, transform.js, is a tiny (1.2k gzip/minified), 'non-committal' library that simply allows us to map css matches to user-defined functions. 

Its first value-add proposition is it can reduce the amount of imperative *.selectQueryAll().forEach's needed in your code.  However, by itself, transform.js is not a complete solution, if you are looking for declarative syntax.  That will come with the ability to extend transform.js, which will be discussed below.

The CSS matching transform.js takes one of two forms:

1.  multi-matching for all DOM elements within the scope.
2.  Single element, scoping matches.

### Multi-matching

Consider the following example (please expand).  Don't worry, it looks quite complicated, but we will walk through it, and also, as we introduce more features, the code below will greatly simplify:

<details>
    <summary>Example 1</summary>

```html
<body>
    <template id=Main>
        <button data-count=10>Click</button>
        <div class="count-wide otherClass"></div>
        <vitamin-d></vitamin-d>
        <div part="triple-decker j-k-l"></div>
        <div id="jan8"></div>
        <div -text-content></div>
    </template>
    <div id=container></div>
    <script type="module">
        import { transform } from '../../lib/transform.js';
        transform(Main, {
            match: {
                countData: ({target, val}) =>{
                    target.addEventListener('click', e => {
                        const newCount = parseInt(e.target.dataset.count) + 1;
                        e.target.dataset.count = newCount;
                        transform(container, {
                            match: {
                                countWideClass: ({target}) => {
                                    target.textContent = newCount;
                                },
                                vitaminDElement: ({target}) => {
                                    target.textContent = 2 * newCount;
                                },
                                tripleDeckerPart: ({target}) => {
                                    target.textContent = 3 * newCount;
                                },
                                jan8Id: ({target}) => {
                                    target.textContent = 4 * newCount;
                                },
                                textContentProp: 5 * newCount,
                            }
                        });
                    })

                }
            }
        }, container);
    </script>
</body>
```

</details>

The first thing to note is that id's become global constants outside of ShadowDOM.  Hence we can refer to "Main" and "container" directly in the JavaScript:

```JavaScript
transform(Main, { 
    ...
}
```

The keyword "match" indicates that within that block are CSS Matches.  In this example, all the matches are "multi-matches" because they end with either "Class", "Element", "Part", "Id", "Prop".

So for example, this:

```JavaScript
countData: ({target, val}) =>{
    ...
}
```

is short-hand for:

```JavaScript
target.querySelectorAll('dataset-count').forEach(target => {
    const val = target.dataset.count;
    ...
})
```

What we also see in this example, is that the transform function can be used for two scenarios:

1.  Instantiating a template into a target container in the live DOM tree:

```JavaScript
transform(Main, {...}, container)
```

2.  Updating an existing DOM tree:

```JavaScript
transform(container, {...})
```

## Use Case 1:  Applying the DRY principle to punk rock lyrics

[Demo](https://jsfiddle.net/bahrus/4897cbzj/1/)

```html
<div>
    <a href="https://www.youtube.com/watch?v=2-Lb-JhsaEk" target="_blank">Something's gone wrong again</a>
    <template id="Title">Something's gone wrong again</template>
    <template id="Title2">Something goes wrong again</template>
    <template id="Again">And again</template>
    <template id="Again2">And again, and again, again and something's gone wrong again</template>
    <template id="Again3">And again, and again, again and something goes wrong again</template>
    <template id="Agains">
        <span data-init="Again"></span><br>
        <span data-init="Again2"></span><br>
        <span data-init="Title"></span>
    </template>
    <template id="Agains2">
        <span data-init="Title2"></span><br>
        <span data-init="Again"></span><br>
        <span data-init="Again3"></span><br>
        <span data-init="Title2"></span>
    </template>
    <template id="bus">
        <span>Nothing ever happens to people like us</span><br>
        <span>'Cept we miss the bus, something goes wrong again</span><br>
        <span>Need a smoke, use my last fifty P.</span><br>
        <span>But the machine is broke, something's gone wrong again</span>
    </template>
    <template id="Main">
        <div>
            <span>Tried to find my sock</span><br>
            <span>No good, it's lost</span><br>
            <span data-init="Title"></span><br>
            <span>Need a shave</span><br>
            <span>Cut myself, need a new blade</span><br>
            <span data-init="Title"></span>
        </div>
        <div data-init="Agains"></div>
        <div>
            <span>Tried to fry an egg</span><br>
            <span>Broke the yolk, no joke</span><br>
            <span data-init="Title"></span><br>
            <span>Look at my watch, just to tell the time but the hand's come off mine</span><br>
            <span data-init="Title"></span><br>
            <span data-init="Title"></span>
        </div>
        <div data-init="Agains"></div>
        <div data-init="bus"></div>
        <div data-init="Agains2"></div>
        <div data-init="Agains2"></div>
        <div data-init="bus"></div>
        <div data-init="Agains2"></div>
        <div>
            <span>I turned up early in time for our date</span><br>
            <span>But then you turn up late, something goes wrong again</span><br>
            <span>Need a drink, go to the pub</span><br>
            <span>But the bugger's shut, something goes wrong again</span>
        </div>
        <div>
            <span data-init="Title2"></span><br>
            <span data-init="Again"></span><br>
            <span data-init="Again3"></span><br>
            <span>Ah, something goes wrong again</span><br>
            <span data-init="Title2"></span><br>
            <span data-init="Title2"></span>
        </div>
        <style>
            div{
                padding-top:20px;
            }
        </style>
    </template>
    <div id="target"></div>
        <script type="module">
            import { transform } from '../../lib/transform.js';
            transform(Main, {
                match: {
                    initData: ({target, ctx, val}) =>{
                        transform(self[val], ctx, target);
                    }
                }
            }, target);
        </script>
</div>
```

Transform matches that end with Data, Part, Class, Element, Id, Prop do querySelectorAll within its scope.  In this case, scope is root, so it searches the entire template.

```JavaScript
transform(Main, {
    tr: {
        initData: ({target, ctx, val, idx}) => {
            transform(self[val], ctx, target);
        }
    }
}, target);
```

We searched on data-init attribute, so it passes in the value of data-init as "val".  self[val] gets the named template by id.

## An example of an imperative helper function

Since trans-render is built around css matching, it doesn't provide much help when it comes to string interpolation, something supported by virtually every templating library.  trans-render can support something like this via a reusable, shared transform helper function.  The library trans-render/lib/interpolate.js is provided for this purpose.

