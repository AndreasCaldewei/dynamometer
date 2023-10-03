import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Dynamometer } from '../src';

jest.mock('@aws-sdk/lib-dynamodb');
jest.mock('@aws-sdk/client-dynamodb');

describe('Dynamometer', () => {
  const mockConfig = {
    tableName: 'testTable',
  };

  beforeEach(() => {
    // Reset all instances and calls to constructor and all methods:
    DynamoDBDocument.from.mockClear();
    DynamoDBClient.mockClear();
  });

  it('should create a new Dynamometer instance with default config', () => {
    const dynamometer = Dynamometer.create(mockConfig);

    expect(DynamoDBDocument.from).toHaveBeenCalledTimes(1);
    expect(dynamometer.config.delimiter).toEqual('#');
    expect(dynamometer.config.partitionKey).toEqual('PK');
    expect(dynamometer.config.sortKey).toEqual('SK');
    expect(dynamometer.config.idField).toEqual('id');
  });

  it('should create a new Dynamometer instance with custom config', () => {
    const customConfig = {
      ...mockConfig,
      delimiter: '|',
      partitionKey: 'customPK',
      sortKey: 'customSK',
      idField: 'customID',
    };

    const dynamometer = Dynamometer.create(customConfig);

    expect(DynamoDBDocument.from).toHaveBeenCalledTimes(1);
    expect(dynamometer.config.delimiter).toEqual('|');
    expect(dynamometer.config.partitionKey).toEqual('customPK');
    expect(dynamometer.config.sortKey).toEqual('customSK');
    expect(dynamometer.config.idField).toEqual('customID');
  });

  it('should create a Dynamometer instance from an existing DynamoDBDocument', () => {
    const mockDynamoDBDocument = {}; // Mock DynamoDBDocument instance
    const dynamometer = Dynamometer.fromDynamoDBDocument(
      mockDynamoDBDocument,
      mockConfig
    );

    expect(DynamoDBDocument.from).not.toHaveBeenCalled();
    expect(dynamometer.dynamoDBDocument).toBe(mockDynamoDBDocument);
  });

  it('should create and return a new Collection instance', () => {
    const dynamometer = Dynamometer.create(mockConfig);
    const collection = dynamometer.collection('testCollection');

    expect(collection).toBeDefined();
    expect(collection.path).toEqual('testCollection');
  });
});
