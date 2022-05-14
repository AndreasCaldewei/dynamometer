import { DynamometerConfig } from '../types/DynamometerConfig';

export const BaseConfig: Partial<DynamometerConfig> = {
  delimiter: '#',
  partitionKey: 'PK',
  sortKey: 'SK',
  translateConfig: {
    marshallOptions: {
      convertEmptyValues: false,
      removeUndefinedValues: false,
      convertClassInstanceToMap: false,
    },
    unmarshallOptions: {
      wrapNumbers: false,
    },
  },
};
