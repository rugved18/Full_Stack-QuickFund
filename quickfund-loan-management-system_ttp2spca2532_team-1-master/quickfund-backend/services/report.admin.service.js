import User from "../models/User.js";
import Loan from "../models/Loan.js";
import Repayment from "../models/Repayment.js";

// Normalize all IDs to String helper
const normalizeId = (id) => String(id);

// Common helper functions
const currency = (n) => `$${(n || 0).toLocaleString()}`;
const monthKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

// Common data fetching and normalization function
const fetchAndNormalizeData = async () => {
  // Fetch all data
  const [users, loans, repayments] = await Promise.all([
    User.find().lean(),
    Loan.find().populate('userId').lean(),
    Repayment.find().populate('loanId').lean()
  ]);

  // Normalize all IDs to strings
  const normalizedUsers = users.map(user => ({
    ...user,
    _id: normalizeId(user._id)
  }));

  const normalizedLoans = loans.map(loan => ({
    ...loan,
    _id: normalizeId(loan._id),
    userId: normalizeId(loan.userId?._id || loan.userId)
  }));

  const normalizedRepayments = repayments.map(repayment => ({
    ...repayment,
    _id: normalizeId(repayment._id),
    loanId: normalizeId(repayment.loanId?._id || repayment.loanId)
  }));

  // Create lookup maps
  const userById = new Map();
  normalizedUsers.forEach(user => {
    userById.set(user._id, user);
  });

  const loanById = new Map();
  normalizedLoans.forEach(loan => {
    loanById.set(loan._id, loan);
  });

  return {
    normalizedLoans,
    normalizedRepayments,
    userById,
    loanById
  };
};

// Get report data service with switch-case for different report types
export const getReportDataService = async (reportType) => {
  try {
    const {
      normalizedLoans,
      normalizedRepayments,
      userById
    } = await fetchAndNormalizeData();

    // Calculate derived values
    const totalPortfolio = normalizedLoans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
    
    const statusCounts = normalizedLoans.reduce((acc, loan) => {
      const status = loan.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const purposeTotals = normalizedLoans.reduce((acc, loan) => {
      const purpose = loan.purpose || 'Other';
      if (!acc[purpose]) {
        acc[purpose] = { amount: 0, count: 0 };
      }
      acc[purpose].amount += loan.amount || 0;
      acc[purpose].count += 1;
      return acc;
    }, {});

    const repaymentsByMonth = new Map();
    normalizedRepayments.forEach(repayment => {
      if (repayment.date) {
        const key = monthKey(repayment.date);
        const existing = repaymentsByMonth.get(key) || { total: 0, count: 0 };
        existing.total += repayment.amount || 0;
        existing.count += 1;
        repaymentsByMonth.set(key, existing);
      }
    });

    // Switch-case for different report types
    switch (reportType) {
      case 'portfolio': {
        const active = statusCounts['Active'] || 0;
        const closed = statusCounts['Closed'] || 0;
        const overdue = statusCounts['Overdue'] || 0;

        const portfolioChart = Object.entries(purposeTotals).map(([purpose, data]) => ({
          label: purpose,
          value: `${Math.round((data.amount / (totalPortfolio || 1)) * 100)}%`,
          percentage: Math.round((data.amount / (totalPortfolio || 1)) * 100),
          count: `${data.count} loans`,
          amount: currency(data.amount)
        }));

        return {
          id: 1,
          title: 'Loan Portfolio Overview',
          subtitle: 'Distribution by type & status',
          icon: 'bi bi-pie-chart-fill',
          color: 'primary',
          metrics: [
            { value: currency(totalPortfolio), label: 'Total Portfolio' },
            { value: String(active), label: 'Active Loans' },
            { value: String(closed), label: 'Closed Loans' },
            { value: String(overdue), label: 'Overdue Loans' }
          ],
          chartTitle: 'Distribution by Loan Purpose',
          chartData: portfolioChart,
          insights: ['Computed live from loans collection']
        };
      }

      case 'disbursement': {
        const byMonth = new Map();
        normalizedLoans.forEach(loan => {
          const user = userById.get(loan.userId);
          const date = loan.disbursementDate || user?.details?.dateJoined || '1970-01-01';
          const key = monthKey(date);
          byMonth.set(key, (byMonth.get(key) || 0) + (loan.amount || 0));
        });

        const months = Array.from(byMonth.entries()).sort(([a], [b]) => a.localeCompare(b));
        const currentTotal = months.reduce((sum, [, amount]) => sum + amount, 0);
        
        const table = months.slice(-6).reverse().map(([month, amount]) => [
          { value: month, class: '' },
          { value: currency(amount), class: 'fw-semibold' },
          { value: '—', class: '' }
        ]);

        return {
          id: 2,
          title: 'Disbursement Trends',
          subtitle: 'Monthly trends (derived)',
          icon: 'bi bi-graph-up',
          color: 'info',
          metrics: [
            { value: currency(currentTotal), label: 'Total Disbursed' },
            { value: String(months.length), label: 'Months Data' }
          ],
          tableTitle: 'Monthly Trends',
          tableHeaders: ['Month', 'Amount', 'Growth'],
          tableData: table,
          insights: ['Computed from loans disbursement/user join dates']
        };
      }

      case 'repayment': {
        const months = Array.from(repaymentsByMonth.entries()).sort(([a], [b]) => a.localeCompare(b));
        const latest = months.at(-1)?.[1]?.total || 0;
        
        const table = months.slice(-6).reverse().map(([month, data]) => [
          { value: month, class: '' },
          { value: String(data.count), class: '' },
          { value: currency(data.total), class: 'fw-semibold' }
        ]);

        return {
          id: 3,
          title: 'Repayment & Default Rates',
          subtitle: 'Derived from repayments',
          icon: 'bi bi-bar-chart-fill',
          color: 'warning',
          metrics: [
            { value: currency(latest), label: 'Latest Month Total' },
            { value: String(normalizedLoans.length), label: 'Total Loans' }
          ],
          tableTitle: 'Monthly Performance',
          tableHeaders: ['Month', 'Payments', 'Amount'],
          tableData: table,
          insights: ['Computed from repayments collection']
        };
      }

      case 'revenue': {
        const totalRepayments = Array.from(repaymentsByMonth.values()).reduce((sum, data) => sum + data.total, 0);
        const estRevenue = Math.round(totalRepayments * 0.1);

        return {
          id: 4,
          title: 'Interest Revenue (Estimated)',
          subtitle: '10% of repayments as proxy',
          icon: 'bi bi-cash-stack',
          color: 'success',
          metrics: [
            { value: currency(estRevenue), label: 'Estimated Revenue' }
          ],
          chartTitle: 'Breakdown (proxy)',
          chartData: [],
          insights: ['Estimated from repayments due to lack of interest breakdown']
        };
      }

      case 'risk': {
        const repaymentsByLoan = normalizedLoans.map(loan => ({
          loan,
          payments: normalizedRepayments.filter(repayment => 
            normalizeId(repayment.loanId) === normalizeId(loan._id)
          ).length
        }));

        const highRisk = repaymentsByLoan.filter(x => x.payments <= 1).length;
        const lowRisk = repaymentsByLoan.length - highRisk;

        return {
          id: 5,
          title: 'Risk Analysis (Heuristic)',
          subtitle: 'Derived from repayment density',
          icon: 'bi bi-exclamation-triangle-fill',
          color: 'danger',
          tableTitle: 'Risk Buckets',
          tableHeaders: ['Bucket', 'Loans'],
          tableData: [
            [{ value: 'High Risk', class: 'text-danger' }, { value: String(highRisk), class: '' }],
            [{ value: 'Low/Normal', class: 'text-success' }, { value: String(lowRisk), class: '' }]
          ],
          insights: ['Heuristic based on repayments per loan']
        };
      }

      case 'segmentation': {
        const bySegment = new Map();
        normalizedLoans.forEach(loan => {
          const user = userById.get(loan.userId);
          const segment = user?.details?.employmentStatus || 'Unknown';
          const existing = bySegment.get(segment) || { count: 0, loanAmount: 0 };
          existing.count += 1;
          existing.loanAmount += loan.amount || 0;
          bySegment.set(segment, existing);
        });

        const totalAmount = Array.from(bySegment.values()).reduce((sum, data) => sum + data.loanAmount, 0);
        
        const chartData = Array.from(bySegment.entries()).map(([segment, data]) => ({
          label: segment,
          value: `${Math.round((data.loanAmount / (totalAmount || 1)) * 100)}%`,
          percentage: Math.round((data.loanAmount / (totalAmount || 1)) * 100),
          count: `${data.count} customers`,
          amount: currency(data.loanAmount)
        }));

        return {
          id: 6,
          title: 'Customer Segmentation',
          subtitle: 'By employment status',
          icon: 'bi bi-people-fill',
          color: 'primary',
          chartTitle: 'Distribution by Segment',
          chartData,
          insights: ['Computed from users + loans collections']
        };
      }

      case 'funnel': {
        const stages = [
          { stage: 'Applications Received', count: normalizedLoans.length },
          { stage: 'Under Review', count: normalizedLoans.length },
          { stage: 'Approved', count: (statusCounts['Active'] || 0) + (statusCounts['Closed'] || 0) },
          { stage: 'Active', count: statusCounts['Active'] || 0 }
        ];

        return {
          id: 7,
          title: 'Approval Funnel',
          subtitle: 'Derived from loan statuses',
          icon: 'bi bi-funnel-fill',
          color: 'dark',
          chartTitle: 'Funnel Stages',
          chartData: stages.map(stage => ({
            label: stage.stage,
            value: String(stage.count),
            percentage: 0,
            count: '',
            amount: ''
          })),
          insights: ['Computed from loans collection']
        };
      }

      default:
        return {
          id: 0,
          title: 'Report',
          subtitle: '',
          icon: '',
          color: 'primary'
        };
    }
  } catch (error) {
    console.error('Error in getReportDataService:', error);
    throw error;
  }
};

// Get repayment history service with filters
export const getRepaymentHistoryService = async (timeFilter, customerFilter) => {
  try {
    const {
      normalizedRepayments,
      userById,
      loanById
    } = await fetchAndNormalizeData();

    // Build repayment history with joins
    const repaymentHistory = [];
    normalizedRepayments.forEach(repayment => {
      const loan = loanById.get(repayment.loanId);
      if (!loan) return;

      const user = userById.get(loan.userId);
      if (!user) return;

      repaymentHistory.push({
        id: Number(repayment._id),
        date: repayment.date,
        customer: user.name,
        loanId: loan._id,
        amount: Number(repayment.amount),
        status: 'Completed'
      });
    });

    // Apply time filter
    let filteredHistory = repaymentHistory;
    if (timeFilter && timeFilter !== 'All Time') {
      const now = new Date();
      let fromDate = null;
      let toDate = null;
      
      if (timeFilter === 'Last 30 Days') {
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (timeFilter === 'Last 90 Days') {
        fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      } else if (timeFilter === 'This Year') {
        fromDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
        toDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59); // December 31st of current year
      } else if (timeFilter === 'Last Year') {
        const lastYear = now.getFullYear() - 1;
        fromDate = new Date(lastYear, 0, 1); // January 1st of last year
        toDate = new Date(lastYear, 11, 31, 23, 59, 59); // December 31st of last year
      }
      
      if (fromDate) {
        filteredHistory = filteredHistory.filter(repayment => {
          const repaymentDate = new Date(repayment.date);
          if (toDate) {
            return repaymentDate >= fromDate && repaymentDate <= toDate;
          } else {
            return repaymentDate >= fromDate;
          }
        });
      }
    }

    // Apply customer filter
    if (customerFilter && customerFilter !== 'All Customers') {
      filteredHistory = filteredHistory.filter(repayment => 
        repayment.customer === customerFilter
      );
    }

    // Sort by date descending
    filteredHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    return filteredHistory;
  } catch (error) {
    console.error('Error in getRepaymentHistoryService:', error);
    throw error;
  }
};
