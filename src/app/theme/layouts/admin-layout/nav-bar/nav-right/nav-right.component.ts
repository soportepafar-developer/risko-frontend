// angular import
import { Component, output, inject, input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NotificationService } from 'src/app/core/services/notification.service';
import { AppNotification } from 'src/app/core/models/notification';

// icon
import { IconService } from '@ant-design/icons-angular';
import {
  BellOutline,
  SettingOutline,
  GiftOutline,
  MessageOutline,
  PhoneOutline,
  CheckCircleOutline,
  LogoutOutline,
  EditOutline,
  UserOutline,
  ProfileOutline,
  WalletOutline,
  QuestionCircleOutline,
  LockOutline,
  CommentOutline,
  UnorderedListOutline,
  ArrowRightOutline,
  GithubOutline,
  WarningOutline,
  InfoCircleOutline,
  AlertOutline,
  CloseOutline,
  SyncOutline
} from '@ant-design/icons-angular/icons';

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule, RouterModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent implements OnInit {
  firstName: string | undefined;
  lastName: string | undefined;
  position: string | undefined;
  private iconService = inject(IconService);
  public notificationService = inject(NotificationService);

  notifications$ = this.notificationService.notifications$;
  unreadCount$ = this.notificationService.unreadCount$;

  // public props
  styleSelectorToggle = input<boolean>();
  readonly Customize = output();
  windowWidth: number;
  screenFull: boolean = true;
  direction: string = 'ltr';

  // constructor
  constructor(private router: Router) {
    this.windowWidth = window.innerWidth;
    this.iconService.addIcon(
      ...[
        CheckCircleOutline,
        GiftOutline,
        MessageOutline,
        SettingOutline,
        PhoneOutline,
        LogoutOutline,
        EditOutline,
        UserOutline,
        ProfileOutline,
        QuestionCircleOutline,
        LockOutline,
        CommentOutline,
        UnorderedListOutline,
        ArrowRightOutline,
        BellOutline,
        GithubOutline,
        WalletOutline,
        WarningOutline,
        InfoCircleOutline,
        AlertOutline,
        CloseOutline,
        SyncOutline
      ]
    );
  }

  ngOnInit(): void {
    const userInfo = this.getUserInfoFromLocalStorage();
    console.log('userInfo', userInfo);
    if (userInfo) {
      this.firstName = userInfo.firstName;
      this.lastName = userInfo.lastName;
      this.position = userInfo.position;
    }
  }

  getUserInfoFromLocalStorage(): { firstName: string, lastName: string, position: string } | null {
    try {
      const cusrData = localStorage.getItem('cusr');

      if (!cusrData) {
        console.warn('No se encontró la clave "cusr" en Local Storage');
        return null;
      }

      const parsedData = JSON.parse(cusrData);

      console.log('parsedData', parsedData);

      if (parsedData && parsedData.user && parsedData.user.firstName && parsedData.user.lastName) {
        return {
          firstName: parsedData.user.firstName,
          lastName: parsedData.user.lastName,
          position: parsedData.user.position?.label || 'Sin posición'
        };
      } else {
        console.warn('Estructura del objeto "cusr" no es la esperada');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener datos del Local Storage:', error);
      return null;
    }
  }

  onNotificationClick(notification: AppNotification, event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
    }
    this.notificationService.markAsRead(notification.id);
    if (notification.link) {
      this.router.navigate([notification.link]);
    }
  }

  markAllNotificationsRead(event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.notificationService.markAllAsRead();
  }

  refreshNotifications(event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.notificationService.refreshNotifications();
  }

  clearAllNotifications(event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.notificationService.clearAll();
  }

  dismissNotification(id: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.notificationService.dismissNotification(id);
  }

  timeAgo(dateInput: Date | string): string {
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'Hace un momento';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHour < 24) return `Hace ${diffHour} h`;
    if (diffDay === 1) return 'Ayer';
    return `Hace ${diffDay} días`;
  }

  getNotificationBadgeClass(type: string): string {
    switch (type) {
      case 'danger': return 'bg-danger text-white';
      case 'warning': return 'bg-warning text-dark';
      case 'info': return 'bg-info text-white';
      case 'success': return 'bg-success text-white';
      default: return 'bg-primary text-white';
    }
  }

  getNotificationIconType(type: string): string {
    switch (type) {
      case 'danger': return 'alert';
      case 'warning': return 'warning';
      case 'info': return 'info-circle';
      case 'success': return 'check-circle';
      default: return 'bell';
    }
  }

  /**
   * Logout
   */
  onLogout(e: Event) {
    e.preventDefault();
    localStorage.removeItem('isLoggedin');

    if (!localStorage.getItem('isLoggedin')) {
      this.router.navigate(['/login']);
    }
  }

  profile = [
    {
      icon: 'edit',
      title: 'Edit Profile'
    },
    {
      icon: 'user',
      title: 'View Profile'
    },
    {
      icon: 'profile',
      title: 'Social Profile'
    },
    {
      icon: 'wallet',
      title: 'Billing'
    }
  ];

  setting = [
    {
      icon: 'question-circle',
      title: 'Support'
    },
    {
      icon: 'user',
      title: 'Account Settings'
    },
    {
      icon: 'lock',
      title: 'Privacy Center'
    },
    {
      icon: 'comment',
      title: 'Feedback'
    },
    {
      icon: 'unordered-list',
      title: 'History'
    }
  ];
}
