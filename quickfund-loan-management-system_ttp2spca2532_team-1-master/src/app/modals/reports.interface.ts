export interface RepaymentTransaction {
  id: number;
  date: string;
  customer: string;
  loanId: string;
  amount: number;
  status: string;
}

export interface ReportData {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  metrics?: Array<{value: string, label: string}>;
  chartData?: Array<{label: string, value: string, percentage: number, count: string, amount: string}>;
  chartTitle?: string;
  tableData?: Array<Array<{value: string, class: string}>>;
  tableHeaders?: string[];
  tableTitle?: string;
  insights?: string[];
}

// Minimal KPI metric shape used by admin reports component
export interface KPIMetric {
  id: number;
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  color: string;
}