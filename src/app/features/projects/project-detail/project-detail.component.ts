import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { TaskService } from '../../../core/services/task.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectResponse } from '../../../core/models/project.model';
import { TaskResponse } from '../../../core/models/task.model';
import { User } from '../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent, StatusBadgePipe],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css']
})
export class ProjectDetailComponent implements OnInit {
  project: ProjectResponse | null = null;
  tasks: TaskResponse[] = [];
  members: User[] = [];
  allUsers: User[] = [];
  selectedUserId: number | null = null;
  isLoading = true;
  error = '';
  activeTab: 'tasks' | 'members' = 'tasks';
  showAddMember = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private taskService: TaskService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadProject(id);
    }
  }

  loadProject(id: number): void {
    this.isLoading = true;
    this.projectService.getProject(id).subscribe({
      next: (project) => {
        this.project = project;
        this.loadTasks(id);
        this.loadMembers(id);
        if (this.isAdmin) {
          this.loadAllUsers();
        }
      },
      error: () => {
        this.error = 'Failed to load project';
        this.isLoading = false;
      }
    });
  }

  loadTasks(projectId: number): void {
    this.taskService.getTasksByProject(projectId).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadMembers(projectId: number): void {
    this.projectService.getMembers(projectId).subscribe({
      next: (members) => this.members = members,
      error: () => {}
    });
  }

  loadAllUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => this.allUsers = users,
      error: () => {}
    });
  }

  addMember(): void {
    if (!this.selectedUserId || !this.project) return;
    this.projectService.addMember(this.project.id, { userId: this.selectedUserId }).subscribe({
      next: () => {
        this.loadMembers(this.project!.id);
        this.loadProject(this.project!.id);
        this.showAddMember = false;
        this.selectedUserId = null;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to add member';
      }
    });
  }

  removeMember(userId: number): void {
    if (!this.project) return;
    if (confirm('Remove this member from the project?')) {
      this.projectService.removeMember(this.project.id, userId).subscribe({
        next: () => {
          this.loadMembers(this.project!.id);
          this.loadProject(this.project!.id);
        },
        error: () => this.error = 'Failed to remove member'
      });
    }
  }

  deleteTask(taskId: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (confirm('Delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => this.loadTasks(this.project!.id),
        error: () => this.error = 'Failed to delete task'
      });
    }
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get todoTasks(): TaskResponse[] {
    return this.tasks.filter(t => t.status === 'TODO');
  }

  get inProgressTasks(): TaskResponse[] {
    return this.tasks.filter(t => t.status === 'IN_PROGRESS');
  }

  get doneTasks(): TaskResponse[] {
    return this.tasks.filter(t => t.status === 'DONE');
  }

  get availableUsers(): User[] {
    const memberIds = this.members.map(m => m.id);
    return this.allUsers.filter(u => !memberIds.includes(u.id));
  }

  getStatusClass(status: string): string {
    return { 'TODO': 'status-todo', 'IN_PROGRESS': 'status-progress', 'DONE': 'status-done' }[status] || '';
  }

  getPriorityClass(priority: string): string {
    return { 'LOW': 'priority-low', 'MEDIUM': 'priority-medium', 'HIGH': 'priority-high' }[priority] || '';
  }
}
