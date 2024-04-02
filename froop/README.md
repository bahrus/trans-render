


...


What about pulling data in lazily [TODO]

I think, after reading through what the appeal of signals is, and comparing to what FROOP has to offer, that one piece of functionality that is missing is computed properties or methods that return a value, and how to signify dependencies on this when deciding whether to "push" through a change.

I.e. FROOP so far only supports "pushing" changes eagerly, but doesn't yet have a way of declaratively indicating that one of these action methods needs to be invoked, because one of the lazy computed properties or methods that it depends on has changed.

Actually, we can:  simply list it as a dependency in IfAllOf, or ifNoneOf, or ifKeyIn, etc.

But this requires understanding the innards of the computed property / method.

So I think we would benefit from calling subtle.introspectSources to get that list.