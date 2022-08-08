import { Collection } from './Collection';
import { Dynamometer } from './Dynamometer';
import { CollectionArgs } from './types/CollectionArgs';
import { merge } from 'lodash';
import { checkDocumentPath } from './utils/checkDocumentPath';
import { transformResponse } from './utils/transformResponse';

export class Document<T> {
  constructor(
    readonly dynamometer: Dynamometer,
    private readonly _path: string,
    readonly id: string,
    readonly parent: Collection<T>
  ) {
    checkDocumentPath(this.path, dynamometer.config.delimiter!);
  }

  get path(): string {
    return `${this._path}${this.dynamometer.config.delimiter!}${this.id}`;
  }

  collection<Type>(
    collectionPath: string,
    args?: CollectionArgs
  ): Collection<Type> {
    return new Collection<Type>(
      this.dynamometer,
      `${this.path}${this.dynamometer.config.delimiter!}${collectionPath}`,
      this,
      args
    );
  }

  async get(): Promise<T> {
    const response = await this.dynamometer.ddbDocClient.get({
      TableName: this.dynamometer.config.tableName,
      Key: {
        [this.dynamometer.config.partitionKey!]: this._path,
        [this.dynamometer.config.sortKey!]: this.id,
      },
    });

    return transformResponse<T>(response.Item, this.dynamometer.config);
  }

  async set(data: any): Promise<void> {
    await this.dynamometer.ddbDocClient.put({
      TableName: this.dynamometer.config.tableName,
      Item: {
        [this.dynamometer.config.partitionKey!]: this._path,
        [this.dynamometer.config.sortKey!]: this.id,
        ...data,
      },
    });
  }

  async delete(): Promise<void> {
    const response = await this.dynamometer.ddbDocClient.delete({
      TableName: this.dynamometer.config.tableName,
      Key: {
        [this.dynamometer.config.partitionKey!]: this._path,
        [this.dynamometer.config.sortKey!]: this.id,
      },
    });
  }

  async update(data: any): Promise<void> {
    const response = await this.get();
    await this.set(merge(response, data));
  }
}
