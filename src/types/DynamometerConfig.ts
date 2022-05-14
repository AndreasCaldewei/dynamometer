import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { TranslateConfig } from '@aws-sdk/lib-dynamodb';

export type DynamometerConfig = {
  tableName: string;
  delimiter?: string;
  partitionKey?: string;
  sortKey?: string;
  translateConfig?: TranslateConfig;
  dynamoDBClientConfig?: DynamoDBClientConfig;
  uuidFunction?: () => string;
};
