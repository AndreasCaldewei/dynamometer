import { DynamometerConfig } from '../types';

export const transformResponse = <T>(
  response: any,
  config: DynamometerConfig
): T => {
  const {
    [config.partitionKey!]: partitionKey,
    [config.sortKey!]: sortKey,
    ...rest
  } = response;

  return { ...rest, [config.id!]: sortKey } as T;
};
