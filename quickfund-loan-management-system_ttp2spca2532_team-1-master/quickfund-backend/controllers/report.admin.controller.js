import { getReportDataService, getRepaymentHistoryService } from '../services/report.admin.service.js';

// Get report data controller - bridge between route and service
export const getReportData = async (req, res) => {
  try {
    const { reportType } = req.params;
    
    if (!reportType) {
      return res.status(400).json({
        success: false,
        message: 'Report type is required'
      });
    }

    const reportData = await getReportDataService(reportType);
    
    res.status(200).json(reportData);
  } catch (error) {
    console.error('Error in getReportData controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching report data',
      error: error.message
    });
  }
};

// Get repayment history controller - bridge between route and service
export const getRepaymentHistory = async (req, res) => {
  try {
    const { timeFilter, customerFilter } = req.query;
    
    const repaymentHistory = await getRepaymentHistoryService(timeFilter, customerFilter);
    
    res.status(200).json(repaymentHistory);
  } catch (error) {
    console.error('Error in getRepaymentHistory controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching repayment history',
      error: error.message
    });
  }
};
