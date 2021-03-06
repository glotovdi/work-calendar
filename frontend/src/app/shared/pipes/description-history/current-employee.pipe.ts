import { Pipe, PipeTransform } from '@angular/core';
import { EmployeeStoreService } from '../../../core/store/employee-store.service';
import { Employee } from '../../models/employee.model';
import { TaskModel } from '../../models/tasks.models';

@Pipe({
  name: 'currentEmployee'
})
export class CurrentEmployeePipe implements PipeTransform {
  constructor(private employeeStoreService: EmployeeStoreService) {}

  transform(value: TaskModel): string {
    const employee = this.employeeStoreService
      .getEmployeesSnapshot()
      .find((emp: Employee) => emp.mailNickname === value.employeeCreated);

    if (!employee) return null;
    const result = `${employee.username.split(' ')[0]} ${employee.username.split(' ')[1][0]}.`;

    return result;
  }
}
