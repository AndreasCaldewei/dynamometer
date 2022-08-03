import { createUUID } from './utils/createUUID';
import { Document } from './Document';
import { CollectionArgs } from './types/CollectionArgs';
import { Dynamometer } from './Dynamometer';
import { checkCollectionPath } from './utils/checkCollectionPath';

export class Collection<T> {
  private beginsWithValue!: string;

  constructor(
    private readonly dynamometer: Dynamometer,
    readonly path: string,
    public parent?: Document<any>,
    private readonly args?: CollectionArgs
  ) {
    checkCollectionPath(path, dynamometer.config.delimiter!);
  }

  async get(): Promise<Array<T>> {
    const response = await this.dynamometer.ddbDocClient.query({
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
    return response.Items as T[];
  }

  beginsWith(sortKeyBeginsWith: string): Collection<T> {
    this.beginsWithValue = sortKeyBeginsWith;
    return this;
  }

  doc(
    id: string = createUUID(this.dynamometer?.config?.uuidFunction)
  ): Document<T> {
    return new Document(this.dynamometer, this.path, this.createId(id), this);
  }

  async add(data: any): Promise<Document<T>> {
    const uuid = createUUID(this.dynamometer?.config?.uuidFunction);
    const response = await this.dynamometer.ddbDocClient.put({
      TableName: this.dynamometer.config.tableName,
      Item: {
        ...data,
        [this.dynamometer.config.partitionKey!]: this.path,
        [this.dynamometer.config.sortKey!]: this.createId(uuid),
      },
    });
    return new Document<T>(this.dynamometer, this.path, uuid, this);
  }

  private createId(id: string): string {
    const delimiter = this.args?.prefix
      ? this.dynamometer.config.delimiter
      : '';
    return `${this.args?.prefix ?? ''}${delimiter!}${id}`;
  }
}
