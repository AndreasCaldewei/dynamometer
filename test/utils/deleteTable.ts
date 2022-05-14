import { DynamoDB } from '@aws-sdk/client-dynamodb';

export const deleteTable = (
  dynamoDB: DynamoDB = new DynamoDB({
    region: 'eu-central-1',
    endpoint: 'http://localhost:8000/',
  }),
  tableName: string = 'Test'
) => {
  return dynamoDB
    .deleteTable({
      TableName: tableName,
    })
    .catch(() => {
      return null;
    });
};
