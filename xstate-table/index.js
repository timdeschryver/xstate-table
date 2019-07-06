import { Machine, actions } from "xstate";
const { assign, send } = actions;

export function findElementsInSelectArea(ctx, selectArea, selector = (_ctx) => [...document.querySelectorAll("[data-row-id]")]) {
  const rows = selector(ctx).filter(row => {
    const { left, right, top, bottom } = row.getBoundingClientRect();

    return (
      selectArea.x1 <= right &&
      selectArea.x2 >= left &&
      selectArea.y1 <= bottom + document.documentElement.scrollTop &&
      selectArea.y2 >= top + document.documentElement.scrollTop
    );
  });
  return rows.map(row => +row.getAttribute("data-row-id"));
}

function selectedIdsInRange(ctx, id) {
  const toIndex = ctx.rows.findIndex(r => r.id === id);
  const prevIndex =
    ctx.prevId >= 0 ? ctx.rows.findIndex(r => r.id === ctx.prevId) : toIndex;

  const minIndex = Math.min(prevIndex, toIndex);
  const maxIndex = Math.max(prevIndex, toIndex);

  const rangeRows = ctx.rows
    .filter((_, index) => index >= minIndex && index <= maxIndex)
    .map(r => r.id);
  return rangeRows;
}

export const tableMachine = Machine(
  {
    id: "table",
    type: "parallel",
    context: {
      rows: [],
      selectedIds: [],
      prevId: undefined,
      x1: undefined,
      y1: undefined,
      selectArea: undefined,
      delay: 0,
      findElementsInSelectArea
    },
    states: {
      state: {
        initial: "idle",
        states: {
          idle: {
            entry: send("reset", {
              delay: "CONFIG_DELAY"
            }),
            on: {
              click: [
                { actions: "ctrlShiftClick", cond: "isCtrlShiftClick" },
                { actions: "ctrlClick", cond: "isCtrlClick" },
                { actions: "shiftClick", cond: "isShiftClick" },
                { actions: "click" }
              ],
              mousedown: {
                target: "dragging",
                actions: "mousedown"
              },
              reset: {
                actions: ["reset", "redrawSelectArea"]
              }
            }
          },
          dragging: {
            on: {
              mousemove: {
                actions: ["mousemove", "redrawSelectArea"]
              },
              mouseup: "idle"
            }
          }
        }
      },
      selection: {
        initial: "unknown",
        on: {
          click: "selection",
          mouseup: "selection",
          mousemove: "selection"
        },
        states: {
          unknown: {
            on: {
              "": [
                {
                  target: "SINGLE_SELECTION",
                  cond: "hasSingleSelection"
                },
                {
                  target: "MULTI_SELECTION",
                  cond: "hasMultipleSelections"
                },
                {
                  target: "EMPTY_SELECTION",
                }
              ]
            }
          },
          SINGLE_SELECTION: {},
          MULTI_SELECTION: {},
          EMPTY_SELECTION: {}
        }
      }
    }
  },
  {
    actions: {
      click: assign((ctx, { id }) => {
        return {
          selectArea: undefined,
          prevId: id,
          selectedIds: [id]
        };
      }),
      ctrlClick: assign((ctx, { id }) => {
        if (ctx.selectedIds.includes(id)) {
          return {
            selectArea: undefined,
            prevId: id,
            selectedIds: ctx.selectedIds.filter(r => r !== id)
          };
        }

        return {
          selectArea: undefined,
          prevId: id,
          selectedIds: ctx.selectedIds.concat(id)
        };
      }),
      shiftClick: assign((ctx, { id }) => {
        const selectedIds = selectedIdsInRange(ctx, id);
        return {
          selectArea: undefined,
          selectedIds
        };
      }),
      ctrlShiftClick: assign((ctx, { id }) => {
        const selectedIds = selectedIdsInRange(ctx, id);
        return {
          selectArea: undefined,
          selectedIds: [...new Set(ctx.selectedIds.concat(selectedIds))]
        };
      }),
      mousedown: assign((_, { evt }) => {
        return {
          x1: evt.pageX,
          y1: evt.pageY
        };
      }),
      mousemove: assign((ctx, { evt }) => {
        const selectArea = {
          x1: Math.min(ctx.x1, evt.pageX),
          y1: Math.min(ctx.y1, evt.pageY),
          x2: Math.max(ctx.x1, evt.pageX),
          y2: Math.max(ctx.y1, evt.pageY)
        };

        const idsInArea = (ctx.findElementsInSelectArea ||
          findElementsInSelectArea)(ctx, selectArea);
        const selectedIds = evt.ctrlKey
          ? ctx.selectedIds.concat(idsInArea)
          : idsInArea;

        return {
          selectArea,
          selectedIds
        };
      }),
      reset: assign(() => ({
        x1: undefined,
        y1: undefined,
        selectArea: undefined
      })),
      redrawSelectArea: (ctx) => {
        if(ctx.selectArea) {
          document.documentElement.style.setProperty('--mouse-x1', ctx.selectArea.x1 + 'px');
          document.documentElement.style.setProperty('--mouse-y1', ctx.selectArea.y1 + 'px');
          document.documentElement.style.setProperty('--mouse-x2', ctx.selectArea.x2 + 'px');
          document.documentElement.style.setProperty('--mouse-y2', ctx.selectArea.y2 + 'px');
        } else {
          document.documentElement.style.setProperty('--mouse-x1', '0');
          document.documentElement.style.setProperty('--mouse-y1', '0');
          document.documentElement.style.setProperty('--mouse-x2', '0');
          document.documentElement.style.setProperty('--mouse-y2', '0');
        }
      }
    },
    guards: {
      hasSingleSelection: ctx => ctx.selectedIds.length === 1,
      hasMultipleSelections: ctx => ctx.selectedIds.length > 1,
      isCtrlShiftClick: (_, { evt }) => evt.ctrlKey && evt.shiftKey,
      isCtrlClick: (_, { evt }) => evt.ctrlKey,
      isShiftClick: (_, { evt }) => evt.shiftKey
    },
    delays: {
      CONFIG_DELAY: context => context.delay
    }
  }
);
