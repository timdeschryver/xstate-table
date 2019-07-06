<script>
  import faker from "faker";
  import { useMachine } from "./useMachine";
  import { tableMachine } from "xstate-table";

  const { state, send } = useMachine(
    tableMachine.withConfig(
      {
      },
      {
        rows: Array.from({ length: 100 }, (_, i) => ({
          id: i + 10000,
          name: faker.name.findName(), 
          address: faker.address.streetAddress(), 
          email: faker.internet.email(), 
          ref: null // https://github.com/sveltejs/svelte/issues/2806
        })),
        selectedIds: [10002],
        delay: 300,
      }
    )
  );

  $: context = $state.context;
</script>

<style>
  :global(:root) {
    --theme-color: rgb(255, 62, 0);
  }
</style>

<svelte:body  
  on:mousedown={(evt) => send({type: evt.type, evt})}
  on:mousemove={(evt) => send({type: evt.type, evt})}
  on:mouseup={(evt) => send({type: evt.type, evt})}
/>

<div data-state={$state.toStrings()}>
  <div class="selectbox"></div>

  <div>
      <button>New</button>
      <button disabled={!$state.matches('selection.SINGLE_SELECTION')}>Open</button>
      <button disabled={$state.matches('selection.EMPTY_SELECTION')}>Delete</button>

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
          {#each context.rows as row, index}
            <tr
              data-row-id={row.id}
              on:click={evt => send({type: evt.type, evt, id: row.id})}
              class:selected={context.selectedIds.includes(row.id)}>
              <td>{row.id}</td>
              <td>{row.name}</td>
              <td>{row.address}</td>
              <td>{row.email}</td>
            </tr>
          {/each}
        </tbody>
      </table>
  </div>
</div>