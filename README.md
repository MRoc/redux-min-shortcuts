# Shortcuts for Redux

The package provides a small API for creating and dispatching redux actions triggered by shortcuts.

Passing the events to `handleShortcut` needs to be done by client code.

# Installation

```
npm install redux-min-shortcuts
```

## Example 1

Example using hooks binding Undo/Redo to Ctrl+Z/Ctrl+Y for `redux-undo` package. All required is to call `useGlobalShortcuts` with a list of shortcuts-to-action-creators array:

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

## Example 2

Calling `handleShortcut` directly without registering global shortcuts is easy:

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