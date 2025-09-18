import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { RouterModule } from "@angular/router";
declare var bootstrap: any;

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './admin-navbar.component.html',
  styleUrl: './admin-navbar.component.css'
})
export class AdminNavbarComponent {
    constructor(private router: Router) {}
  
    goToProfile() {
      this.router.navigate(["/user/profile"]);
    }
  
    logout() {
      localStorage.clear();
      this.router.navigate(["/"]);
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
