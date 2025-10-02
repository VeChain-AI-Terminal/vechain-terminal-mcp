import 'reflect-metadata';
import type { z } from 'zod';
import { WalletClientBase } from './WalletClientBase.js';
import { snakeCase } from '../utils/snakeCase.js';

/**
 * Parameters for the Tool decorator
 */
export type ToolDecoratorParams = {
  name?: string;
  description: string;
};

/**
 * Stored metadata for a tool
 */
export type StoredToolMetadata = {
  name: string;
  description: string;
  parameters: {
    index: number;
    schema: z.ZodSchema;
  };
  walletClient?: {
    index: number;
  };
  target: Function;
};

export type StoredToolMetadataMap = Map<string, StoredToolMetadata>;

export const toolMetadataKey = Symbol('vechain:tool');

/**
 * Decorator that marks a class method as a tool accessible to the AI
 * Usage:
 * @Tool({ description: 'Transfer VET tokens' })
 * async transferVET(walletClient: VeChainWalletClient, parameters: TransferParams) { }
 */
export function Tool(params: ToolDecoratorParams) {
  return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const { parameters, walletClient } = validateMethodParameters(target, propertyKey);

    const existingTools: StoredToolMetadataMap =
      Reflect.getMetadata(toolMetadataKey, target.constructor) || new Map();

    existingTools.set(propertyKey, {
      target: descriptor.value,
      name: params.name ?? snakeCase(propertyKey),
      description: params.description,
      parameters: parameters,
      ...(walletClient ? { walletClient } : {}),
    });

    Reflect.defineMetadata(toolMetadataKey, existingTools, target.constructor);
    return target;
  };
}

function validateMethodParameters(
  target: Object,
  propertyKey: string
): {
  parameters: {
    index: number;
    schema: z.ZodSchema;
  };
  walletClient?: {
    index: number;
  };
} {
  const className = target instanceof Object ? target.constructor.name : undefined;
  const logPrefix = `Method '${propertyKey}'${className ? ` on class '${className}'` : ''}`;
  const explainer =
    'Tool methods must have at least one parameter that is a Zod schema class created with createToolParameters.';

  const methodParameters = Reflect.getMetadata('design:paramtypes', target, propertyKey);

  if (methodParameters == null) {
    throw new Error(`Failed to get parameters for ${logPrefix}.`);
  }
  if (methodParameters.length === 0) {
    throw new Error(`${logPrefix} has no parameters. ${explainer}`);
  }
  if (methodParameters.length > 2) {
    throw new Error(`${logPrefix} has ${methodParameters.length} parameters. Tool methods can have 1-2 parameters: (parameters) or (walletClient, parameters).`);
  }

  const parametersParameter = methodParameters.find(isParametersParameter);
  if (parametersParameter == null) {
    throw new Error(
      `${logPrefix} has no parameters parameter.\n\n1.) ${explainer}\n\n2.) Ensure that you are not using 'import type' for the parameters.`
    );
  }

  const walletClientParameter = methodParameters.find(isWalletClientParameter);

  return {
    parameters: {
      index: methodParameters.indexOf(parametersParameter) as number,
      schema: parametersParameter.prototype.constructor.schema,
    },
    ...(walletClientParameter
      ? { walletClient: { index: methodParameters.indexOf(walletClientParameter) as number } }
      : {}),
  };
}

function isWalletClientParameter(param: any): boolean {
  if (!param || !param.prototype) {
    return false;
  }
  if (param === WalletClientBase) {
    return true;
  }
  return param.prototype instanceof WalletClientBase;
}

function isParametersParameter(param: any): boolean {
  return param.prototype?.constructor?.schema != null;
}


