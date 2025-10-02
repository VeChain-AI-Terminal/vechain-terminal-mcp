import type { z } from 'zod';

/**
 * Creates a parameter class for tools
 * This is used with the @Tool decorator
 * Based on GOAT SDK pattern
 */
export function createToolParameters<T extends z.ZodSchema>(schema: T) {
  class ToolParameters {
    static schema = schema;
    constructor(public readonly params: z.infer<T>) {}
  }
  
  // Make schema accessible through prototype chain for reflection
  (ToolParameters as any).prototype.constructor.schema = schema;
  
  return ToolParameters;
}


