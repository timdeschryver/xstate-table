import React, { useRef, useEffect } from 'react';
import { tableMachine, findElementsInSelectArea } from 'xstate-table';
import { useMachine } from '@xstate/react';
import faker from 'faker';

function App() {
  const [state, send] = useMachine<any, any>(tableMachine.withConfig(
    {
    },
    {
      rows: Array.from({ length: 100 }, (_, i) => ({
        id: i + 10000,
        name: faker.name.findName(), 
        address: faker.address.streetAddress(), 
        email: faker.internet.email(), 
        ref: React.createRef()
      })),
      selectedIds: [10002],
      delay: 300,
      findElementsInSelectArea: (ctx, selectArea) => findElementsInSelectArea(ctx, selectArea, ctx => ctx.rows.map(r => r.ref.current))
    }
  ));

  const mouseEvent = evt => send({type: evt.type, evt})
  
  useEventListener('mousedown', mouseEvent);
  useEventListener('mousemove', mouseEvent);
  useEventListener('mouseup', mouseEvent);

  const rows = state.context.rows.map(row => {
     const className = state.context.selectedIds.includes(row.id) ? 'selected' : '';
     return (
      <tr 
        key={row.id} 
        data-row-id={row.id} 
        ref={row.ref}
        onClick={evt => send({type: evt.type, evt, id: row.id })} 
        className={className}>
          <td>{row.id}</td>
          <td>{row.name}</td>
          <td>{row.address}</td>
          <td>{row.email}</td>
      </tr>
     )
  });

  
  return (
    <div data-state={state.toStrings()}>
      <div className="selectbox"></div>
      <div>
        <button>New</button>
        <button disabled={!state.matches('selection.SINGLE_SELECTION')}>Open</button>
        <button disabled={state.matches('selection.EMPTY_SELECTION')}>Delete</button>

        <table>
            <thead>
              <tr>
                <th>Id</th>
                <th>Name</th>
                <th>Address</th>
                <th>Email</th>
                </tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;

// https://usehooks.com/useEventListener/
function useEventListener(eventName, handler, element = document.body){
  // Create a ref that stores handler
  const savedHandler = useRef();
  
  // Update ref.current value if handler changes.
  // This allows our effect below to always get latest handler ...
  // ... without us needing to pass it in effect deps array ...
  // ... and potentially cause effect to re-run every render.
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(
    () => {
      // Make sure element supports addEventListener
      const isSupported = element && element.addEventListener;
      if (!isSupported) return;
      
      // Create event listener that calls handler function stored in ref
      const eventListener = event => (savedHandler as any).current(event);
      
      // Add event listener
      element.addEventListener(eventName, eventListener);
      
      // Remove event listener on cleanup
      return () => {
        element.removeEventListener(eventName, eventListener);
      };
    },
    [eventName, element] // Re-run if eventName or element changes
  );
};