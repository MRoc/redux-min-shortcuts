import { handleShortcut } from "../lib/index.js";

describe("Test handleShortcut", () => {
  test("With no shortcuts does nothing", () => {
    const event = {
        key: "a",
        getModifierState: jest.fn((m) => true),
        stopPropagation: jest.fn((m) => {}),
        preventDefault: jest.fn((m) => {}),
     };
    const dispatch = jest.fn((a) => {});
    const shortcutBindings = [];

    handleShortcut(event, shortcutBindings, dispatch);

    expect(event.getModifierState.mock.calls.length).toBe(3);
    expect(event.stopPropagation.mock.calls.length).toBe(0);
    expect(event.preventDefault.mock.calls.length).toBe(0);
    expect(dispatch.mock.calls.length).toBe(0);
  });
  test("With shortcut not matching event does nothing", () => {
    const event = {
        key: "a",
        getModifierState: jest.fn((m) => true),
        stopPropagation: jest.fn((m) => {}),
        preventDefault: jest.fn((m) => {}),
     };
    const dispatch = jest.fn((a) => {});
    const shortcutBindings = [ {
        key: "b",
        modifiers: ["Control"]
    }];

    handleShortcut(event, shortcutBindings, dispatch);

    expect(event.getModifierState.mock.calls.length).toBe(3);
    expect(event.stopPropagation.mock.calls.length).toBe(0);
    expect(event.preventDefault.mock.calls.length).toBe(0);
    expect(dispatch.mock.calls.length).toBe(0);
  });
  test("With shortcut matching event calls dispatch", () => {
    const event = {
        key: "a",
        getModifierState: jest.fn((m) => true),
        stopPropagation: jest.fn((m) => {}),
        preventDefault: jest.fn((m) => {}),
     };
    const dispatch = jest.fn((a) => {});
    const shortcutBindings = [ {
        key: "a",
        modifiers: ["Control"],
        action: jest.fn((m) => () =>{})
    }];

    handleShortcut(event, shortcutBindings, dispatch);

    expect(event.getModifierState.mock.calls.length).toBe(3);
    expect(event.stopPropagation.mock.calls.length).toBe(1);
    expect(event.preventDefault.mock.calls.length).toBe(1);
    expect(shortcutBindings[0].action.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls.length).toBe(1);
  });
});
