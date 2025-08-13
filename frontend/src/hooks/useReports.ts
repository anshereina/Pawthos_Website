import { useState, useEffect, useCallback } from 'react';
import { reportService, Report, CreateReportData, UpdateReportData } from '../services/reportService';

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getReports();
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, []);

  const createReport = useCallback(async (reportData: CreateReportData) => {
    try {
      setError(null);
      const newReport = await reportService.createReport(reportData);
      setReports(prev => [...prev, newReport]);
      return newReport;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create report');
      throw err;
    }
  }, []);

  const updateReport = useCallback(async (reportId: string, updateData: UpdateReportData) => {
    try {
      setError(null);
      const updatedReport = await reportService.updateReport(reportId, updateData);
      setReports(prev => prev.map(report => 
        report.report_id === reportId ? updatedReport : report
      ));
      return updatedReport;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update report');
      throw err;
    }
  }, []);

  const deleteReport = useCallback(async (reportId: string) => {
    try {
      setError(null);
      await reportService.deleteReport(reportId);
      setReports(prev => prev.filter(report => report.report_id !== reportId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete report');
      throw err;
    }
  }, []);

  const searchReports = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.searchReports(query);
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    loading,
    error,
    fetchReports,
    createReport,
    updateReport,
    deleteReport,
    searchReports,
  };
}; 