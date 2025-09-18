import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  RepaymentTransaction,
  ReportData
} from '../modals/reports.interface';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private baseUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) { }

  // Filtered Repayment History - now calls backend API
  getFilteredRepaymentHistory(timeFilter: string, customerFilter: string): Observable<RepaymentTransaction[]> {
    const params = new URLSearchParams();
    if (timeFilter) params.append('timeFilter', timeFilter);
    if (customerFilter) params.append('customerFilter', customerFilter);
    
    return this.http.get<RepaymentTransaction[]>(`${this.baseUrl}/api/admin/reports/repayments/history?${params.toString()}`);
  }

  // Get specific report data - now calls backend API
  getReportData(reportType: string): Observable<ReportData> {
    return this.http.get<ReportData>(`${this.baseUrl}/api/admin/reports/${reportType}`);
  }


  // Get users for customer filters
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/admin/users`);
  }

  // Format date for export
  private formatDateForExport(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date for export:', error);
      return dateString;
    }
  }

  // Format amount in INR for export
  private formatAmountINR(amount: number): string {
    try {
      return `₹${(amount ?? 0).toLocaleString('en-IN')}`;
    } catch {
      return `₹${amount}`;
    }
  }

  // Export data
  exportCSV(data: RepaymentTransaction[], filename: string): void {
    const headers = ['Date', 'Customer', 'Loan ID', 'Amount (INR)', 'Status'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        this.formatDateForExport(row.date),
        row.customer,
        row.loanId,
        this.formatAmountINR(row.amount),
        row.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportPDF(data: RepaymentTransaction[], filename: string): void {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Repayment History Report', 20, 20);
      
      // Add generation date
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      
      // Prepare data for AutoTable
      const headers = ['Date', 'Customer', 'Loan ID', 'Amount (INR)', 'Status'];
      const rows = data.map(row => [
        this.formatDateForExport(row.date),
        row.customer,
        row.loanId,
        this.formatAmountINR(row.amount),
        row.status
      ]);
      
      // Add table using AutoTable
      autoTable(doc as any, {
        head: [headers],
        body: rows,
        startY: 50,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] }
      });
      
      // Save the PDF
      doc.save(filename.replace('.html', '.pdf'));
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Unable to download the PDF. Please try again.');
    }
  }

  // Simplified report export methods
  exportReportAsCSV(reportData: any, filename: string): void {
    const csvData = [];
    
    // Add report header
    csvData.push([reportData.title]);
    csvData.push([reportData.subtitle]);
    csvData.push([`Generated: ${reportData.generatedDate} ${reportData.generatedTime}`]);
    csvData.push([]); // Empty row
    
    // Add metrics
    if (reportData.metrics && reportData.metrics.length > 0) {
      csvData.push(['Key Metrics']);
      csvData.push(['Metric', 'Value']);
      reportData.metrics.forEach((metric: any) => {
        csvData.push([metric.label, metric.value]);
      });
      csvData.push([]); // Empty row
    }
    
    // Add chart data
    if (reportData.chartData && reportData.chartData.length > 0) {
      csvData.push([reportData.chartTitle || 'Chart Data']);
      csvData.push(['Label', 'Value', 'Percentage', 'Count', 'Amount (INR)']);
      reportData.chartData.forEach((item: any) => {
        csvData.push([
          item.label,
          item.value,
          `${item.percentage}%`,
          item.count,
          typeof item.amount === 'number' ? this.formatAmountINR(item.amount) : item.amount
        ]);
      });
      csvData.push([]); // Empty row
    }
    
    // Add table data
    if (reportData.tableData && reportData.tableData.length > 0) {
      csvData.push([reportData.tableTitle || 'Table Data']);
      if (reportData.tableHeaders && reportData.tableHeaders.length > 0) {
        csvData.push(reportData.tableHeaders);
      }
      reportData.tableData.forEach((row: any[]) => {
        csvData.push(row.map((cell: any) => cell.value));
      });
      csvData.push([]); // Empty row
    }
    
    // Add insights
    if (reportData.insights && reportData.insights.length > 0) {
      csvData.push(['Key Insights']);
      reportData.insights.forEach((insight: string, index: number) => {
        csvData.push([`${index + 1}`, insight]);
      });
    }
    
    // Generate CSV using PapaParse
    const csv = Papa.unparse(csvData);
    
    // Create and download file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  exportReportAsPDF(reportData: any, filename: string): void {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text(reportData.title, 20, 20);
      
      // Add subtitle
      doc.setFontSize(14);
      doc.text(reportData.subtitle, 20, 30);
      
      // Add generation date
      doc.setFontSize(10);
      doc.text(`Generated: ${reportData.generatedDate} ${reportData.generatedTime}`, 20, 40);
      
      let yPosition = 60;
      
      // Add metrics section
      if (reportData.metrics && reportData.metrics.length > 0) {
        doc.setFontSize(16);
        doc.text('Key Metrics', 20, yPosition);
        yPosition += 15;
        
        const metricsData = reportData.metrics.map((metric: any) => [metric.label, metric.value]);
        autoTable(doc as any, {
          head: [['Metric', 'Value']],
          body: metricsData,
          startY: yPosition,
          styles: { fontSize: 10 },
          headStyles: { fillColor: [66, 139, 202] }
        });
        yPosition = (doc as any).lastAutoTable.finalY + 20;
      }
      
      // Add chart data section
      if (reportData.chartData && reportData.chartData.length > 0) {
        doc.setFontSize(16);
        doc.text(reportData.chartTitle || 'Chart Data', 20, yPosition);
        yPosition += 15;
        
        const chartData = reportData.chartData.map((item: any) => [
          item.label, 
          item.value, 
          `${item.percentage}%`, 
          item.count, 
          typeof item.amount === 'number' ? this.formatAmountINR(item.amount) : item.amount
        ]);
        autoTable(doc as any, {
          head: [['Label', 'Value', 'Percentage', 'Count', 'Amount']],
          body: chartData,
          startY: yPosition,
          styles: { fontSize: 10 },
          headStyles: { fillColor: [66, 139, 202] }
        });
        yPosition = (doc as any).lastAutoTable.finalY + 20;
      }
      
      // Add table data section
      if (reportData.tableData && reportData.tableData.length > 0) {
        doc.setFontSize(16);
        doc.text(reportData.tableTitle || 'Table Data', 20, yPosition);
        yPosition += 15;
        
        const tableData = reportData.tableData.map((row: any[]) => 
          row.map((cell: any) => cell.value)
        );
        autoTable(doc as any, {
          head: reportData.tableHeaders ? [reportData.tableHeaders] : undefined,
          body: tableData,
          startY: yPosition,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [66, 139, 202] }
        });
        yPosition = (doc as any).lastAutoTable.finalY + 20;
      }
      
      // Add insights section
      if (reportData.insights && reportData.insights.length > 0) {
        doc.setFontSize(16);
        doc.text('Key Insights', 20, yPosition);
        yPosition += 15;
        
        const insightsData = reportData.insights.map((insight: string, index: number) => 
          [`${index + 1}`, insight]
        );
        autoTable(doc as any, {
          head: [['#', 'Insight']],
          body: insightsData,
          startY: yPosition,
          styles: { fontSize: 10 },
          headStyles: { fillColor: [66, 139, 202] }
        });
      }
      
      // Save the PDF
      doc.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Unable to download the PDF. Please try again.');
    }
  }
}
