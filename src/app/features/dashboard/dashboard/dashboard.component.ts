import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardStats } from '../../../core/models/dashboard.model';
import { TaskResponse } from '../../../core/models/task.model';
import { User } from '../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, StatusBadgePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  myTasks: TaskResponse[] = [];
  currentUser: User | null = null;
  isLoading = true;
  error = '';

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loadMyTasks();
      },
      error: (err) => {
        this.error = 'Failed to load dashboard stats';
        this.isLoading = false;
      }
    });
  }

  loadMyTasks(): void {
    this.dashboardService.getMyTasks().subscribe({
      next: (tasks) => {
        this.myTasks = tasks;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load tasks';
        this.isLoading = false;
      }
    });
  }

  get overdueTasks(): TaskResponse[] {
    const now = new Date();
    return this.myTasks.filter(task =>
      task.status !== 'DONE' && new Date(task.dueDate) < now
    );
  }

  get inProgressTasks(): TaskResponse[] {
    return this.myTasks.filter(task => task.status === 'IN_PROGRESS');
  }

  get todoTasks(): TaskResponse[] {
    return this.myTasks.filter(task => task.status === 'TODO');
  }

  getStatusClass(status: string): string {
    const map: { [key: string]: string } = {
      'TODO': 'status-todo',
      'IN_PROGRESS': 'status-progress',
      'DONE': 'status-done'
    };
    return map[status] || '';
  }

  getPriorityClass(priority: string): string {
    const map: { [key: string]: string } = {
      'LOW': 'priority-low',
      'MEDIUM': 'priority-medium',
      'HIGH': 'priority-high'
    };
    return map[priority] || '';
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }
}
