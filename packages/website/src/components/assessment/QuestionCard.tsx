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
        {question.options.map((option) => (
          <label
            key={option.id}
            className={`
              card card-compact cursor-pointer transition-all duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-base-200'}
              ${answer === option.value
                ? 'border-2 border-primary bg-primary/10'
                : 'border-2 border-base-300'
              }
              ${validationState.hasErrors && hasInteracted && showValidation
                ? 'border-error'
                : ''
              }
              ${validationState.hasWarnings && hasInteracted && showValidation
                ? 'border-warning'
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
            />
            <div className="card-body flex-row items-center p-4">
              <div className="flex items-center justify-center mr-3">
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${answer === option.value 
                    ? 'border-primary bg-primary' 
                    : 'border-base-300 bg-base-100'
                  }
                `}>
                  {answer === option.value && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <span className="font-medium">
                  {option.text}
                </span>
              </div>
              {answer === option.value && (
                <CheckCircle className="w-5 h-5 text-primary" />
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
                card card-compact cursor-pointer transition-all duration-200
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-base-200'}
                ${isSelected
                  ? 'border-2 border-primary bg-primary/10'
                  : 'border-2 border-base-300'
                }
                ${validationState.hasErrors && hasInteracted && showValidation
                  ? 'border-error'
                  : ''
                }
                ${validationState.hasWarnings && hasInteracted && showValidation
                  ? 'border-warning'
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
              <div className="card-body flex-row items-center p-4">
                <div className="flex items-center justify-center mr-3">
                  <div className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center
                    ${isSelected 
                      ? 'border-primary bg-primary' 
                      : 'border-base-300 bg-base-100'
                    }
                  `}>
                    {isSelected && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <span className="font-medium">
                    {option.text}
                  </span>
                </div>
                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-primary" />
                )}
              </div>
            </label>
          );
        })}

        {/* Show selection count */}
        {selectedValues.length > 0 && (
          <div className="mt-3 text-sm opacity-70">
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
          <div className="flex justify-between text-sm opacity-70">
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
                btn flex-1 h-12 font-semibold
                ${currentValue === value
                  ? 'btn-primary'
                  : 'btn-outline'
                }
                ${validationState.hasErrors && hasInteracted && showValidation
                  ? 'btn-error'
                  : ''
                }
                ${validationState.hasWarnings && hasInteracted && showValidation
                  ? 'btn-warning'
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
            <div className="badge badge-primary">
              {t('question.selectedValue', { value: currentValue })}
            </div>
          </div>
        )}

        {/* Visual scale representation */}
        <div className="relative">
          <progress
            className="progress progress-primary w-full"
            value={currentValue !== null ? ((currentValue - min) / (max - min)) * 100 : 0}
            max="100"
          ></progress>
          <div className="flex justify-between mt-1">
            {scaleOptions.map((value) => (
              <div
                key={value}
                className={`
                  w-3 h-3 rounded-full transition-all duration-200
                  ${currentValue === value
                    ? 'bg-primary'
                    : 'bg-base-300'
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
            textarea textarea-bordered w-full resize-none
            ${validationState.hasErrors && hasInteracted && showValidation
              ? 'textarea-error'
              : validationState.hasWarnings && hasInteracted && showValidation
              ? 'textarea-warning'
              : 'textarea-primary'
            }
          `}
        />

        {/* Character count */}
        <div className="flex justify-between text-sm opacity-60">
          <span>
            {textValue.length > 0 && t('question.characterCount', { count: textValue.length })}
          </span>
          <span>{textValue.length}/1000</span>
        </div>

        {/* Text input feedback */}
        {textValue.length > 0 && (
          <div className="flex items-center text-sm text-success">
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
                <div key={index} className="alert alert-error">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              ))}
            </div>
          )}

          {/* Warning messages */}
          {validationState.hasWarnings && (
            <div className="space-y-2">
              {validationState.warnings.map((warning, index) => (
                <div key={index} className="alert alert-warning">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm">{warning}</span>
                </div>
              ))}
            </div>
          )}

          {/* Validation in progress indicator */}
          {isValidating && (
            <div className="flex items-center p-2 text-sm opacity-70">
              <span className="loading loading-spinner loading-sm mr-2"></span>
              {t('validation.checking')}
            </div>
          )}
        </>
      )}

      {/* Answer status indicator */}
      {validationState.isValid && hasInteracted && answer !== null && answer !== undefined && !isValidating && (
        <div className="flex items-center text-sm text-success">
          <CheckCircle className="w-4 h-4 mr-2" />
          {t('question.answered')}
          {validationState.hasWarnings && (
            <span className="ml-2 text-warning">
              ({t('validation.withWarnings')})
            </span>
          )}
        </div>
      )}
    </div>
  );
}, createMemoComparison(['question', 'answer', 'disabled', 'showValidation']));
