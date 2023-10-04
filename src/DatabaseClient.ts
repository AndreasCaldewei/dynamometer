import { Dynamometer } from './Dynamometer';
import { FilterFunction } from './Filters';
import {
  DeleteCommandOutput,
  DynamoDBDocument,
  GetCommandOutput,
  PutCommandOutput,
  QueryCommandOutput,
} from '@aws-sdk/lib-dynamodb';

type Arguments<T extends (...args: any) => any> = Parameters<T>[0];

// Define a type for database hooks, specifying hook names and their argument types
export type DatabaseHooks = {
  'put:before': (args: Arguments<typeof DatabaseClient.prototype.put>) => void;
  'put:after': (args: PutCommandOutput) => void;
  'delete:before': (
    args: Arguments<typeof DatabaseClient.prototype.delete>
  ) => void;
  'delete:after': (args: DeleteCommandOutput) => void;
  'get:before': (args: Arguments<typeof DatabaseClient.prototype.get>) => void;
  'get:after': (args: GetCommandOutput) => void;
  'query:before': (
    args: Arguments<typeof DatabaseClient.prototype.query>
  ) => void;
  'query:after': (args: QueryCommandOutput) => void;
};

/**
 * A utility class for performing database operations using DynamoDBDocument from the AWS SDK.
 */
export class DatabaseClient {
  /**
   * Creates a new DatabaseClient instance.
   *
   * @param {Dynamometer} dynamometer - An instance of the Dynamometer class for managing DynamoDB configurations and hooks.
   * @param {DynamoDBDocument} ddbDocClient - An instance of DynamoDBDocument for interacting with the DynamoDB database.
   */
  constructor(
    private dynamometer: Dynamometer,
    private ddbDocClient: DynamoDBDocument
  ) {}

  /**
   * Puts data into the database with the provided partition key, sort key, and data.
   *
   * @param {Object} args - An object containing partitionKey, sortKey, and data.
   * @returns {Promise<PutCommandOutput>} - A promise that resolves with the response from the put operation.
   */
  async put(args: {
    partitionKey: string;
    sortKey: string;
    data: any;
  }): Promise<PutCommandOutput> {
    await this.dynamometer.hooks.callHook('put:before', args);
    const response = await this.ddbDocClient.put({
      TableName: this.dynamometer.config.tableName,
      Item: {
        ...args.data,
        [this.dynamometer.config.partitionKey]: args.partitionKey,
        [this.dynamometer.config.sortKey]: args.sortKey,
      },
    });
    await this.dynamometer.hooks.callHook('put:after', response);
    return response;
  }

  /**
   * Deletes data from the database with the provided partition key and sort key.
   *
   * @param {Object} args - An object containing partitionKey and sortKey.
   * @returns {Promise<DeleteCommandOutput>} - A promise that resolves with the response from the delete operation.
   */
  async delete(args: {
    partitionKey: string;
    sortKey: string;
  }): Promise<DeleteCommandOutput> {
    await this.dynamometer.hooks.callHook('delete:before', args);
    const response = await this.ddbDocClient.delete({
      TableName: this.dynamometer.config.tableName,
      Key: {
        [this.dynamometer.config.partitionKey]: args.partitionKey,
        [this.dynamometer.config.sortKey]: args.sortKey,
      },
    });
    await this.dynamometer.hooks.callHook('delete:after', response);
    return response;
  }

  /**
   * Retrieves data from the database with the provided partition key and sort key.
   *
   * @param {Object} args - An object containing partitionKey and sortKey.
   * @returns {Promise<GetCommandOutput>} - A promise that resolves with the response from the get operation.
   */
  async get(args: {
    partitionKey: string;
    sortKey: string;
  }): Promise<GetCommandOutput> {
    await this.dynamometer.hooks.callHook('get:before', args);
    const response = await this.ddbDocClient.get({
      TableName: this.dynamometer.config.tableName,
      Key: {
        [this.dynamometer.config.partitionKey]: args.partitionKey,
        [this.dynamometer.config.sortKey]: args.sortKey,
      },
    });
    await this.dynamometer.hooks.callHook('get:after', response);
    return response;
  }

  /**
   * Queries the database with the provided partition key and an optional filter function.
   *
   * @param {Object} args - An object containing partitionKey and an optional filter function.
   * @returns {Promise<QueryCommandOutput>} - A promise that resolves with the response from the query operation.
   */
  async query(args: {
    partitionKey: string;
    filter?: FilterFunction;
  }): Promise<QueryCommandOutput> {
    await this.dynamometer.hooks.callHook('query:before', args);
    let _filter;
    if (args.filter) {
      _filter = args.filter({
        sortKey: this.dynamometer.config.sortKey,
      });
    }

    const response = await this.ddbDocClient.query({
      TableName: this.dynamometer.config.tableName,
      KeyConditionExpression: `#PK = :PK${
        _filter?.KeyConditionExpression
          ? ` and ${_filter.KeyConditionExpression}`
          : ''
      }`,
      ExpressionAttributeNames: {
        '#PK': this.dynamometer.config.partitionKey,
        ...(_filter?.ExpressionAttributeNames &&
          _filter.ExpressionAttributeNames),
      },
      ExpressionAttributeValues: {
        ':PK': args.partitionKey,
        ...(_filter?.ExpressionAttributeValues &&
          _filter.ExpressionAttributeValues),
      },
    });
    await this.dynamometer.hooks.callHook('query:after', response);
    return response;
  }
}
