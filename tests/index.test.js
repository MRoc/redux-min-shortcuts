"use strict";

const React = require("react");
const Provider = require("react-redux").Provider;
const { renderHook } = require("@testing-library/react-hooks");
const { handleShortcut, useGlobalShortcuts } = require("../lib/index.js");

describe("Test handleShortcut", () => {
  test("With no shortcuts does nothing", () => {
    const event = {
      key: "a",
      getModifierState: jest.fn((_) => true),
      stopPropagation: jest.fn(() => {}),
      preventDefault: jest.fn(() => {}),
    };
    const dispatch = jest.fn(() => {});
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
      getModifierState: jest.fn((_) => true),
      stopPropagation: jest.fn(() => {}),
      preventDefault: jest.fn(() => {}),
    };
    const dispatch = jest.fn(() => {});
    const shortcutBindings = [
      {
        key: "b",
        modifiers: ["Control"],
      },
    ];

    handleShortcut(event, shortcutBindings, dispatch);

    expect(event.getModifierState.mock.calls.length).toBe(3);
    expect(event.stopPropagation.mock.calls.length).toBe(0);
    expect(event.preventDefault.mock.calls.length).toBe(0);
    expect(dispatch.mock.calls.length).toBe(0);
  });
  test("With shortcut matching event calls dispatch", () => {
    const event = {
      key: "a",
      getModifierState: jest.fn((_) => true),
      stopPropagation: jest.fn(() => {}),
      preventDefault: jest.fn(() => {}),
    };
    const dispatch = jest.fn((_) => {});
    const shortcutBindings = [
      {
        key: "a",
        modifiers: ["Control"],
        action: jest.fn(() => () => {}),
      },
    ];

    handleShortcut(event, shortcutBindings, dispatch);

    expect(event.getModifierState.mock.calls.length).toBe(3);
    expect(event.stopPropagation.mock.calls.length).toBe(1);
    expect(event.preventDefault.mock.calls.length).toBe(1);
    expect(shortcutBindings[0].action.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls.length).toBe(1);
  });
  test("With shortcut matching event and passDefault does not call preventDefault", () => {
    const event = {
      key: "a",
      getModifierState: jest.fn((_) => true),
      stopPropagation: jest.fn(() => {}),
      preventDefault: jest.fn(() => {}),
    };
    const dispatch = jest.fn((_) => {});
    const shortcutBindings = [
      {
        key: "a",
        modifiers: ["Control"],
        action: jest.fn(() => () => {}),
        passDefault: true,
      },
    ];

    handleShortcut(event, shortcutBindings, dispatch);

    expect(event.getModifierState.mock.calls.length).toBe(3);
    expect(event.stopPropagation.mock.calls.length).toBe(1);
    expect(event.preventDefault.mock.calls.length).toBe(0);
    expect(shortcutBindings[0].action.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls.length).toBe(1);
  });
  test("With shortcut matching event and arguments passes to action creator", () => {
    const event = {
      key: "a",
      getModifierState: jest.fn((_) => true),
      stopPropagation: jest.fn(() => {}),
      preventDefault: jest.fn(() => {}),
    };
    const dispatch = jest.fn((_) => {});
    const shortcutBindings = [
      {
        key: "a",
        modifiers: ["Control"],
        action: jest.fn((arg) => () => {}),
      },
    ];
    const arg = { a: "b" };

    handleShortcut(event, shortcutBindings, dispatch, arg);

    expect(shortcutBindings[0].action.mock.calls.length).toBe(1);
    expect(shortcutBindings[0].action.mock.calls[0][0]).toBe(arg);
    expect(dispatch.mock.calls.length).toBe(1);
  });
  test("With shortcut matching but not being ready does not call dispatch", () => {
    const event = {
      key: "a",
      getModifierState: jest.fn((_) => true),
      stopPropagation: jest.fn(() => {}),
      preventDefault: jest.fn(() => {}),
    };
    const dispatch = jest.fn((_) => {});
    const shortcutBindings = [
      {
        key: "a",
        modifiers: ["Control"],
        action: jest.fn((_) => () => {}),
        isReady: jest.fn((_) => false),
      },
    ];
    const arg = { a: "b" };

    handleShortcut(event, shortcutBindings, dispatch, arg);

    expect(shortcutBindings[0].isReady.mock.calls.length).toBe(1);
    expect(shortcutBindings[0].isReady.mock.calls[0][0]).toBe(arg);
    expect(dispatch.mock.calls.length).toBe(0);
  });
  test("With shortcut matching and being ready does call dispatch", () => {
    let x;
    const event = {
      key: "a",
      getModifierState: jest.fn((_) => true),
      stopPropagation: jest.fn(() => {}),
      preventDefault: jest.fn(() => {}),
    };
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

    const shortcutBindings = [
      {
        key: "a",
        modifiers: ["Control"],
        action: jest.fn((_) => action),
      },
    ];

    const event = {
      key: "a",
      getModifierState: jest.fn((_) => true),
      stopPropagation: jest.fn(() => {}),
      preventDefault: jest.fn(() => {}),
    };

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
