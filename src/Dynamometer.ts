import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { Collection } from './Collection';
import { CollectionArgs } from './types/CollectionArgs';
import { DynamometerConfig } from './types/DynamometerConfig';
import { BaseConfig } from './config/BaseConfig';
import { merge } from 'lodash';

export class Dynamometer {
  readonly ddbDocClient: DynamoDBDocument;

  private constructor(readonly config: DynamometerConfig) {
    this.ddbDocClient = this.createDocumentClient(merge(config, BaseConfig));
  }

  static create(config: DynamometerConfig): Dynamometer {
    return new Dynamometer(config);
  }

  collection<T>(
    collectionPath: string,
    args?: CollectionArgs
  ): Collection<T, any> {
    return new Collection(this, collectionPath);
  }

  private createDocumentClient(config: DynamometerConfig) {
    const client = new DynamoDBClient(config.dynamoDBClientConfig!);
    return DynamoDBDocument.from(client, config.translateConfig);
  }
}
