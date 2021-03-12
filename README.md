# Shortcuts for Redux

The package provides a small API for creating and dispatching redux actions triggered by keyboard shortcuts.

# Installation

```
npm install redux-min-shortcuts
```

## Example with react hooks

Example using hooks binding Undo/Redo to Ctrl+Z/Ctrl+Y for `redux-undo` package. All required is to call `useGlobalShortcuts()` with a list of shortcuts-to-action-creators array:

```
import { useGlobalShortcuts } from "redux-min-shortcuts";
import { ActionCreators } from "redux-undo";

const shortcutBindings = [
  { key: "z", modifiers: ["Control"], action: ActionCreators.undo },
  { key: "y", modifiers: ["Control"], action: ActionCreators.redo },
];

function App() {

  useGlobalShortcuts(shortcutBindings);

  return <div className="App" />;
}

export default App;
```

## Example without react hooks and custom arguments

Calling `handleShortcut()` directly without registering global shortcuts is easy. This way, an argument can be passed down to the action creator:

```
import { useDispatch } from "react-redux";
import { handleShortcut } from "redux-min-shortcuts";

function App() {

  const shortcutBindings = [
    { key: "z", modifiers: ["Control"], action: ActionCreators.undo },
    { key: "y", modifiers: ["Control"], action: ActionCreators.redo },
  ];

  const dispatch = useDispatch();

  const handleChildKeyDown = (event, myArgument) => {
    handleShortcut(event, shortcutBindings, dispatch, myArgument);
  };

  return <div className="App" onChildKeyDown="handleChildKeyDown" />;
}

handleShortcut(event, nodesShortcutBindings, dispatch, node);
```

## Notes

### Shortcut binding

The shortcut binding consists out of a `key`, a collection of `modifiers`-keys, an function that can create an `action`:

```
{
  key: "a",
  modifiers: ["Control", "Shift"],
  action: myActionCreator,
}
```

An optional callback `isReady` can be specified to check if the shortcut binding is currently active or not. It will get called back everytime the user presses the keyboard shortcut. It get's passed the arguments that are passed into `handleShortcuts()`. If the binding is not ready, the event is not processed and neither `stopPropagation()` nor `preventDefault()` gets called:

```
{
  key: "a",
  modifiers: ["Control", "Shift"],
  isReady: (myArgument) => myArgument.isReady
  action: myActionCreator,
}
```

An optional property is `passDefault` which prevents `preventDefault()` being called even even if the keyboard shortcut was detected and will be executed. This allows a shortcut to execute custom code but at the same time be handled by the browsers default implementation: 

```
{
  key: "a",
  modifiers: ["Control", "Shift"],
  action: myActionCreator,
  passDefault: true
}
```

### Precedence

The shortcuts need to be provided in order of precedence which means if you want to support `Ctrl+A` and `Ctrl+Shift+A`, the second needs to be before the first in the array:

```
const shortcutBindings = [
  { key: "a", modifiers: ["Control", "Shift"], action: myActionCreator },
  { key: "a", modifiers: ["Control"], action: myActionCreator },
];
```

### Propagation (stopPropagation)

If a event is handled, `event.stopPropagation()` is always called.

### Default (preventDefault)

If a event is handled, by default `event.preventDefault()` is called. If it should not be called, the argument `passDefault: true` needs to be passed to the object:

```
  { key: "y", modifiers: ["Control"], action: ActionCreators.redo, passDefault: true },
```