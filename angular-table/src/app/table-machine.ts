import { Injectable, OnDestroy } from "@angular/core";
import { interpret, Interpreter, Machine, StateMachine } from "xstate";
import { fromEventPattern, Subject, Observable, Subscription } from "rxjs";

@Injectable()
export class TableMachine implements OnDestroy {
  subs = new Subscription();
  actions$ = new Subject();
  state$: Observable<any>;

  private service: Interpreter<any, any, any>;

  setupMachine(machine: StateMachine<any, any, any>) {
    this.service = interpret(machine);

    this.state$ = fromEventPattern(
      (handler: any) => {
        this.service.onTransition(handler).start();

        return this.service;
      },
      (handler, service) => service.stop()
    );

    this.subs.add(this.actions$.subscribe(this.service.send));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
