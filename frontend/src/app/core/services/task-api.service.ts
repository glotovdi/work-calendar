import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Employee } from '../../shared/models/employee.model';
import { SendingTaskModel } from '../../shared/models/sending-task.model';
import { TaskModel } from '../../shared/models/tasks.models';

@Injectable({
  providedIn: 'root'
})
export class TaskApiService {
  constructor(private http: HttpClient) {}

  public addTask(task: SendingTaskModel): Observable<any> {
    return this.http.post<Employee>('/backend/tasks', task);
  }

  public loadAllTasks(): Observable<TaskModel[]> {
    return this.http.get<TaskModel[]>('/backend/tasks');
  }

  public loadAllTasksByAuthor(author: string): Observable<TaskModel[]> {
    return this.http.get<TaskModel[]>(`/backend/tasks/${author}`);
  }
}
