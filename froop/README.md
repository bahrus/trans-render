# Roundabouts vs Signals

The world needs both traffic signals and roundabouts.  This shouldn't be an either or.

Signals:

```JavaScript
const counter = new Signal.State(0);
const isEven = new Signal.Computed(() => (counter.get() & 1) == 0);
const parity = new Signal.Computed(() => isEven.get() ? "even" : "odd");

effect(() => element.innerText = parity.get());

// Simulate external updates to counter...
setInterval(() => counter.set(counter.get() + 1), 1000);
```

Roundabouts:

<img src="https://www.trafficdepot.ca/wp-content/uploads/2020/08/reg6bb.png" height="250px">

```JavaScript
const checkIfEven = ({counter}) => ({isEven: counter & 1 === 0});
const determineParity = ({isEven}) => ({parity: isEven ? 'even' : 'odd'});
const setInnerText = ({parity}) => ({'?.element?.innerText': parity};
const [vm, propagator] = await roundabout(
    {element, checkIfEven, determineParity, innerText}, 
    {   
        propagate: {count: 0},
        do_checkIfEven_on: 'count', do_determineParity_on: 'isEven', do_setInnerText_on: 'parity'
    }
);

setInterval(() => vm.count++, 1000);
```

Same number of statements, but for roundabout, one of the statements is admittedly long.

All the functions are side effect free and don't do any state mutation at all!  Purely functional.

roundabout can JSON serialize one of the arguments, making parsing the instructions easier on the browser.

roundabout does require manually figuring out the dependencies ("sources"), but the silver lining is it gives the user more transparent power, especially as they can direct traffic based on truthy conditions.  For example:

```JavaScript
const [vm, propagator] = await roundabout(
    {element, checkIfEven, determineParity, setInnerText}, 
    {   
        propagate: {count: 0},
        do_checkIfEven_on: 'count', do_determineParity_on: 'isEven',
        setInnerText: {
            ifAllOf: ['count', 'isEven', 'parity']
        }
    }
);
```

That manual calculation could be done during compile time.

Less run time analysis?

Fewer (nested) parenthesis.

State is all in one place -- the vm, which could also be the custom element class.

Lower learning curve?

roundabout also doesn't execute code if the field value is unchanged.

No pub/sub required!

No creation of getters/setters required (other than count)!

Basically, what round about does is looks at what subset of properties of the view model is returned from the action methods (checkIfEven, determineParity, setInnerText), and directs traffic accordingly after doing an Object.assignGingerly.

propagator is an EventTarget, that publishes events when the propagate properties are changed (just count).

What standard would help?

1.  Object.assignGingerly.

2.  Being able to publish the dependencies in a uniform way:

```JavaScript
const parity = ({isEven}) => ({parity: isEven ? 'even' : 'odd'});
parity.do = {
    on: 'isEven'.
    if: [],
    ifOneOf:[],
    ifEquals:[],
    etc.
}
```

which must be JSON serializable.

3.  Reducing the footprint

Maybe this could be done with decorators

<!--
roundabout could support deep memoization (parity), which seems like a good idea
-->



