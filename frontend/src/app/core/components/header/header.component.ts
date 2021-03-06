import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AppRoutingModule } from '../../../routing/app-routing.module';
import { Employee } from '../../../shared/models/employee.model';
import { ContextStoreService } from '../../store/context-store.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() mobileMenuClick = new EventEmitter<void>();

  public currentUser$: Observable<Employee>;

  constructor(private router: Router, private contextStoreService: ContextStoreService) {}

  ngOnInit() {
    this.currentUser$ = this.contextStoreService.getCurrentUser$();
  }

  onSwipe(evt: { deltaX: number }): void {
    const toRight = Math.abs(evt.deltaX) > 40 && evt.deltaX > 0;
    const increment = toRight === true ? -1 : 1;

    const nextRoute = AppRoutingModule.getNext(this.router, increment);
    this.router.navigate([nextRoute]);
  }
}
