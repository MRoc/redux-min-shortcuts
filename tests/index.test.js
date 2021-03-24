"use strict";

const React = require("react");
const Provider = require("react-redux").Provider;
const { renderHook } = require("@testing-library/react-hooks");
const { handleShortcut, useGlobalShortcuts } = require("../lib/index.js");

function createEvent(key, modifiers) {
  return {
    key: key,
    getModifierState: jest.fn((modifier) => modifiers.includes(modifier)),
    stopPropagation: jest.fn(() => {}),
    preventDefault: jest.fn(() => {}),
  };
}

describe("Test handleShortcut", () => {
  test("With no shortcuts does nothing", () => {
    const event = createEvent("a", []);
    const shortcutBindings = [];
    const dispatch = jest.fn(() => {});

    handleShortcut(event, shortcutBindings, dispatch);

    expect(event.stopPropagation.mock.calls.length).toBe(0);
    expect(event.preventDefault.mock.calls.length).toBe(0);
    expect(dispatch.mock.calls.length).toBe(0);
  });
  test("With key not matching event does nothing", () => {
    const event = createEvent("a", []);
    const shortcutBindings = [{ key: "b", modifiers: ["Control"] }];
    const dispatch = jest.fn(() => {});

    handleShortcut(event, shortcutBindings, dispatch);

    expect(event.stopPropagation.mock.calls.length).toBe(0);
    expect(event.preventDefault.mock.calls.length).toBe(0);
    expect(dispatch.mock.calls.length).toBe(0);
  });
  test("With too many modifiers pressed does nothing", () => {
    const event = createEvent("a", ["Control", "Shift"]);
    const shortcutBindings = [{ key: "a", modifiers: ["Control"] }];
    const dispatch = jest.fn(() => {});

    handleShortcut(event, shortcutBindings, dispatch);

    expect(dispatch.mock.calls.length).toBe(0);
  });
  test("With too few modifiers pressed does nothing", () => {
    const event = createEvent("a", ["Control"]);
    const shortcutBindings = [{ key: "a", modifiers: ["Control", "Shift"] }];
    const dispatch = jest.fn(() => {});

    handleShortcut(event, shortcutBindings, dispatch);

    expect(dispatch.mock.calls.length).toBe(0);
  });
  test("With shortcut matching event calls dispatch", () => {
    const event = createEvent("a", ["Control"]);
    const shortcutBindings = [
      { key: "a", modifiers: ["Control"], action: jest.fn(() => () => {}) },
    ];
    const dispatch = jest.fn((_) => {});

    handleShortcut(event, shortcutBindings, dispatch);

    expect(event.stopPropagation.mock.calls.length).toBe(1);
    expect(event.preventDefault.mock.calls.length).toBe(1);
    expect(shortcutBindings[0].action.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls.length).toBe(1);
  });
  test("With shortcut matching event and passDefault does not call preventDefault", () => {
    const event = createEvent("a", ["Control"]);
    const shortcutBindings = [
      {
        key: "a",
        modifiers: ["Control"],
        action: jest.fn(() => () => {}),
        passDefault: true,
      },
    ];
    const dispatch = jest.fn((_) => {});

    handleShortcut(event, shortcutBindings, dispatch);

    expect(event.stopPropagation.mock.calls.length).toBe(1);
    expect(event.preventDefault.mock.calls.length).toBe(0);
    expect(shortcutBindings[0].action.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls.length).toBe(1);
  });
  test("With shortcut matching event and arguments passes to action creator", () => {
    const event = createEvent("a", ["Control"]);
    const shortcutBindings = [
      {
        key: "a",
        modifiers: ["Control"],
        action: jest.fn((arg) => () => {}),
      },
    ];
    const dispatch = jest.fn((_) => {});
    const arg = { a: "b" };

    handleShortcut(event, shortcutBindings, dispatch, arg);

    expect(shortcutBindings[0].action.mock.calls.length).toBe(1);
    expect(shortcutBindings[0].action.mock.calls[0][0]).toBe(arg);
    expect(dispatch.mock.calls.length).toBe(1);
  });
  test("With shortcut matching but not being ready does not call dispatch", () => {
    const event = createEvent("a", ["Control"]);
    const shortcutBindings = [
      {
        key: "a",
        modifiers: ["Control"],
        action: jest.fn((_) => () => {}),
        isReady: jest.fn((_) => false),
      },
    ];
    const dispatch = jest.fn((_) => {});
    const arg = { a: "b" };

    handleShortcut(event, shortcutBindings, dispatch, arg);

    expect(shortcutBindings[0].isReady.mock.calls.length).toBe(1);
    expect(shortcutBindings[0].isReady.mock.calls[0][0]).toBe(arg);
    expect(dispatch.mock.calls.length).toBe(0);
  });
  test("With shortcut matching and being ready does call dispatch", () => {
    const event = createEvent("a", ["Control"]);
    const dispatch = jest.fn((_) => {});
    const shortcutBindings = [
      {
        key: "a",
        modifiers: ["Control"],
        action: jest.fn((_) => () => {}),
        isReady: jest.fn((_) => true),
      },
    ];
    const arg = { a: "b" };

    handleShortcut(event, shortcutBindings, dispatch, arg);

    expect(shortcutBindings[0].isReady.mock.calls.length).toBe(1);
    expect(shortcutBindings[0].isReady.mock.calls[0][0]).toBe(arg);
    expect(dispatch.mock.calls.length).toBe(1);
  });
});

describe("Test useGlobalShortcuts", () => {
  describe("Call", () => {
    const action = { type: "ACTION_TYPE" };
    const event = createEvent("a", ["Control"]);
    const shortcutBindings = [
      { key: "a", modifiers: ["Control"], action: jest.fn((_) => action) },
    ];

    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();

    const store = {
      dispatch: jest.fn((a) => {}),
      subscribe: jest.fn((a) => {}),
      getState: jest.fn((a) => {}),
    };

    const wrapper = ({ children }) =>
      React.createElement(Provider, { store: store }, children);

    renderHook(() => useGlobalShortcuts(shortcutBindings), { wrapper });

    expect(window.addEventListener.mock.calls.length).toBe(6);
    expect(window.addEventListener.mock.calls[4][0]).toBe("keydown");

    const callback = window.addEventListener.mock.calls[4][1];
    callback(event);

    expect(store.dispatch.mock.calls.length).toBe(1);
    expect(store.dispatch.mock.calls[0][0]).toBe(action);
  });
});
