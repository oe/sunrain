import { useState, useEffect, useCallback, useMemo, memo } from 'react';
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
      console.error('Validation failed:', error);
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
        {question.options.map((option) => (
          <label
            key={option.id}
            className={`
              flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
              ${answer === option.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800'
                : 'border-gray-200 dark:border-gray-600'
              }
              ${validationState.hasErrors && hasInteracted && showValidation
                ? 'border-red-300 dark:border-red-600'
                : ''
              }
              ${validationState.hasWarnings && hasInteracted && showValidation
                ? 'border-yellow-300 dark:border-yellow-600'
                : ''
              }
            `}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option.value}
              checked={answer === option.value}
              onChange={(e) => handleAnswerChange(Number(e.target.value))}
              disabled={disabled}
              className="sr-only"
            />
            <div className={`
              w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center
              ${answer === option.value
                ? 'border-blue-500 bg-blue-500'
                : 'border-gray-300 dark:border-gray-600'
              }
            `}>
              {answer === option.value && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
            <div className="flex-1">
              <span className="text-gray-900 dark:text-white font-medium">
                {option.text}
              </span>
            </div>
            {answer === option.value && (
              <svg className="w-5 h-5 text-blue-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
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
                flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800'
                  : 'border-gray-200 dark:border-gray-600'
                }
                ${validationState.hasErrors && hasInteracted && showValidation
                  ? 'border-red-300 dark:border-red-600'
                  : ''
                }
                ${validationState.hasWarnings && hasInteracted && showValidation
                  ? 'border-yellow-300 dark:border-yellow-600'
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
              <div className={`
                w-4 h-4 rounded border-2 mr-3 flex items-center justify-center
                ${isSelected
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300 dark:border-gray-600'
                }
              `}>
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <span className="text-gray-900 dark:text-white font-medium">
                  {option.text}
                </span>
              </div>
              {isSelected && (
                <svg className="w-5 h-5 text-blue-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
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
                flex-1 h-12 rounded-lg border-2 font-semibold transition-all duration-200
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                ${currentValue === value
                  ? 'border-blue-500 bg-blue-500 text-white shadow-lg'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500'
                }
                ${validationState.hasErrors && hasInteracted && showValidation
                  ? 'border-red-300 dark:border-red-600'
                  : ''
                }
                ${validationState.hasWarnings && hasInteracted && showValidation
                  ? 'border-yellow-300 dark:border-yellow-600'
                  : ''
                }
              `}
            >
              {value}
            </button>
          ))}
        </div>

        {/* Current selection indicator */}
        {currentValue !== null && (
          <div className="text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
              {t('question.selectedValue', { value: currentValue })}
            </span>
          </div>
        )}

        {/* Visual scale representation */}
        <div className="relative">
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            {currentValue !== null && (
              <div
                className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentValue - min) / (max - min)) * 100}%` }}
              />
            )}
          </div>
          <div className="flex justify-between mt-1">
            {scaleOptions.map((value) => (
              <div
                key={value}
                className={`
                  w-3 h-3 rounded-full border-2 transition-all duration-200
                  ${currentValue === value
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
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
            w-full px-4 py-3 border rounded-lg resize-none transition-all duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''}
            ${validationState.hasErrors && hasInteracted && showValidation
              ? 'border-red-300 dark:border-red-600 focus:ring-red-200 dark:focus:ring-red-800'
              : validationState.hasWarnings && hasInteracted && showValidation
              ? 'border-yellow-300 dark:border-yellow-600 focus:ring-yellow-200 dark:focus:ring-yellow-800'
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500'
            }
            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
            focus:outline-none focus:ring-2
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
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
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
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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
                <div key={index} className="flex items-start p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Warning messages */}
          {validationState.hasWarnings && (
            <div className="space-y-2">
              {validationState.warnings.map((warning, index) => (
                <div key={index} className="flex items-start p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      {warning}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Validation in progress indicator */}
          {isValidating && (
            <div className="flex items-center p-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('validation.checking')}
            </div>
          )}
        </>
      )}

      {/* Answer status indicator */}
      {validationState.isValid && hasInteracted && answer !== null && answer !== undefined && !isValidating && (
        <div className="flex items-center text-sm text-green-600 dark:text-green-400">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
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
