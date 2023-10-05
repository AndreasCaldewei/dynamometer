import { DynamometerConfig } from '../Dynamometer';

/**
 * transformResponse: Transforms a DynamoDB response into a desired format.
 *
 * This function takes a DynamoDB response and a configuration object, and returns the response
 * in a format where the sort key is replaced by a custom ID field. The partition key and sort key
 * are removed from the response, and the sort key's value is added back under a custom ID field.
 *
 * @template T - The type to which the response should be transformed.
 *
 * @param response - The original DynamoDB response to be transformed.
 * @param config - The configuration object containing details about the DynamoDB table structure.
 *
 * @returns The transformed response.
 */
export const transformResponse = <T>(
  response: any,
  config: Required<DynamometerConfig>
): T => {
  const {
    [config.partitionKey]: partitionKey,
    [config.sortKey]: sortKey,
    ...rest
  } = response;

  return {
    ...rest,
    ...(config.includeIndex && { [config.partitionKey]: partitionKey }),
    ...(config.includeIndex && { [config.sortKey]: sortKey }),
  } as T;
};
