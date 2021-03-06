import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { ContextStoreService } from '../../../core/store/context-store.service';
import { EmployeeStoreService } from '../../../core/store/employee-store.service';
import { TaskModel } from '../../../shared/models/tasks.models';

@Component({
  selector: 'app-description-history',
  templateUrl: './description-history.component.html',
  styleUrls: ['./description-history.component.scss']
})
export class DescriptionHistoryComponent implements OnInit, OnDestroy {
  @Input() tasks$: Observable<TaskModel[]>;

  public tasks: TaskModel[];
  public displayedColumns: string[];
  private tasksSubscription: Subscription;

  constructor(private contextStoreService: ContextStoreService, private employeeStoreService: EmployeeStoreService) {}

  ngOnInit() {
    this.setDisplayedColumns();
    this.getInfoFromStore();
  }

  ngOnDestroy(): void {
    this.tasksSubscription.unsubscribe();
  }

  private getInfoFromStore() {
    const combined = combineLatest(this.tasks$, this.contextStoreService.getCurrentDate$());
    this.tasksSubscription = combined.subscribe(([one, two]) => {
      this.tasks = one.filter(el => el.dateStart.isSame(two));
    });
  }

  private setDisplayedColumns() {
    this.displayedColumns = ['date', 'who', 'type', 'comment'];
  }
}
