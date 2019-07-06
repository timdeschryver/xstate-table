import { readable } from "svelte/store";
import { interpret } from "xstate";

export function useMachine(machine, options) {
  const service = interpret(machine, options);

  const store = readable(machine.initialState, set => {
    service.onTransition(state => {
      if (state.changed) {
        set(state);
      }
    });

    service.start();

    return () => {
      service.stop();
    };
  });

  return {
    state: store,
    send: service.send
  };
}
