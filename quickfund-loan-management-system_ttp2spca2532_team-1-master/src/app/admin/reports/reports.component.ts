import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ReportsService } from '../../services/reports.service';
import {
  RepaymentTransaction,
  KPIMetric,
  ReportData
} from '../../modals/reports.interface';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  Math = Math; // Make Math available in template
  
  constructor(private reportsService: ReportsService) {}

  ngOnInit() {
    this.loadData();
  }

  // Component properties - will be populated by service
  kpiMetrics: KPIMetric[] = [];
  repaymentHistory: RepaymentTransaction[] = [];
  
  // Filter states
  selectedTimeFilter = 'All Time';
  selectedCustomerFilter = 'All Customers';
  
  // Dynamic filters - will be populated from service
  timeFilters = ['All Time', 'Last 30 Days', 'Last 90 Days', 'This Year', 'Last Year'];
  customerFilters: string[] = ['All Customers'];

  // Simple analytics data - populated from real data
  totalPortfolio = 0;
  activeLoansCount = 0;
  totalCustomers = 0;
  repaymentRate = 0;
  totalRevenue = 0;
  riskScore = 0;

  // Helper method to format currency in Indian format (lakhs/crores)
  formatIndianCurrency(amount: number): string {
    if (amount >= 10000000) { // 1 crore = 1,00,00,000
      return `₹${(amount / 10000000).toFixed(1)} Cr`;
    } else if (amount >= 100000) { // 1 lakh = 1,00,000
      return `₹${(amount / 100000).toFixed(1)} L`;
    } else {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
  }

  loadData() {
    // Initialize KPI metrics locally (values updated after loading repayment history)
    this.kpiMetrics = [
      { id: 1, title: 'Total Repayments', value: '₹0', subtitle: '0 transactions', icon: 'bi bi-currency-rupee', color: 'primary' },
      { id: 2, title: 'Unique Customers', value: '0', subtitle: 'active repayers', icon: 'bi bi-people', color: 'info' },
      { id: 3, title: 'Average Repayment', value: '₹0', subtitle: 'per transaction', icon: 'bi bi-graph-up', color: 'warning' },
      { id: 4, title: 'This Month', value: '₹0', subtitle: 'this month total', icon: 'bi bi-calendar', color: 'success' },
    ];

    // Load repayment history with initial filters
    this.reportsService.getFilteredRepaymentHistory('All Time', 'All Customers').subscribe({
      next: (data) => {
        this.repaymentHistory = Array.isArray(data) ? data : [];
        // Update KPI metrics after loading repayment history
        this.updateKPIMetrics();
      },
      error: (error) => {
        console.error('Error loading repayment history:', error);
        this.repaymentHistory = [];
        this.updateKPIMetrics();
      }
    });

    // Load users for customer filters (single source of truth)
    this.reportsService.getUsers().subscribe({
      next: (users) => {
        if (Array.isArray(users)) {
          const userNames = users.map(u => u.name).filter(Boolean);
          this.customerFilters = ['All Customers', ...Array.from(new Set(userNames))];
          this.totalCustomers = users.length;
        } else {
          this.customerFilters = ['All Customers'];
          this.totalCustomers = 0;
        }
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.customerFilters = ['All Customers'];
        this.totalCustomers = 0;
      }
    });
  }


  // Methods
  exportCSV() {
    const filteredData = this.getFilteredRepaymentHistory();
    const filename = `repayment_history_${this.selectedTimeFilter.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    this.reportsService.exportCSV(filteredData, filename);
  }

  exportPDF() {
    const filteredData = this.getFilteredRepaymentHistory();
    const filename = `repayment_history_${this.selectedTimeFilter.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    this.reportsService.exportPDF(filteredData, filename);
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  // Generic formatter for values that may already be strings
  formatAmountINR(value: any): string {
    if (typeof value === 'number') {
      return `₹${value.toLocaleString('en-IN')}`;
    }
    if (typeof value === 'string') {
      // replace leading $ with ₹ if present
      return value.replace(/^\$/,'₹');
    }
    return value;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }

  // Get filtered data - now returns the already filtered data from backend
  getFilteredRepaymentHistory(): RepaymentTransaction[] {
    return this.repaymentHistory;
  }

  // Calculate total metrics
  getTotalMetrics() {
    const filteredData = this.getFilteredRepaymentHistory();
    
    // Ensure filteredData is an array
    if (!Array.isArray(filteredData)) {
      return {
        totalRepayments: 0,
        uniqueCustomers: 0,
        averageRepayment: 0
      };
    }
    
    const totalRepayments = filteredData.reduce((sum, item) => sum + item.amount, 0);
    const uniqueCustomers = new Set(filteredData.map(item => item.customer)).size;
    const averageRepayment = filteredData.length > 0 ? totalRepayments / filteredData.length : 0;
    
    return {
      totalRepayments,
      uniqueCustomers,
      averageRepayment
    };
  }

  // Update KPI metrics based on filtered data
  updateKPIMetrics() {
    const metrics = this.getTotalMetrics();
    
    if (this.kpiMetrics.length >= 4) {
      this.kpiMetrics[0].value = `₹${metrics.totalRepayments.toLocaleString('en-IN')}`;
      this.kpiMetrics[0].subtitle = `${this.getFilteredRepaymentHistory().length} transactions`;
      
      this.kpiMetrics[1].value = metrics.uniqueCustomers.toString();
      this.kpiMetrics[1].subtitle = 'active repayers';
      
      this.kpiMetrics[2].value = `₹${metrics.averageRepayment.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
      this.kpiMetrics[2].subtitle = 'per transaction';
      
      // Calculate this month's estimated monthly based on current month data
      if (Array.isArray(this.repaymentHistory)) {
        const currentMonthData = this.repaymentHistory.filter(item => {
          const itemDate = new Date(item.date);
          const now = new Date();
          return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
        });
        const thisMonthTotal = currentMonthData.reduce((sum, item) => sum + item.amount, 0);
        this.kpiMetrics[3].value = `₹${thisMonthTotal.toLocaleString('en-IN')}`;
        this.kpiMetrics[3].subtitle = 'this month total';
      } else {
        this.kpiMetrics[3].value = '₹0';
        this.kpiMetrics[3].subtitle = 'this month total';
      }
    }

    // Update simple analytics data
    this.totalPortfolio = metrics.totalRepayments;
    this.activeLoansCount = metrics.uniqueCustomers;
    this.repaymentRate = metrics.averageRepayment > 0 ? Math.min(95, Math.max(85, (metrics.totalRepayments / (metrics.totalRepayments + 100000)) * 100)) : 0;
    this.totalRevenue = Math.round(metrics.totalRepayments * 0.1);
    this.riskScore = Math.max(5, Math.min(25, 20 - (metrics.uniqueCustomers / 10)));
  }

  // Handle filter changes
  onFilterChange() {
    // Call backend with new filters
    this.reportsService.getFilteredRepaymentHistory(this.selectedTimeFilter, this.selectedCustomerFilter).subscribe({
      next: (data) => {
        this.repaymentHistory = Array.isArray(data) ? data : [];
        // Update KPI metrics after loading filtered repayment history
        this.updateKPIMetrics();
      },
      error: (error) => {
        console.error('Error loading filtered repayment history:', error);
        this.repaymentHistory = [];
        this.updateKPIMetrics();
      }
    });
  }
   // Modal state
   currentReport: ReportData = {
    id: 0,
    title: '',
    subtitle: '',
    icon: '',
    color: 'primary',
    metrics: [],
    chartData: [],
    tableData: [],
    tableHeaders: [],
    insights: []
  };

  // Show specific analytics report with beautiful modal
  showReport(reportType: string) {
    // Fetch report data from service
    this.reportsService.getReportData(reportType).subscribe({
      next: (data) => {
        this.currentReport = {
          ...data,
          metrics: data.metrics || [],
          chartData: data.chartData || [],
          tableData: data.tableData || [],
          tableHeaders: data.tableHeaders || [],
          insights: data.insights || []
        };
        // Show the modal
        const modal = document.getElementById('reportModal');
        if (modal) {
          const bootstrapModal = new (window as any).bootstrap.Modal(modal);
          bootstrapModal.show();
        }
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
        alert('Unable to load report data. Please ensure the backend server is running.');
      }
    });
  }

  // Simplified export report functionality
  exportReport() {
    if (!this.currentReport) {
      console.warn('No report data available for export');
      return;
    }

    // Create a comprehensive report data structure
    const reportData = this.prepareReportDataForExport();
    
    // Ask user for export preference
    const exportType = this.getExportPreference();
    
    if (exportType === 'csv') {
      this.exportReportAsCSV(reportData);
    } else if (exportType === 'pdf') {
      this.exportReportAsPDF(reportData);
    }
  }

  // Get user export preference
  private getExportPreference(): string {
    // You can enhance this to show a modal or dropdown
    // For now, defaulting to CSV as it's more reliable
    return 'csv';
    
    // Alternative: Show a simple prompt
    // const preference = prompt('Choose export format (csv/pdf):', 'csv');
    // return preference?.toLowerCase() === 'pdf' ? 'pdf' : 'csv';
  }

  // Prepare report data for export
  prepareReportDataForExport(): any {
    const report = this.currentReport;
    const exportData = {
      title: report.title,
      subtitle: report.subtitle,
      generatedDate: new Date().toLocaleDateString(),
      generatedTime: new Date().toLocaleTimeString(),
      metrics: report.metrics || [],
      chartData: report.chartData || [],
      tableData: report.tableData || [],
      tableHeaders: report.tableHeaders || [],
      insights: report.insights || []
    };

    return exportData;
  }

  // Simplified export methods using service
  exportReportAsCSV(reportData: any) {
    const filename = `${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    this.reportsService.exportReportAsCSV(reportData, filename);
  }

  exportReportAsPDF(reportData: any) {
    const filename = `${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    this.reportsService.exportReportAsPDF(reportData, filename);
  }

}
