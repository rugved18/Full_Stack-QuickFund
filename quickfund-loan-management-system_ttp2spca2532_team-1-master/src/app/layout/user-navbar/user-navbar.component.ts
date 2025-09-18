import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from "@angular/router";
import { Router } from "@angular/router";
import { AuthService } from '../../services/auth.service';
declare var bootstrap: any;

@Component({
  selector: "app-user-navbar",
  standalone: true,
  imports: [RouterModule],
  templateUrl: "./user-navbar.component.html",
  styleUrl: "./user-navbar.component.css",
})
export class UserNavbarComponent {

  username: string | null = null;
   constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router, private authService: AuthService) {}

  // ngOnInit(): void {
  //   if (isPlatformBrowser(this.platformId)) { 
  //     username = this.authService.user.name;
  //     this.username = userString ? JSON.parse(userString).name : null;
  //   }
  // }

  goToProfile() {
    this.router.navigate(["/user/profile"]);
  }

  logout() {
    this.authService.logout();
  }

  closeDropdown(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    // Manually hide the dropdown using Bootstrap's JS API
    const dropdownToggle = document.getElementById("desktopProfileDropdown");
    if (dropdownToggle) {
      const dropdown =
        bootstrap.Dropdown.getInstance(dropdownToggle) ||
        new bootstrap.Dropdown(dropdownToggle);
      dropdown.hide();
    }
  }

  collapseNavbar() {
    const navbarElement = document.getElementById("navbarSupportedContent");
    if (navbarElement?.classList.contains("show")) {
      const bsCollapse =
        bootstrap.Collapse.getInstance(navbarElement) ||
        new bootstrap.Collapse(navbarElement);
      bsCollapse.hide();
    }
  }
}
