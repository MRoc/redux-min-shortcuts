import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";

function isShortcutBindingPressed(shortcutBinding, key, modifiers) {
  return (
    key === shortcutBinding.key &&
    shortcutBinding.modifiers.filter((x) => modifiers.includes(x)).length ===
      shortcutBinding.modifiers.length
  );
}

function isShortcutBindingReady(shortcutBinding, arg) {
  return !shortcutBinding.isReady || shortcutBinding.isReady(arg);
}

export function handleShortcut(event, shortcutBindings, dispatch, arg) {
  const key = event.key;
  const modifiers = ["Alt", "Control", "Shift"].filter((m) =>
    event.getModifierState(m)
  );

  const shortcutBinding = shortcutBindings.filter(
    (s) =>
      isShortcutBindingPressed(s, key, modifiers) &&
      isShortcutBindingReady(s, arg)
  )[0];

  if (shortcutBinding) {
    event.stopPropagation();
    if (!shortcutBinding.passDefault) {
      event.preventDefault();
    }

    const action = shortcutBinding.action(arg);
    dispatch(action);
  }
}

export function useGlobalShortcuts(shortcutBindings) {
  const dispatch = useDispatch();

  const keydownListener = useCallback(
    (event) => handleShortcut(event, shortcutBindings, dispatch),
    [shortcutBindings, dispatch]
  );

  useEffect(() => {
    window.addEventListener("keydown", keydownListener, true);
    return () => window.removeEventListener("keydown", keydownListener, true);
  }, [keydownListener]);
}
