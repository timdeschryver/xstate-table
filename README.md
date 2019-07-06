# XState-table

An experiment to create a table with behavior and to be able to re-use the code across frameworks.
Every framework has its own template language, but the behavior code can be shared because it's using XState.

The table can:

- single select
- multiple select with ctrl
- select range with shift
- select multiple ranges with ctrl+shift
- multiple select via drag
- disable action buttons based on selection

## Examples

- [Angular](https://stackblitz.com/edit/xstate-angular-table)
- [React](https://codesandbox.io/s/1dtmk)
- [Svelte](https://codesandbox.io/s/yb6lq)
- [Vue](https://codesandbox.io/s/707t4)

## This repository

To run the code for a framework:

- first install the dependencies (with `npm install` or `yarn`) in the root folder (this step is needed to copy the `xstate-table` code)
- move to the specific folder and install the dependencies
