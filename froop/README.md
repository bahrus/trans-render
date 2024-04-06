# Roundabouts vs Signals

The world needs both traffic signals and roundabouts.  This shouldn't be an either or.

Signals:

<img align="right" src="https://github.com/proposal-signals/proposal-signals/blob/main/signals-logo.png" alt="Signals logo" width="100" style="max-width: 100%;">

```JavaScript
const counter = new Signal.State(0);
const isEven = new Signal.Computed(() => (counter.get() & 1) == 0);
const parity = new Signal.Computed(() => isEven.get() ? "even" : "odd");

effect(() => element.innerText = parity.get());

// Simulate external updates to counter...
setInterval(() => counter.set(counter.get() + 1), 1000);
```

Roundabouts:

<img align="right" src="https://www.trafficdepot.ca/wp-content/uploads/2020/08/reg6bb.png" width="100px">

```JavaScript
const checkIfEven = ({counter}) => ({isEven: counter & 1 === 0});
const determineParity = ({isEven}) => ({parity: isEven ? 'even' : 'odd'});
const setInnerText = ({parity}) => ({'?.element?.innerText': parity};
const [vm, propagator] = await roundabout(
    {element, checkIfEven, determineParity, setInnerText}, 
    { propagate: {count: 0}}
);

setInterval(() => vm.count++, 1000);
```

Same number of statements.

All the functions are side effect free and don't do any state mutation at all.  Purely functional.

roundabout can JSON serialize one of the arguments, making parsing the instructions easier on the browser.

roundabout "guesses" when the developer wants to call the functions to compute new values, if not specified, based on the lhs of the arrow expression.  But developers can take hold of the reigns, and decide for themselves:

```JavaScript
const [vm, propagator] = await roundabout(
    {element, checkIfEven, determineParity, setInnerText}, 
    {   
        propagate: {count: 0},
        actions:{
            do_checkIfEven_on: 'count', do_determineParity_on: 'isEven',
            setInnerText: {
                ifAllOf: ['count', 'isEven', 'parity']
            }
        }
        
    }
);
```

I suspect this will require less run time analysis?

It certainly benefits from fewer (nested) parenthesis.

State is all in one place -- the vm, which could also be the custom element class instance.

Lower learning curve?

roundabout also doesn't execute code if the field value is unchanged.

No pub/sub required!

No creation of getters/setters required (other than count)!

Basically, what round about does is it looks at what subset of properties of the view model is returned from the action methods (checkIfEven, determineParity, setInnerText), and directs traffic accordingly after doing an Object.assignGingerly.

propagator is an EventTarget, that publishes events when the propagate properties are changed (just count).



<!--
roundabout could support deep memoization (parity), which seems like a good idea
-->

## How to be roundabout ready

For a class to be optimized to work most effectively with roundabouts, it should implement interface RoundaboutReady:

```TypeScript
interface RoundaboutReady{
    /**
     * Allow for assigning to read only props via the "backdoor"
     * Bypasses getters / setters, sets directly to (private) memory slots
     * Doesn't do any notification
     * Allows for nested property setting
    */
    covertAssignment(obj: any): void;

    /**
     * fires event with name matching the name of the property when the value changes (but not via covertAssignment)
     * when property is set via public interface, not via an action method's return object
     */
    get propagator() : EventTarget;
}
```

## Busses and compacts

Being designed to reduce its carbon footprint, roundabouts has first-class support for both busses and compacts.



