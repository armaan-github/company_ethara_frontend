import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { ProjectService } from '../../../core/services/project.service';
import { TaskRequest, Priority } from '../../../core/models/task.model';
import { User } from '../../../core/models/user.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent implements OnInit {
  formData: TaskRequest = {
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    assignedToId: 0
  };
  projectId: number = 0;
  taskId: number | null = null;
  isEditMode = false;
  isLoading = false;
  error = '';
  fieldErrors: { [key: string]: string } = {};
  members: User[] = [];
  priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));
    const taskId = this.route.snapshot.paramMap.get('taskId');

    if (taskId) {
      this.isEditMode = true;
      this.taskId = Number(taskId);
      this.loadTask();
    }

    this.loadMembers();
  }

  loadTask(): void {
    if (!this.taskId) return;
    this.taskService.getTask(this.taskId).subscribe({
      next: (task) => {
        this.formData = {
          title: task.title,
          description: task.description,
          priority: task.priority,
          dueDate: task.dueDate,
          assignedToId: task.assignedTo?.id || 0
        };
      },
      error: () => this.error = 'Failed to load task'
    });
  }

  loadMembers(): void {
    this.projectService.getMembers(this.projectId).subscribe({
      next: (members) => this.members = members,
      error: () => {}
    });
  }

  onSubmit(): void {
    this.error = '';
    this.fieldErrors = {};
    this.isLoading = true;

    const request$ = this.isEditMode
      ? this.taskService.updateTask(this.taskId!, this.formData)
      : this.taskService.createTask(this.projectId, this.formData);

    request$.subscribe({
      next: (task) => {
        this.router.navigate(['/tasks', task.id]);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        if (err.error?.errors) {
          this.fieldErrors = err.error.errors;
        } else if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'An unexpected error occurred.';
        }
      }
    });
  }
}
