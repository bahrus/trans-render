Froop vs Signals:

Signals:

```JavaScript
const counter = new Signal.State(0);
const isEven = new Signal.Computed(() => (counter.get() & 1) == 0);
const parity = new Signal.Computed(() => isEven.get() ? "even" : "odd");

effect(() => element.innerText = parity.get());

// Simulate external updates to counter...
setInterval(() => counter.set(counter.get() + 1), 1000);
```

Froop:

```JavaScript
const evenIs = ({counter}) => ({isEven: counter & 1 === 0});
const parityIs = ({isEven}) => ({parity: isEven ? 'even' : 'odd'});
const innerTextIs = ({parity, element}) => {
    element.innerText = parity;
}
const vm = await froop({count: 0, element, evenIs, parityIs, innerTextIs}, {evenIsOn: 'counter', parityIsOn: 'isEven', innerTextIsOn: 'parity'})

setInterval(() => vm.count++, 1000);
```



What about pulling data in lazily [TODO]

I think, after reading through what the appeal of signals is, and comparing to what FROOP has to offer, that one piece of functionality that is missing is computed properties or methods that return a value, and how to signify dependencies on this when deciding whether to "push" through a change.

I.e. FROOP so far only supports "pushing" changes eagerly, but doesn't yet have a way of declaratively indicating that one of these action methods needs to be invoked, because one of the lazy computed properties or methods that it depends on has changed.

Actually, we can:  simply list it as a dependency in IfAllOf, or ifNoneOf, or ifKeyIn, etc.

But this requires understanding the innards of the computed property / method.

So I think we would benefit from calling subtle.introspectSources to get that list.