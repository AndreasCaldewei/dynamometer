import { createUUID } from './utils/createUUID';
import { Document } from './Document';
import { CollectionArgs } from './types/CollectionArgs';
import { Dynamometer } from './Dynamometer';
import { checkCollectionPath } from './utils/checkCollectionPath';
import { QueryCommandOutput } from '@aws-sdk/lib-dynamodb';

export class Collection {
  private beginsWithValue!: string;

  constructor(
    private readonly dynamometer: Dynamometer,
    readonly path: string,
    parent?: Document,
    private readonly args?: CollectionArgs
  ) {
    checkCollectionPath(path, dynamometer.config.delimiter!);
  }

  get(): Promise<QueryCommandOutput> {
    return this.dynamometer.ddbDocClient.query({
      TableName: this.dynamometer.config.tableName,
      KeyConditionExpression: `#PK = :PK${
        this.beginsWithValue ? ' and begins_with(#SK, :SK)' : ''
      }`,
      ExpressionAttributeNames: {
        '#PK': this.dynamometer.config.partitionKey!,
        ...(this.beginsWithValue && { '#SK': this.dynamometer.config.sortKey }),
      },
      ExpressionAttributeValues: {
        ':PK': this.path,
        ...(this.beginsWithValue && { ':SK': this.beginsWithValue }),
      },
    });
  }

  beginsWith(sortKeyBeginsWith: string): Collection {
    this.beginsWithValue = sortKeyBeginsWith;
    return this;
  }

  doc(
    id: string = createUUID(this.dynamometer?.config?.uuidFunction)
  ): Document {
    return new Document(this.dynamometer, this.path, this.createId(id), this);
  }

  async add(data: any) {
    const uuid = createUUID(this.dynamometer?.config?.uuidFunction);
    const response = await this.dynamometer.ddbDocClient.put({
      TableName: this.dynamometer.config.tableName,
      Item: {
        ...data,
        [this.dynamometer.config.partitionKey!]: this.path,
        [this.dynamometer.config.sortKey!]: this.createId(uuid),
      },
    });
    return {
      ...response,
      doc: new Document(this.dynamometer, this.path, uuid, this),
    };
  }

  private createId(id: string): string {
    const delimiter = this.args?.prefix
      ? this.dynamometer.config.delimiter
      : '';
    return `${this.args?.prefix ?? ''}${delimiter!}${id}`;
  }
}
