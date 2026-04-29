export type ValidationResult = {
  readonly valid: boolean;
  readonly errors: ValidationError[];
};

export type ValidationError = {
  readonly field: string;
  readonly message: string;
  readonly expected?: string;
  readonly received?: string;
};

export interface SchemaValidator {
  validate(xml: string): ValidationResult;
}
