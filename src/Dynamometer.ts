/**
 * Dynamometer: A utility class for working with AWS DynamoDB.
 *
 * This class provides a higher-level abstraction for interacting with DynamoDB tables.
 * It offers a simplified way to create and manage collections within a DynamoDB table.
 */

import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { CollectionReference } from './CollectionReference';
import { DatabaseClient, DatabaseHooks } from './DatabaseClient';
import { createHooks } from 'hookable';

/**
 * Configuration type for Dynamometer.
 *
 * @property tableName - The name of the DynamoDB table.
 * @property generateId - Optional function to generate unique IDs.
 * @property delimiter - Optional delimiter used in composite keys.
 * @property partitionKey - Optional name for the partition key.
 * @property sortKey - Optional name for the sort key.
 * @property idField - Optional name for the ID field.
 */
export type DynamometerConfig = {
  tableName: string;
  generateId?: () => string;
  delimiter?: string;
  partitionKey?: string;
  sortKey?: string;
  idField?: string;
  includeIndex?: boolean;
};

// Default configuration values for Dynamometer
const defaultConfig = {
  delimiter: '#',
  partitionKey: 'PK',
  sortKey: 'SK',
  idField: 'id',
  generateId: () => crypto.randomUUID(),
  includeIndex: false,
} as const;

export class Dynamometer {
  readonly hooks = createHooks<DatabaseHooks>();
  readonly database: DatabaseClient;

  /**
   * Private constructor to enforce the use of static factory methods.
   *
   * @param ddbDocClient - The DynamoDBDocument client.
   * @param config - The configuration for the Dynamometer instance.
   */
  private constructor(
    ddbDocClient: DynamoDBDocument,
    readonly config: Required<DynamometerConfig>
  ) {
    this.database = new DatabaseClient(this, ddbDocClient);

    this.hooks.hook('delete:after', args => {});
  }

  /**
   * Static factory method to create a new Dynamometer instance.
   *
   * @param config - The configuration for the Dynamometer instance.
   * @returns A new Dynamometer instance.
   */
  static create(config: DynamometerConfig): Dynamometer {
    const dynamoDBDocument = DynamoDBDocument.from(new DynamoDBClient({}), {
      marshallOptions: {
        convertEmptyValues: false,
        removeUndefinedValues: false,
        convertClassInstanceToMap: false,
      },
      unmarshallOptions: {
        wrapNumbers: false,
      },
    });

    return new Dynamometer(dynamoDBDocument, {
      tableName: config.tableName,
      generateId: config.generateId ?? defaultConfig.generateId,
      delimiter: config.delimiter ?? defaultConfig.delimiter,
      partitionKey: config.partitionKey ?? defaultConfig.partitionKey,
      sortKey: config.sortKey ?? defaultConfig.sortKey,
      idField: config.idField ?? defaultConfig.idField,
      includeIndex: config.includeIndex ?? defaultConfig.includeIndex,
    });
  }

  /**
   * Static factory method to create a new Dynamometer instance from an existing DynamoDBDocument.
   *
   * @param dynamoDBDocument - The existing DynamoDBDocument client.
   * @param config - The configuration for the Dynamometer instance.
   * @returns A new Dynamometer instance.
   */
  static fromDynamoDBDocument(
    dynamoDBDocument: DynamoDBDocument,
    config: DynamometerConfig
  ) {
    return new Dynamometer(
      dynamoDBDocument,
      Object.assign(defaultConfig, {
        tableName: config.tableName,
        generateId: config.generateId ?? defaultConfig.generateId,
        delimiter: config.delimiter ?? defaultConfig.delimiter,
        partitionKey: config.partitionKey ?? defaultConfig.partitionKey,
        sortKey: config.sortKey ?? defaultConfig.sortKey,
        idField: config.idField ?? defaultConfig.idField,
        includeIndex: config.includeIndex ?? defaultConfig.includeIndex,
      })
    );
  }

  /**
   * Create and return a new Collection instance.
   *
   * @param id - The id for the collection.
   * @returns A new Collection instance.
   */
  collection<T>(id: string): CollectionReference<T> {
    return new CollectionReference<T>(this, id, undefined);
  }

  use(plugin: (dynamometer: Dynamometer) => void) {
    plugin(this);
    return this;
  }
}
