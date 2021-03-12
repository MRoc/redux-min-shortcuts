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
