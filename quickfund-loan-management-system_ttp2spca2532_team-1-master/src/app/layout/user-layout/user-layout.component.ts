import { Component } from '@angular/core';
import { UserNavbarComponent } from '../user-navbar/user-navbar.component';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [UserNavbarComponent, RouterModule, FooterComponent],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.css'
})
export class UserLayoutComponent {

}
