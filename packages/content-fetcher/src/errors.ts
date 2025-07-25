export class ContentFetcherError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ContentFetcherError';
  }
}

export class APIError extends ContentFetcherError {
  constructor(
    message: string,
    public statusCode: number,
    public apiName: string,
    details?: any
  ) {
    super(message, 'API_ERROR', details);
    this.name = 'APIError';
  }
}

export class ValidationError extends ContentFetcherError {
  constructor(
    message: string,
    public field: string,
    public value: any
  ) {
    super(message, 'VALIDATION_ERROR', { field, value });
    this.name = 'ValidationError';
  }
}

export class ConfigurationError extends ContentFetcherError {
  constructor(message: string, public missingConfig: string) {
    super(message, 'CONFIG_ERROR', { missingConfig });
    this.name = 'ConfigurationError';
  }
}

export function handleError(error: unknown, logger: any): ContentFetcherError {
  if (error instanceof ContentFetcherError) {
    logger.error(`ContentFetcher Error: ${error.message}`, {
      code: error.code,
      details: error.details
    });
    return error;
  }

  if (error instanceof Error) {
    const wrappedError = new ContentFetcherError(
      error.message,
      'UNKNOWN_ERROR',
      { originalError: error.name }
    );
    logger.error(`Unexpected Error: ${error.message}`, { stack: error.stack });
    return wrappedError;
  }

  const unknownError = new ContentFetcherError(
    'An unknown error occurred',
    'UNKNOWN_ERROR',
    { error }
  );
  logger.error('Unknown error occurred', { error });
  return unknownError;
}