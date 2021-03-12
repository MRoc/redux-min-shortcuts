import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";

export function handleShortcut(event, commands, dispatch, arg) {
  const key = event.key;
  const modifiers = ["Alt", "Control", "Shift"].filter((m) =>
    event.getModifierState(m)
  );

  const command = commands.filter(
    (c) =>
      key === c.key &&
      c.modifiers.filter((x) => modifiers.includes(x)).length ===
        c.modifiers.length
  )[0];
  if (command) {
    event.stopPropagation();
    if (!command.passDefault) {
      event.preventDefault();
    }
    if (command.action.length === 0) {
      dispatch(command.action());
    } else {
      dispatch(command.action(arg));
    }
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
