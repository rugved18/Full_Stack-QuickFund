import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, LoginComponent, RegisterComponent, FooterComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  showLogin = false;
  showRegister = false;

  features = [
    {
      icon: 'bi bi-currency-dollar',
      title: 'Smart Loan Management',
      description: 'AI-powered loan processing with instant approvals and competitive rates tailored to your needs.'
    },
    {
      icon: 'bi bi-graph-up-arrow',
      title: 'Real-time Analytics',
      description: 'Track your financial progress with comprehensive dashboards and detailed repayment insights.'
    },
    {
      icon: 'bi bi-shield-check',
      title: 'Bank-level Security',
      description: 'Your data is protected with enterprise-grade encryption and multi-factor authentication.'
    },
    {
      icon: 'bi bi-clock',
      title: '24/7 Processing',
      description: 'Apply and manage loans anytime with our automated systems working around the clock.'
    },
    {
      icon: 'bi bi-people',
      title: 'Expert Support',
      description: 'Get personalized assistance from our team of financial experts whenever you need help.'
    },
    {
      icon: 'bi bi-bar-chart',
      title: 'Financial Insights',
      description: 'Make informed decisions with detailed reports and credit score monitoring tools.'
    }
  ];

  testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Small Business Owner',
      content: 'QuickFund helped me expand my business with a seamless loan process. Got approved in just 24 hours!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Homeowner',
      content: 'The platform is incredibly user-friendly. Managing my home renovation loan has never been easier.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Entrepreneur',
      content: 'Best rates in the market and transparent terms. QuickFund is my go-to for all financing needs.',
      rating: 5
    }
  ];

  stats = [
    { value: '$2.5B+', label: 'Loans Processed' },
    { value: '50k+', label: 'Happy Customers' },
    { value: '24h', label: 'Average Approval' },
    { value: '4.9/5', label: 'Customer Rating' }
  ];


  openOffcanvas(type: 'login' | 'register') {
    this.showLogin = type === 'login';
    this.showRegister = type === 'register';
  }

  switchToRegister() {
    this.showLogin = false;
    this.showRegister = true;
  }
  switchToLogin() {
    this.showLogin = true;
    this.showRegister = false;
  }  
}
