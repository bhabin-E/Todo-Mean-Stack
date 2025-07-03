import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { TokenService } from '../services/token.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../shared/confirm-dialog/confirm-dialog.component';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-history',
  standalone: false,
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  history: any[] = [];

  // Fetch completed todos from history
  async ngOnInit() {
    this.getHistory();
  }
  constructor(private tokenService: TokenService,private dialog: MatDialog) {}

  private getAuthHeaders() {
    const token = this.tokenService.getToken();
    return {
      Authorization: `Bearer ${token}`
    };
  }

  // Get history of completed tasks from the backend
  async getHistory() {
    try {
      const response = await axios.get(`${environment.apiUrl}/api/history`, {
        headers: this.getAuthHeaders()
      });
      this.history = response.data;
    } catch (err) {
      console.error(err);
    }
  }

  // Delete individual history item
  async deleteHistoryItem(id: string) {
    const confirmed = await this.openConfirmDialog({
      title: 'Clear Task',
      message: 'Are you sure you want to clear this task from history?',
      confirmText: 'Clear'
    });

    if (!confirmed) return;
    try {
      await axios.delete(`${environment.apiUrl}/api/history/${id}`, {
        headers: this.getAuthHeaders()
      });
      this.history = this.history.filter(item => item._id !== id); // Remove from local list
    } catch (err) {
      console.error(err);
    }
  }

  // Delete all history
  async clearAllHistory() {
    const confirmed = await this.openConfirmDialog({
      title: 'Clear All Task',
      message: 'Are you sure you want to clear all task from history?',
      confirmText: 'Clear All'
    });

    if (!confirmed) return;
    try {
      await axios.delete(`${environment.apiUrl}/api/history`, {
        headers: this.getAuthHeaders()
      });
      this.history = []; // Clear local list
    } catch (err) {
      console.error(err);
    }
  }

  async openConfirmDialog(data: ConfirmDialogData): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data,
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms'
    });

    return dialogRef.afterClosed().toPromise();
  }


}
