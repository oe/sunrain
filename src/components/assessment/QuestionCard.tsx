import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { CheckCircle, Check, AlertCircle, AlertTriangle } from 'lucide-react';
import type { Question } from '@/types/assessment';
import { answerValidator, type ValidationResult as ValidatorResult } from '@/lib/assessment/AnswerValidator';
import { createMemoComparison } from '@/utils/RenderOptimizer';

interface QuestionCardProps {
  question: Question;
  answer: any;
  onAnswerChange: (answer: any) => void;
  onValidationChange?: (isValid: boolean, errors?: string[], warnings?: string[]) => void;
  disabled?: boolean;
  showValidation?: boolean;
  enableRealtimeValidation?: boolean;
  questionIndex?: number;
  t: (key: string, params?: Record<string, any>) => string;
}

interface ValidationState {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  hasErrors: boolean;
  hasWarnings: boolean;
}

export default memo(function QuestionCard({
  question,
  answer,
  onAnswerChange,
  onValidationChange,
  questionIndex,
  disabled = false,
  showValidation = true,
  enableRealtimeValidation = true,
  t
}: QuestionCardProps) {
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid: true,
    errors: [],
    warnings: [],
    hasErrors: false,
    hasWarnings: false
  });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // 创建防抖的验证函数
  const debouncedValidation = useMemo(() => {
    let timeoutId: number;

    return (value: any, isRealtime: boolean = false) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        performValidation(value, isRealtime);
      }, isRealtime ? 300 : 0); // 实时验证延迟300ms，提交验证立即执行
    };
  }, [question]);

  // 执行验证
  const performValidation = useCallback(async (value: any, isRealtime: boolean = false) => {
    setIsValidating(true);

    try {
      const validationResult: ValidatorResult = isRealtime && enableRealtimeValidation
        ? answerValidator.validateRealtime(value, question)
        : answerValidator.validateAnswer(value, question);

      const newState: ValidationState = {
        isValid: validationResult.valid,
        errors: validationResult.errors.map(error => error.message),
        warnings: validationResult.warnings.map(warning => warning.message),
        hasErrors: validationResult.errors.length > 0,
        hasWarnings: validationResult.warnings.length > 0
      };

      setValidationState(newState);
      onValidationChange?.(newState.isValid, newState.errors, newState.warnings);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Validation failed:', error);
      }
      const errorState: ValidationState = {
        isValid: false,
        errors: [t('errors.validationFailed')],
        warnings: [],
        hasErrors: true,
        hasWarnings: false
      };
      setValidationState(errorState);
      onValidationChange?.(false, errorState.errors, []);
    } finally {
      setIsValidating(false);
    }
  }, [question, enableRealtimeValidation, onValidationChange, t]);

  // 当答案或问题改变时进行验证
  useEffect(() => {
    if (hasInteracted || answer !== null && answer !== undefined) {
      debouncedValidation(answer, false); // 完整验证
    }
  }, [answer, question, debouncedValidation, hasInteracted]);

  const handleAnswerChange = useCallback((newAnswer: any) => {
    setHasInteracted(true);
    onAnswerChange(newAnswer);

    // 如果启用实时验证，立即进行实时验证
    if (enableRealtimeValidation) {
      debouncedValidation(newAnswer, true);
    }
  }, [onAnswerChange, enableRealtimeValidation, debouncedValidation]);

  const renderSingleChoice = () => {
    if (!question.options) return null;

    return (
      <div className="space-y-3">
        {question.options.map((option, optionIndex) => (
          <label
            key={option.id}
            data-testid={`a${optionIndex + 1}`}
            className={`
              block p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
              ${answer === option.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
              }
              ${validationState.hasErrors && hasInteracted && showValidation
                ? 'border-red-500'
                : ''
              }
              ${validationState.hasWarnings && hasInteracted && showValidation
                ? 'border-yellow-500'
                : ''
              }
            `}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option.value}
              checked={answer === option.value}
              onChange={(e) => {
                const value = e.target.value;
                // Handle string 'null' case
                if (value === 'null') {
                  handleAnswerChange(null);
                } else {
                  handleAnswerChange(Number(value));
                }
              }}
              disabled={disabled}
              className="sr-only"
              data-testid={`a${optionIndex + 1}-input`}
            />
            <div className="flex items-center">
              <div className="flex items-center justify-center mr-3">
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${answer === option.value 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                  }
                `}>
                  {answer === option.value && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <span className="font-medium text-gray-900 dark:text-white">
                  {option.text}
                </span>
              </div>
              {answer === option.value && (
                <CheckCircle className="w-5 h-5 text-blue-500" />
              )}
            </div>
          </label>
        ))}
      </div>
    );
  };

  const renderMultipleChoice = () => {
    if (!question.options) return null;

    const selectedValues = Array.isArray(answer) ? answer : [];

    const handleMultipleChoiceChange = (optionValue: number, checked: boolean) => {
      let newAnswer: number[];
      if (checked) {
        newAnswer = [...selectedValues, optionValue];
      } else {
        newAnswer = selectedValues.filter(v => v !== optionValue);
      }
      handleAnswerChange(newAnswer);
    };

    return (
      <div className="space-y-3">
        {question.options.map((option) => {
          const isSelected = selectedValues.includes(option.value);

          return (
            <label
              key={option.id}
              className={`
                block p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
                }
                ${validationState.hasErrors && hasInteracted && showValidation
                  ? 'border-red-500'
                  : ''
                }
                ${validationState.hasWarnings && hasInteracted && showValidation
                  ? 'border-yellow-500'
                  : ''
                }
              `}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => handleMultipleChoiceChange(option.value, e.target.checked)}
                disabled={disabled}
                className="sr-only"
              />
              <div className="flex items-center">
                <div className="flex items-center justify-center mr-3">
                  <div className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                    }
                  `}>
                    {isSelected && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {option.text}
                  </span>
                </div>
                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                )}
              </div>
            </label>
          );
        })}

        {/* Show selection count */}
        {selectedValues.length > 0 && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {t('question.selectedCount', { count: selectedValues.length })}
          </div>
        )}
      </div>
    );
  };

  const renderScale = () => {
    const min = question.scaleMin || 1;
    const max = question.scaleMax || 5;
    const currentValue = answer !== null && answer !== undefined ? Number(answer) : null;

    const scaleOptions = [];
    for (let i = min; i <= max; i++) {
      scaleOptions.push(i);
    }

    return (
      <div className="space-y-4">
        {/* Scale labels */}
        {question.scaleLabels && (
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{question.scaleLabels.min}</span>
            <span>{question.scaleLabels.max}</span>
          </div>
        )}

        {/* Scale buttons */}
        <div className="flex justify-between items-center space-x-2">
          {scaleOptions.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleAnswerChange(value)}
              disabled={disabled}
              className={`
                flex-1 h-12 font-semibold rounded-lg border-2 transition-all duration-200
                ${currentValue === value
                  ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
                ${validationState.hasErrors && hasInteracted && showValidation
                  ? 'border-red-500 text-red-500'
                  : ''
                }
                ${validationState.hasWarnings && hasInteracted && showValidation
                  ? 'border-yellow-500 text-yellow-500'
                  : ''
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {value}
            </button>
          ))}
        </div>

        {/* Current selection indicator */}
        {currentValue !== null && (
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
              {t('question.selectedValue', { value: currentValue })}
            </div>
          </div>
        )}

        {/* Visual scale representation */}
        <div className="relative">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-200"
              style={{ width: currentValue !== null ? `${((currentValue - min) / (max - min)) * 100}%` : '0%' }}
            ></div>
          </div>
          <div className="flex justify-between mt-1">
            {scaleOptions.map((value) => (
              <div
                key={value}
                className={`
                  w-3 h-3 rounded-full transition-all duration-200
                  ${currentValue === value
                    ? 'bg-blue-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                  }
                `}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTextInput = () => {
    const textValue = typeof answer === 'string' ? answer : '';

    return (
      <div className="space-y-3">
        <textarea
          value={textValue}
          onChange={(e) => handleAnswerChange(e.target.value)}
          disabled={disabled}
          placeholder={t('question.textPlaceholder')}
          rows={4}
          maxLength={1000}
          className={`
            w-full resize-none rounded-lg border-2 p-3 transition-all duration-200
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            border-gray-300 dark:border-gray-600
            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
            ${validationState.hasErrors && hasInteracted && showValidation
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : validationState.hasWarnings && hasInteracted && showValidation
              ? 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20'
              : ''
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />

        {/* Character count */}
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            {textValue.length > 0 && t('question.characterCount', { count: textValue.length })}
          </span>
          <span>{textValue.length}/1000</span>
        </div>

        {/* Text input feedback */}
        {textValue.length > 0 && (
          <div className="flex items-center text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4 mr-1" />
            {t('question.textEntered')}
          </div>
        )}
      </div>
    );
  };

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'single_choice':
        return renderSingleChoice();
      case 'multiple_choice':
        return renderMultipleChoice();
      case 'scale':
        return renderScale();
      case 'text':
        return renderTextInput();
      default:
        return (
          <div className="text-center py-8 opacity-60">
            {t('errors.unsupportedQuestionType', { type: question.type })}
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Question content */}
      <div className="space-y-4">
        {renderQuestionContent()}
      </div>

      {/* Validation messages display */}
      {hasInteracted && showValidation && (
        <>
          {/* Error messages */}
          {validationState.hasErrors && (
            <div className="space-y-2">
              {validationState.errors.map((error, index) => (
                <div key={index} className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                </div>
              ))}
            </div>
          )}

          {/* Warning messages */}
          {validationState.hasWarnings && (
            <div className="space-y-2">
              {validationState.warnings.map((warning, index) => (
                <div key={index} className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-sm text-yellow-700 dark:text-yellow-300">{warning}</span>
                </div>
              ))}
            </div>
          )}

          {/* Validation in progress indicator */}
          {isValidating && (
            <div className="flex items-center p-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              {t('validation.checking')}
            </div>
          )}
        </>
      )}

      {/* Answer status indicator */}
      {validationState.isValid && hasInteracted && answer !== null && answer !== undefined && !isValidating && (
        <div className="flex items-center text-sm text-green-600 dark:text-green-400">
          <CheckCircle className="w-4 h-4 mr-2" />
          {t('question.answered')}
          {validationState.hasWarnings && (
            <span className="ml-2 text-yellow-600 dark:text-yellow-400">
              ({t('validation.withWarnings')})
            </span>
          )}
        </div>
      )}
    </div>
  );
}, createMemoComparison(['question', 'answer', 'disabled', 'showValidation']));
