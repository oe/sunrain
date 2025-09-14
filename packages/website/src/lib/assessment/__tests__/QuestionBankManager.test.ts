import { describe, it, expect, beforeEach } from 'vitest';
import { QuestionBankManager } from '../QuestionBankManager';
import type { AssessmentType, AssessmentCategory } from '@/types/assessment';

describe('QuestionBankManager', () => {
  let questionBankManager: QuestionBankManager;

  beforeEach(() => {
    questionBankManager = new QuestionBankManager();
  });

  describe('getAssessmentTypes', () => {
    it('should return all assessment types', () => {
      const assessments = questionBankManager.getAssessmentTypes();
      
      expect(assessments).toBeDefined();
      expect(Array.isArray(assessments)).toBe(true);
      expect(assessments.length).toBeGreaterThan(0);
      
      // Check that we have the expected assessments
      const assessmentIds = assessments.map(a => a.id);
      expect(assessmentIds).toContain('phq-9');
      expect(assessmentIds).toContain('gad-7');
      expect(assessmentIds).toContain('stress-scale');
    });

    it('should return assessments with required properties', () => {
      const assessments = questionBankManager.getAssessmentTypes();
      
      assessments.forEach(assessment => {
        expect(assessment).toHaveProperty('id');
        expect(assessment).toHaveProperty('name');
        expect(assessment).toHaveProperty('description');
        expect(assessment).toHaveProperty('category');
        expect(assessment).toHaveProperty('duration');
        expect(assessment).toHaveProperty('questions');
        expect(assessment).toHaveProperty('scoringRules');
        expect(Array.isArray(assessment.questions)).toBe(true);
        expect(Array.isArray(assessment.scoringRules)).toBe(true);
      });
    });
  });

  describe('getAssessmentType', () => {
    it('should return specific assessment by ID', () => {
      const phq9 = questionBankManager.getAssessmentType('phq-9');
      
      expect(phq9).toBeDefined();
      expect(phq9?.id).toBe('phq-9');
      expect(phq9?.name).toBe('PHQ-9 Depression Assessment');
      expect(phq9?.category).toBe('mental_health');
    });

    it('should return undefined for non-existent assessment', () => {
      const nonExistent = questionBankManager.getAssessmentType('non-existent');
      expect(nonExistent).toBeUndefined();
    });
  });

  describe('getAssessmentTypesByCategory', () => {
    it('should return assessments filtered by category', () => {
      const mentalHealthAssessments = questionBankManager.getAssessmentTypesByCategory('mental_health');
      
      expect(mentalHealthAssessments).toBeDefined();
      expect(Array.isArray(mentalHealthAssessments)).toBe(true);
      expect(mentalHealthAssessments.length).toBeGreaterThan(0);
      
      mentalHealthAssessments.forEach(assessment => {
        expect(assessment.category).toBe('mental_health');
      });
    });

    it('should return empty array for non-existent category', () => {
      const nonExistent = questionBankManager.getAssessmentTypesByCategory('non-existent' as AssessmentCategory);
      expect(nonExistent).toEqual([]);
    });
  });

  describe('PHQ-9 Assessment', () => {
    let phq9: AssessmentType | undefined;

    beforeEach(() => {
      phq9 = questionBankManager.getAssessmentType('phq-9');
    });

    it('should have 9 questions', () => {
      expect(phq9?.questions).toHaveLength(9);
    });

    it('should have all required question properties', () => {
      phq9?.questions.forEach(question => {
        expect(question).toHaveProperty('id');
        expect(question).toHaveProperty('text');
        expect(question).toHaveProperty('type');
        expect(question).toHaveProperty('required');
        expect(question).toHaveProperty('options');
        expect(Array.isArray(question.options)).toBe(true);
        expect(question.options?.length).toBe(4); // 4 options for each PHQ-9 question
      });
    });

    it('should have proper scoring rules', () => {
      expect(phq9?.scoringRules).toHaveLength(1);
      
      const scoringRule = phq9?.scoringRules[0];
      expect(scoringRule?.id).toBe('phq9-total');
      expect(scoringRule?.calculation).toBe('sum');
      expect(scoringRule?.questionIds).toHaveLength(9);
      expect(scoringRule?.ranges).toHaveLength(5);
    });

    it('should have correct scoring ranges', () => {
      const scoringRule = phq9?.scoringRules[0];
      const ranges = scoringRule?.ranges || [];
      
      expect(ranges[0]).toEqual({ min: 0, max: 4, label: 'Minimal', description: 'Minimal depression symptoms', riskLevel: 'low' });
      expect(ranges[1]).toEqual({ min: 5, max: 9, label: 'Mild', description: 'Mild depression symptoms', riskLevel: 'low' });
      expect(ranges[2]).toEqual({ min: 10, max: 14, label: 'Moderate', description: 'Moderate depression symptoms', riskLevel: 'medium' });
      expect(ranges[3]).toEqual({ min: 15, max: 19, label: 'Moderately Severe', description: 'Moderately severe depression symptoms', riskLevel: 'medium' });
      expect(ranges[4]).toEqual({ min: 20, max: 27, label: 'Severe', description: 'Severe depression symptoms', riskLevel: 'high' });
    });
  });

  describe('GAD-7 Assessment', () => {
    let gad7: AssessmentType | undefined;

    beforeEach(() => {
      gad7 = questionBankManager.getAssessmentType('gad-7');
    });

    it('should have 7 questions', () => {
      expect(gad7?.questions).toHaveLength(7);
    });

    it('should have all required question properties', () => {
      gad7?.questions.forEach(question => {
        expect(question).toHaveProperty('id');
        expect(question).toHaveProperty('text');
        expect(question).toHaveProperty('type');
        expect(question).toHaveProperty('required');
        expect(question).toHaveProperty('options');
        expect(Array.isArray(question.options)).toBe(true);
        expect(question.options?.length).toBe(4); // 4 options for each GAD-7 question
      });
    });

    it('should have proper scoring rules', () => {
      expect(gad7?.scoringRules).toHaveLength(1);
      
      const scoringRule = gad7?.scoringRules[0];
      expect(scoringRule?.id).toBe('gad7-total');
      expect(scoringRule?.calculation).toBe('sum');
      expect(scoringRule?.questionIds).toHaveLength(7);
      expect(scoringRule?.ranges).toHaveLength(4);
    });
  });

  describe('getLocalizedAssessmentType', () => {
    it('should return English version by default', () => {
      const phq9 = questionBankManager.getLocalizedAssessmentType('phq-9');
      expect(phq9?.name).toBe('PHQ-9 Depression Assessment');
    });

    it('should return Chinese version when language is zh', () => {
      const phq9 = questionBankManager.getLocalizedAssessmentType('phq-9', 'zh');
      expect(phq9?.name).toBe('PHQ-9 抑郁症评估');
      expect(phq9?.description).toBe('患者健康问卷-9，用于抑郁症筛查');
    });

    it('should return English version for unsupported language', () => {
      const phq9 = questionBankManager.getLocalizedAssessmentType('phq-9', 'fr');
      expect(phq9?.name).toBe('PHQ-9 Depression Assessment');
    });

    it('should localize question text', () => {
      const phq9 = questionBankManager.getLocalizedAssessmentType('phq-9', 'zh');
      const firstQuestion = phq9?.questions[0];
      expect(firstQuestion?.text).toBe('对事物缺乏兴趣或乐趣');
    });

    it('should localize question options', () => {
      const phq9 = questionBankManager.getLocalizedAssessmentType('phq-9', 'zh');
      const firstQuestion = phq9?.questions[0];
      const options = firstQuestion?.options || [];
      
      expect(options[0].text).toBe('完全没有');
      expect(options[1].text).toBe('几天');
      expect(options[2].text).toBe('超过一半的天数');
      expect(options[3].text).toBe('几乎每天');
    });
  });

  describe('getQuestionsByCategory', () => {
    it('should return questions for mental health category', () => {
      const questions = questionBankManager.getQuestionsByCategory('mental_health');
      
      expect(questions).toBeDefined();
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);
      
      // Should include questions from both PHQ-9 and GAD-7
      expect(questions.length).toBe(16); // 9 from PHQ-9 + 7 from GAD-7
    });

    it('should return questions for stress category', () => {
      const questions = questionBankManager.getQuestionsByCategory('stress');
      
      expect(questions).toBeDefined();
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBe(1); // 1 from stress-scale
    });

    it('should return empty array for non-existent category', () => {
      const questions = questionBankManager.getQuestionsByCategory('non-existent' as AssessmentCategory);
      expect(questions).toEqual([]);
    });
  });
});
