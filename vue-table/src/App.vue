<template>
  <div id="app">
    <div v-bind:data-state="current.toStrings()">
      <div class="selectbox"></div>

      <div>
        <button>New</button>
        <button :disabled="!current.matches('selection.SINGLE_SELECTION')">Open</button>
        <button :disabled="current.matches('selection.EMPTY_SELECTION')">Delete</button>

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
            <tr
              v-for="row in current.context.rows"
              v-bind:key="row.id"
              v-bind:data-row-id="row.id"
              v-on:click="evt => send({type: evt.type, evt, id: row.id})"
              v-bind:class="{ selected: current.context.selectedIds.includes(row.id) }"
              ref="rows"
            >
              <td>{{row.id}}</td>
              <td>{{row.name}}</td>
              <td>{{row.address}}</td>
              <td>{{row.email}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { interpret } from "xstate";
import faker from "faker";
import { tableMachine, findElementsInSelectArea } from "xstate-table";

export default {
  name: "Vue-Table",
  created() {
    this.toggleService
      .onTransition(state => {
        this.current = state;
      })
      .start();
  },
  data() {
    const machine = tableMachine.withConfig(
      {},
      {
        rows: Array.from({ length: 100 }, (_, i) => ({
          id: i + 10000,
          name: faker.name.findName(),
          address: faker.address.streetAddress(),
          email: faker.internet.email()
        })),
        selectedIds: [10002],
        delay: 300,
        findElementsInSelectArea: (ctx, selectArea) =>
          findElementsInSelectArea(ctx, selectArea, () => this.$refs.rows)
      }
    );

    return {
      toggleService: interpret(machine),
      current: machine.initialState
    };
  },
  mounted() {
    window.addEventListener("mousedown", evt =>
      this.send({ type: evt.type, evt })
    );
    window.addEventListener("mousemove", evt =>
      this.send({ type: evt.type, evt })
    );
    window.addEventListener("mouseup", evt =>
      this.send({ type: evt.type, evt })
    );
  },
  methods: {
    send(event) {
      this.toggleService.send(event);
    }
  }
};
</script>

<style>
:root {
  --theme-color: #42b883;
}
</style>
