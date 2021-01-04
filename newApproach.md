Take 3

trans-render limits scope.

Not designed for binding a single element -- that can be handled by xtal-element's PEA support.

Doesn't need to support what can be supported by custom elements -- loops, conditionals

Use cases:

Interpolation
tag replacement 

supportsGeneralQuery by ending:  part, class, data, element

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
        import { transform } from '../transform.js';
        transform(Main, {
            : {
                initData: ({target, ctx}) => {
                    transform(self[target.dataset.init], ctx, target);
                }
            }
        }, target);
    </script>
</div>
```

things that end with Data, Part, Class, Element, Id do querySelectorAll within its scope.  In this case, scope is root, so it searches all

```JavaScript
transform(Main, {
    tr: {
        initData: ({target, ctx, val, idx}) => {
            transform(self[val], ctx, target);
        }
    }
}, target);
```

We search on data-init, so pass in the value of data-init as "val"

```JavaScript
transform(Main, {
    tr: {
        initData: ({val}) => [self[val]]
    },
    ps: [
        {
            type: Array,
            do: doTuple,
            moduleLookup: {
                type: HTMLTemplateElement
                do: doTupleTemplate
            }
        }
    ]
}, target);
```

doTuple custom  function (part of Array with first element a template means clone and append, continue transforming recursively)

