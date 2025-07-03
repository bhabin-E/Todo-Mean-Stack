import { Component, OnInit, OnDestroy } from '@angular/core';
import axios from 'axios';
import { TokenService } from '../services/token.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../shared/confirm-dialog/confirm-dialog.component';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-todo-list',
  standalone: false,
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.css'
})
export class TodoListComponent implements OnInit, OnDestroy {
  todos: any[] = [];
  newTodo = {
    title: '',
    description: '',
    isImportant: false,
    dueDate: ''
  };
  showPopup = false;
  isEditing = false;
  editTodoId: string | null = null;
  time: string = '';
  private intervalId: any;

  isFabOpen = false;

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.startClock();
    this.getTodos();
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  toggleFabMenu() {
    this.isFabOpen = !this.isFabOpen;
  }

  navigateToHistory() {
    this.router.navigate(['/history']);
    this.isFabOpen = false; // Close FAB menu after navigation
  }

  private getAuthHeaders() {
    const token = this.tokenService.getToken();
    return { Authorization: `Bearer ${token}` };
  }

  async getTodos() {
    try {
      const response = await axios.get(`${environment.apiUrl}/api/todos`, {
        headers: this.getAuthHeaders()
      });
      this.todos = response.data;
    } catch (err) {
      console.error(err);
    }
  }

  async markAsCompleted(id: string) {
    const confirmed = await this.openConfirmDialog({
      title: 'Task Completed',
      message: 'Are you sure want to complete this task?',
      confirmText: 'Complete'
    });
    if (!confirmed) return;

    try {
      await axios.patch(`${environment.apiUrl}/api/todos/${id}/complete`, {}, {
        headers: this.getAuthHeaders()
      });
      this.getTodos();
    } catch (err) {
      console.error(err);
    }
  }

  async deleteTodo(id: string) {
    const confirmed = await this.openConfirmDialog({
      title: 'Delete Task',
      message: 'Are you sure want to delete this task?',
      confirmText: 'Delete'
    });
    if (!confirmed) return;

    try {
      await axios.delete(`${environment.apiUrl}/api/todos/${id}`, {
        headers: this.getAuthHeaders()
      });
      this.getTodos();
    } catch (err) {
      console.error(err);
    }
  }

  openPopup() {
    this.showPopup = true;
    this.isFabOpen = false; // Close FAB menu when opening popup
  }

  closePopup() {
    this.showPopup = false;
    this.isEditing = false;
    this.editTodoId = null;
    this.newTodo = { title: '', description: '', isImportant: false, dueDate: '' };
  }

  async saveTodo() {
    try {
      if (this.isEditing && this.editTodoId) {
        await axios.put(`http://localhost:5000/api/todos/${this.editTodoId}`, this.newTodo, {
          headers: this.getAuthHeaders()
        });
      } else {
        await axios.post(`${environment.apiUrl}/api/todos`, this.newTodo, {
          headers: this.getAuthHeaders()
        });
      }
      this.getTodos();
      this.closePopup();
    } catch (err) {
      console.error(err);
    }
  }

  async UpdateTodo(todoId: string) {
    try {
      const todoToEdit = this.todos.find(todo => todo._id === todoId);
      if (todoToEdit) {
        this.newTodo = {
          title: todoToEdit.title,
          description: todoToEdit.description,
          isImportant: todoToEdit.isImportant,
          dueDate: todoToEdit.dueDate?.split('T')[0] || ''
        };
        this.editTodoId = todoId;
        this.isEditing = true;
        this.showPopup = true;
      }
    } catch (err) {
      console.error(err);
    }
  }

  async logout() {
    this.isFabOpen = false; // <-- CLOSE the FAB menu
    const confirmed = await this.openConfirmDialog({
      title: 'Logout',
      message: 'Are you sure want to logout from the application?',
      confirmText: 'Logout'
    });
    if (!confirmed) return;

    this.tokenService.removeToken();
    this.router.navigate(['/signin']);
  }

  async openConfirmDialog(data: ConfirmDialogData): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data,
      enterAnimationDuration: '200ms',
      exitAnimationDuration: '200ms'
    });

    return dialogRef.afterClosed().toPromise();
  }

  startClock() {
    this.updateTime();
    this.intervalId = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  updateTime() {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;

    const timeStr = `${hours}:${minutes}:${seconds} ${ampm}`;
    this.time = `${dayName} ${day} ${month}-${year}, Time ${timeStr}`;
  }

  getDueStatus(dueDateStr: string): { label: string, color: string } {
    const now = new Date();
    const dueDate = new Date(dueDateStr);
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    const diffInMs = dueDateOnly.getTime() - nowDateOnly.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays > 0) {
      return { label: `${diffInDays} day(s) left`, color: 'green' };
    } else if (diffInDays === 0) {
      return { label: `Ends today`, color: 'orange' };
    } else {
      return { label: `Overdue by ${Math.abs(diffInDays)} day(s)`, color: 'red' };
    }
  }
}