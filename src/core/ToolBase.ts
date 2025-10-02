import type { z } from 'zod';
import type { ToolConfig } from './types.js';

/**
 * Abstract base class for creating tools with typed parameters and results
 * Based on GOAT SDK's ToolBase pattern
 */
export abstract class ToolBase<TParameters extends z.ZodSchema = z.ZodSchema, TResult = any> {
  public readonly name: string;
  public readonly description: string;
  public readonly parameters: TParameters;

  constructor(config: ToolConfig<TParameters>) {
    this.name = config.name;
    this.description = config.description;
    this.parameters = config.parameters;
  }

  /**
   * Executes the tool with the provided parameters
   */
  abstract execute(parameters: z.infer<TParameters>): TResult | Promise<TResult>;
}

/**
 * Creates a new Tool instance with the provided configuration and execution function
 * Helper function to create tools without extending the class
 */
export function createTool<TParameters extends z.ZodSchema, TResult = any>(
  config: ToolConfig<TParameters>,
  execute: (parameters: z.infer<TParameters>) => TResult | Promise<TResult>
): ToolBase<TParameters, TResult> {
  return new (class extends ToolBase<TParameters, TResult> {
    execute(parameters: z.infer<TParameters>): TResult | Promise<TResult> {
      return execute(parameters);
    }
  })(config);
}


