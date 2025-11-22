import { useState, useEffect, useCallback } from 'react';
import { painAssessmentService, PainAssessment, PainAssessmentCreate, PainAssessmentUpdate } from '../services/painAssessmentService';

export const usePainAssessments = () => {
  const [assessments, setAssessments] = useState<PainAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await painAssessmentService.getAllPainAssessments();
      setAssessments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pain assessments');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAssessment = useCallback(async (assessment: PainAssessmentCreate) => {
    try {
      setError(null);
      const newAssessment = await painAssessmentService.createPainAssessment(assessment);
      setAssessments(prev => [...prev, newAssessment]);
      return newAssessment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pain assessment');
      throw err;
    }
  }, []);

  const updateAssessment = useCallback(async (id: number, assessment: PainAssessmentUpdate) => {
    try {
      setError(null);
      const updatedAssessment = await painAssessmentService.updatePainAssessment(id, assessment);
      setAssessments(prev => prev.map(assessment => 
        assessment.id === id ? updatedAssessment : assessment
      ));
      return updatedAssessment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update pain assessment');
      throw err;
    }
  }, []);

  const deleteAssessment = useCallback(async (id: number) => {
    try {
      setError(null);
      await painAssessmentService.deletePainAssessment(id);
      setAssessments(prev => prev.filter(assessment => assessment.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete pain assessment');
      throw err;
    }
  }, []);

  const getAssessment = useCallback(async (id: number) => {
    try {
      setError(null);
      return await painAssessmentService.getPainAssessment(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pain assessment');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  return {
    assessments,
    loading,
    error,
    fetchAssessments,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    getAssessment,
  };
};











































