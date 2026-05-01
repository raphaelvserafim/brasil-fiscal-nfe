import { DFeError } from '@brasil-fiscal/core';

export class NFeError extends DFeError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'NFeError';
  }
}
