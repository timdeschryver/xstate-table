import {
  Component,
  HostListener,
  ViewChildren,
  QueryList,
  ElementRef,
  OnInit
} from "@angular/core";
import { tableMachine, findElementsInSelectArea } from "xstate-table";
import faker from "faker";
import { TableMachine } from "./table-machine";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  providers: [TableMachine]
})
export class AppComponent implements OnInit {
  title = "angular-table";

  @ViewChildren("rows", { read: ElementRef }) rows: QueryList<ElementRef>;

  constructor(public machine: TableMachine) {}

  ngOnInit() {
    this.machine.setupMachine(
      tableMachine.withConfig(
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
            findElementsInSelectArea(ctx, selectArea, () =>
              this.rows.toArray().map(r => r.nativeElement)
            )
        }
      )
    );
  }

  rowClick(evt, id) {
    this.machine.actions$.next({ type: evt.type, evt, id });
  }

  @HostListener("body:mousedown", ["$event"])
  @HostListener("body:mousemove", ["$event"])
  @HostListener("body:mouseup", ["$event"])
  mouse(evt: MouseEvent) {
    this.machine.actions$.next({ type: evt.type, evt });
  }
}
