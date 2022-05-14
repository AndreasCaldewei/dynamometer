import { DynamoDB, TableClass } from '@aws-sdk/client-dynamodb';

export const createTable = (
  dynamoDB: DynamoDB = new DynamoDB({
    region: 'eu-central-1',
    endpoint: 'http://localhost:8000/',
  }),
  tableName: string = 'Test'
) => {
  return dynamoDB
    .createTable({
      TableName: tableName,
      AttributeDefinitions: [
        {
          AttributeName: 'PK',
          AttributeType: 'S',
        },
        {
          AttributeName: 'SK',
          AttributeType: 'S',
        },
      ],
      KeySchema: [
        {
          AttributeName: 'PK',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'SK',
          KeyType: 'RANGE',
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10,
      },
      TableClass: TableClass.STANDARD,
    })
    .catch(() => {
      return null;
    });
};
