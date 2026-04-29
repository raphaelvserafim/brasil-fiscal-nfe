import { NFeError } from './NFeError';

export type FieldError = {
  readonly field: string;
  readonly message: string;
  readonly expected?: string;
  readonly received?: string;
};

export class SchemaValidationError extends NFeError {
  constructor(
    message: string,
    public readonly errors: FieldError[]
  ) {
    super(message);
    this.name = 'SchemaValidationError';
  }
}
