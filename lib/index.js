"use strict";

const { useCallback, useEffect } = require("react");
const { useDispatch } = require("react-redux");

function useGlobalShortcuts(bindings) {
  const dispatch = useDispatch();

  const keydownListener = useCallback(
    (event) => handleShortcut(event, bindings, dispatch),
    [bindings, dispatch]
  );

  useEffect(() => {
    window.addEventListener("keydown", keydownListener, true);
    return () => window.removeEventListener("keydown", keydownListener, true);
  }, [keydownListener]);
}

function handleShortcut(event, bindings, dispatch, arg) {
  const binding = bindings.filter(
    (s) => isShortcutPressed(event, s) && isShortcutReady(event, s, arg)
  )[0];

  if (binding) {
    event.stopPropagation();
    if (!binding.passDefault) {
      event.preventDefault();
    }

    const action = binding.action(arg);
    dispatch(action);
  }
}

function getPressedModifiers(event) {
  return ["Alt", "Control", "Shift"].filter((m) => event.getModifierState(m));
}

function isShortcutPressed(event, binding) {
  return (
    event.key === binding.key &&
    areArraysEquivalent(getPressedModifiers(event), binding.modifiers)
  );
}

function isShortcutReady(event, binding, arg) {
  return !binding.isReady || binding.isReady(event, arg);
}

function areArraysEquivalent(a, b) {
  return (
    a.length === b.length && b.filter((x) => a.includes(x)).length === a.length
  );
}

exports.useGlobalShortcuts = useGlobalShortcuts;
exports.handleShortcut = handleShortcut;
exports.isShortcutPressed = isShortcutPressed;
