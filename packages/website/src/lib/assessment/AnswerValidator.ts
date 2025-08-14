import type { Question } from "@/types/assessment";
// Removed unused imports
import { assessmentLogger } from "./AssessmentLogger";

/**
 * 验证结果接口
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * 验证错误接口
 */
export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  value?: any;
  severity: "error" | "warning";
}

/**
 * 验证警告接口
 */
export interface ValidationWarning {
  code: string;
  message: string;
  suggestion?: string;
}

/**
 * 验证规则接口
 */
export interface ValidationRule {
  name: string;
  validate(value: any, question: Question): ValidationError | null;
  priority: number; // 优先级，数字越小优先级越高
}

/**
 * 自定义验证规则接口
 */
export interface CustomValidationRule extends ValidationRule {
  condition?: (question: Question) => boolean; // 应用条件
}

/**
 * 必填字段验证规则
 */
export class RequiredFieldRule implements ValidationRule {
  name = "required";
  priority = 1;

  validate(value: any, question: Question): ValidationError | null {
    if (!question.required) return null;

    if (value === null || value === undefined || value === "") {
      return {
        code: "FIELD_REQUIRED",
        message: "此字段为必填项",
        field: question.id,
        value,
        severity: "error",
      };
    }

    // 对于数组类型（多选题），检查是否为空数组
    if (Array.isArray(value) && value.length === 0) {
      return {
        code: "FIELD_REQUIRED",
        message: "请至少选择一个选项",
        field: question.id,
        value,
        severity: "error",
      };
    }

    return null;
  }
}

/**
 * 单选题验证规则
 */
export class SingleChoiceRule implements ValidationRule {
  name = "single_choice";
  priority = 2;

  validate(value: any, question: Question): ValidationError | null {
    if (question.type !== "single_choice") return null;

    if (value === null || value === undefined) {
      return question.required
        ? {
            code: "SINGLE_CHOICE_REQUIRED",
            message: "请选择一个选项",
            field: question.id,
            value,
            severity: "error",
          }
        : null;
    }

    if (!question.options) {
      return {
        code: "SINGLE_CHOICE_NO_OPTIONS",
        message: "问题配置错误：缺少选项",
        field: question.id,
        value,
        severity: "error",
      };
    }

    // Check if value matches either option.id or option.value
    const validOptionIds = question.options.map((opt) => opt.id);
    const validOptionValues = question.options.map((opt) => opt.value);

    if (!validOptionIds.includes(value) && !validOptionValues.includes(value)) {
      return {
        code: "SINGLE_CHOICE_INVALID_OPTION",
        message: "选择的选项无效",
        field: question.id,
        value,
        severity: "error",
      };
    }

    return null;
  }
}

/**
 * 多选题验证规则
 */
export class MultipleChoiceRule implements ValidationRule {
  name = "multiple_choice";
  priority = 2;

  validate(value: any, question: Question): ValidationError | null {
    if (question.type !== "multiple_choice") return null;

    if (!Array.isArray(value)) {
      return {
        code: "MULTIPLE_CHOICE_INVALID_FORMAT",
        message: "多选题答案必须是数组格式",
        field: question.id,
        value,
        severity: "error",
      };
    }

    if (!question.options) {
      return {
        code: "MULTIPLE_CHOICE_NO_OPTIONS",
        message: "问题配置错误：缺少选项",
        field: question.id,
        value,
        severity: "error",
      };
    }

    // Check if values match either option.id or option.value
    const validOptionIds = question.options.map((opt) => opt.id);
    const validOptionValues = question.options.map((opt) => opt.value);
    const invalidOptions = value.filter(
      (v) => !validOptionIds.includes(v) && !validOptionValues.includes(v)
    );

    if (invalidOptions.length > 0) {
      return {
        code: "MULTIPLE_CHOICE_INVALID_OPTIONS",
        message: `选择的选项无效: ${invalidOptions.join(", ")}`,
        field: question.id,
        value: invalidOptions,
        severity: "error",
      };
    }

    // 检查最小和最大选择数量
    if (question.minSelections && value.length < question.minSelections) {
      return {
        code: "MULTIPLE_CHOICE_MIN_SELECTIONS",
        message: `至少需要选择 ${question.minSelections} 个选项`,
        field: question.id,
        value,
        severity: "error",
      };
    }

    if (question.maxSelections && value.length > question.maxSelections) {
      return {
        code: "MULTIPLE_CHOICE_MAX_SELECTIONS",
        message: `最多只能选择 ${question.maxSelections} 个选项`,
        field: question.id,
        value,
        severity: "error",
      };
    }

    return null;
  }
}

/**
 * 量表题验证规则
 */
export class ScaleRule implements ValidationRule {
  name = "scale";
  priority = 2;

  validate(value: any, question: Question): ValidationError | null {
    if (question.type !== "scale") return null;

    if (value === null || value === undefined) {
      return question.required
        ? {
            code: "SCALE_REQUIRED",
            message: "请选择一个数值",
            field: question.id,
            value,
            severity: "error",
          }
        : null;
    }

    const numValue = Number(value);
    if (isNaN(numValue)) {
      return {
        code: "SCALE_INVALID_NUMBER",
        message: "量表答案必须是数字",
        field: question.id,
        value,
        severity: "error",
      };
    }

    if (question.scaleMin !== undefined && numValue < question.scaleMin) {
      return {
        code: "SCALE_BELOW_MIN",
        message: `数值不能小于 ${question.scaleMin}`,
        field: question.id,
        value,
        severity: "error",
      };
    }

    if (question.scaleMax !== undefined && numValue > question.scaleMax) {
      return {
        code: "SCALE_ABOVE_MAX",
        message: `数值不能大于 ${question.scaleMax}`,
        field: question.id,
        value,
        severity: "error",
      };
    }

    // 检查步长
    if (question.scaleStep !== undefined && question.scaleMin !== undefined) {
      const steps = (numValue - question.scaleMin) / question.scaleStep;
      if (!Number.isInteger(steps)) {
        return {
          code: "SCALE_INVALID_STEP",
          message: `数值必须是 ${question.scaleStep} 的倍数`,
          field: question.id,
          value,
          severity: "error",
        };
      }
    }

    return null;
  }
}

/**
 * 文本输入验证规则
 */
export class TextRule implements ValidationRule {
  name = "text";
  priority = 2;

  validate(value: any, question: Question): ValidationError | null {
    if (question.type !== "text") return null;

    if (value === null || value === undefined) {
      return question.required
        ? {
            code: "TEXT_REQUIRED",
            message: "请输入文本内容",
            field: question.id,
            value,
            severity: "error",
          }
        : null;
    }

    if (typeof value !== "string") {
      return {
        code: "TEXT_INVALID_TYPE",
        message: "文本答案必须是字符串类型",
        field: question.id,
        value,
        severity: "error",
      };
    }

    // 检查最小长度
    if (question.minLength !== undefined && value.length < question.minLength) {
      return {
        code: "TEXT_TOO_SHORT",
        message: `文本长度不能少于 ${question.minLength} 个字符`,
        field: question.id,
        value,
        severity: "error",
      };
    }

    // 检查最大长度
    if (question.maxLength !== undefined && value.length > question.maxLength) {
      return {
        code: "TEXT_TOO_LONG",
        message: `文本长度不能超过 ${question.maxLength} 个字符`,
        field: question.id,
        value,
        severity: "error",
      };
    }

    // 检查正则表达式模式
    if (question.pattern) {
      const regex = new RegExp(question.pattern);
      if (!regex.test(value)) {
        return {
          code: "TEXT_PATTERN_MISMATCH",
          message: question.patternMessage || "输入格式不正确",
          field: question.id,
          value,
          severity: "error",
        };
      }
    }

    return null;
  }
}

/**
 * 数字输入验证规则
 */
export class NumberRule implements ValidationRule {
  name = "number";
  priority = 2;

  validate(value: any, question: Question): ValidationError | null {
    if (question.type !== "number") return null;

    if (value === null || value === undefined || value === "") {
      return question.required
        ? {
            code: "NUMBER_REQUIRED",
            message: "请输入数字",
            field: question.id,
            value,
            severity: "error",
          }
        : null;
    }

    const numValue = Number(value);
    if (isNaN(numValue)) {
      return {
        code: "NUMBER_INVALID",
        message: "请输入有效的数字",
        field: question.id,
        value,
        severity: "error",
      };
    }

    // 检查最小值
    if (question.min !== undefined && numValue < question.min) {
      return {
        code: "NUMBER_TOO_SMALL",
        message: `数值不能小于 ${question.min}`,
        field: question.id,
        value,
        severity: "error",
      };
    }

    // 检查最大值
    if (question.max !== undefined && numValue > question.max) {
      return {
        code: "NUMBER_TOO_LARGE",
        message: `数值不能大于 ${question.max}`,
        field: question.id,
        value,
        severity: "error",
      };
    }

    // 检查是否为整数
    if (question.integer && !Number.isInteger(numValue)) {
      return {
        code: "NUMBER_NOT_INTEGER",
        message: "请输入整数",
        field: question.id,
        value,
        severity: "error",
      };
    }

    return null;
  }
}

/**
 * 日期验证规则
 */
export class DateRule implements ValidationRule {
  name = "date";
  priority = 2;

  validate(value: any, question: Question): ValidationError | null {
    if (question.type !== "date") return null;

    if (value === null || value === undefined || value === "") {
      return question.required
        ? {
            code: "DATE_REQUIRED",
            message: "请选择日期",
            field: question.id,
            value,
            severity: "error",
          }
        : null;
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return {
        code: "DATE_INVALID",
        message: "请输入有效的日期",
        field: question.id,
        value,
        severity: "error",
      };
    }

    // 检查最小日期
    if (question.minDate) {
      const minDate = new Date(question.minDate);
      if (date < minDate) {
        return {
          code: "DATE_TOO_EARLY",
          message: `日期不能早于 ${minDate.toLocaleDateString()}`,
          field: question.id,
          value,
          severity: "error",
        };
      }
    }

    // 检查最大日期
    if (question.maxDate) {
      const maxDate = new Date(question.maxDate);
      if (date > maxDate) {
        return {
          code: "DATE_TOO_LATE",
          message: `日期不能晚于 ${maxDate.toLocaleDateString()}`,
          field: question.id,
          value,
          severity: "error",
        };
      }
    }

    return null;
  }
}

/**
 * 答案验证器类
 */
export class AnswerValidator {
  private rules: ValidationRule[] = [];
  private customRules: CustomValidationRule[] = [];

  constructor() {
    // 注册默认验证规则
    this.registerDefaultRules();
  }

  /**
   * 注册默认验证规则
   */
  private registerDefaultRules(): void {
    this.addRule(new RequiredFieldRule());
    this.addRule(new SingleChoiceRule());
    this.addRule(new MultipleChoiceRule());
    this.addRule(new ScaleRule());
    this.addRule(new TextRule());
    this.addRule(new NumberRule());
    this.addRule(new DateRule());
  }

  /**
   * 添加验证规则
   */
  addRule(rule: ValidationRule): void {
    this.rules.push(rule);
    // 按优先级排序
    this.rules.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 添加自定义验证规则
   */
  addCustomRule(rule: CustomValidationRule): void {
    this.customRules.push(rule);
    this.customRules.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 移除验证规则
   */
  removeRule(ruleName: string): void {
    this.rules = this.rules.filter((rule) => rule.name !== ruleName);
    this.customRules = this.customRules.filter(
      (rule) => rule.name !== ruleName
    );
  }

  /**
   * 验证单个答案
   */
  validateAnswer(value: any, question: Question): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // 应用标准验证规则
      for (const rule of this.rules) {
        try {
          const error = rule.validate(value, question);
          if (error) {
            if (error.severity === "error") {
              errors.push(error);
            } else {
              warnings.push({
                code: error.code,
                message: error.message,
                suggestion: this.getSuggestion(error.code, question),
              });
            }
          }
        } catch (ruleError) {
          assessmentLogger.error(
            "VALIDATION",
            `Rule ${rule.name} failed`,
            ruleError as Error
          );
          errors.push({
            code: "VALIDATION_RULE_ERROR",
            message: "验证规则执行失败",
            field: question.id,
            value,
            severity: "error",
          });
        }
      }

      // 应用自定义验证规则
      for (const rule of this.customRules) {
        try {
          // 检查应用条件
          if (rule.condition && !rule.condition(question)) {
            continue;
          }

          const error = rule.validate(value, question);
          if (error) {
            if (error.severity === "error") {
              errors.push(error);
            } else {
              warnings.push({
                code: error.code,
                message: error.message,
                suggestion: this.getSuggestion(error.code, question),
              });
            }
          }
        } catch (ruleError) {
          assessmentLogger.error(
            "VALIDATION",
            `Custom rule ${rule.name} failed`,
            ruleError as Error
          );
          errors.push({
            code: "CUSTOM_VALIDATION_RULE_ERROR",
            message: "自定义验证规则执行失败",
            field: question.id,
            value,
            severity: "error",
          });
        }
      }

      const result: ValidationResult = {
        valid: errors.length === 0,
        errors,
        warnings,
      };

      // 记录验证结果
      if (errors.length > 0) {
        assessmentLogger.warn("VALIDATION", "Answer validation failed", {
          questionId: question.id,
          questionType: question.type,
          errors: errors.map((e) => e.code),
          value: typeof value === "object" ? JSON.stringify(value) : value,
        });
      } else {
        assessmentLogger.debug("VALIDATION", "Answer validation passed", {
          questionId: question.id,
          questionType: question.type,
          warningCount: warnings.length,
        });
      }

      return result;
    } catch (error) {
      assessmentLogger.error(
        "VALIDATION",
        "Validation process failed",
        error as Error
      );

      return {
        valid: false,
        errors: [
          {
            code: "VALIDATION_PROCESS_ERROR",
            message: "验证过程出现错误",
            field: question.id,
            value,
            severity: "error",
          },
        ],
        warnings: [],
      };
    }
  }

  /**
   * 批量验证答案
   */
  validateAnswers(
    answers: Map<string, any>,
    questions: Question[]
  ): Map<string, ValidationResult> {
    const results = new Map<string, ValidationResult>();

    for (const question of questions) {
      const value = answers.get(question.id);
      const result = this.validateAnswer(value, question);
      results.set(question.id, result);
    }

    return results;
  }

  /**
   * 实时验证（用于用户输入时的即时反馈）
   */
  validateRealtime(value: any, question: Question): ValidationResult {
    // 实时验证通常只检查格式和基本规则，不检查必填项
    const tempQuestion = { ...question, required: false };
    return this.validateAnswer(value, tempQuestion);
  }

  /**
   * 获取验证建议
   */
  private getSuggestion(
    errorCode: string,
    question: Question
  ): string | undefined {
    switch (errorCode) {
      case "FIELD_REQUIRED":
        return question.type === "multiple_choice"
          ? "请至少选择一个选项"
          : "请填写此字段";
      case "TEXT_TOO_SHORT":
        return `请输入至少 ${question.minLength} 个字符`;
      case "TEXT_TOO_LONG":
        return `请将文本缩短至 ${question.maxLength} 个字符以内`;
      case "SCALE_BELOW_MIN":
        return `请选择 ${question.scaleMin} 或更高的数值`;
      case "SCALE_ABOVE_MAX":
        return `请选择 ${question.scaleMax} 或更低的数值`;
      case "MULTIPLE_CHOICE_MIN_SELECTIONS":
        return `请至少选择 ${question.minSelections} 个选项`;
      case "MULTIPLE_CHOICE_MAX_SELECTIONS":
        return `请最多选择 ${question.maxSelections} 个选项`;
      default:
        return undefined;
    }
  }

  /**
   * 获取问题类型的验证规则
   */
  getRulesForQuestionType(questionType: string): ValidationRule[] {
    return this.rules.filter(
      (rule) => rule.name === "required" || rule.name === questionType
    );
  }


}

// 导出单例实例
let _answerValidatorInstance: AnswerValidator | null = null;

export const answerValidator = {
  getInstance(): AnswerValidator {
    if (!_answerValidatorInstance) {
      _answerValidatorInstance = new AnswerValidator();
    }
    return _answerValidatorInstance;
  },

  // 代理主要方法到单例实例
  validateAnswer(value: any, question: Question) {
    return this.getInstance().validateAnswer(value, question);
  },

  validateAnswers(answers: Map<string, any>, questions: Question[]) {
    return this.getInstance().validateAnswers(answers, questions);
  },

  validateRealtime(value: any, question: Question) {
    return this.getInstance().validateRealtime(value, question);
  },

  addCustomRule(rule: CustomValidationRule) {
    return this.getInstance().addCustomRule(rule);
  },

  removeRule(ruleName: string) {
    return this.getInstance().removeRule(ruleName);
  },


};
