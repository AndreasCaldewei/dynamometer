import { Collection } from './Collection';
import { Dynamometer } from './Dynamometer';
import { CollectionArgs } from './types/CollectionArgs';
import { merge } from 'lodash';
import { checkDocumentPath } from './utils/checkDocumentPath';
import {
  DeleteCommandOutput,
  GetCommandOutput,
  PutCommandOutput,
} from '@aws-sdk/lib-dynamodb';

export class Document {
  constructor(
    readonly dynamometer: Dynamometer,
    private readonly _path: string,
    readonly id: string,
    readonly parent: Collection
  ) {
    checkDocumentPath(this.path, dynamometer.config.delimiter!);
  }

  get path(): string {
    return `${this._path}${this.dynamometer.config.delimiter!}${this.id}`;
  }

  collection(collectionPath: string, args?: CollectionArgs): Collection {
    return new Collection(
      this.dynamometer,
      `${this.path}${this.dynamometer.config.delimiter!}${collectionPath}`,
      this,
      args
    );
  }

  get(): Promise<GetCommandOutput> {
    return this.dynamometer.ddbDocClient.get({
      TableName: this.dynamometer.config.tableName,
      Key: {
        [this.dynamometer.config.partitionKey!]: this._path,
        [this.dynamometer.config.sortKey!]: this.id,
      },
    });
  }

  set(data: any): Promise<PutCommandOutput> {
    return this.dynamometer.ddbDocClient.put({
      TableName: this.dynamometer.config.tableName,
      Item: {
        [this.dynamometer.config.partitionKey!]: this._path,
        [this.dynamometer.config.sortKey!]: this.id,
        ...data,
      },
    });
  }

  delete(): Promise<DeleteCommandOutput> {
    return this.dynamometer.ddbDocClient.delete({
      TableName: this.dynamometer.config.tableName,
      Key: {
        [this.dynamometer.config.partitionKey!]: this._path,
        [this.dynamometer.config.sortKey!]: this.id,
      },
    });
  }

  async update(data: any): Promise<PutCommandOutput> {
    const response = await this.get();
    return await this.set(merge(response.Item, data));
  }
}
