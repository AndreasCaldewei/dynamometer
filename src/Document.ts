import { Collection } from './Collection';
import { Dynamometer } from './Dynamometer';
import { CollectionArgs } from './types/CollectionArgs';
import { merge } from 'lodash';
import { checkDocumentPath } from './utils/checkDocumentPath';

export class Document {
  constructor(
    readonly dynamometer: Dynamometer,
    private readonly _path: string,
    readonly id: string,
    readonly parent: Collection
  ) {
    checkDocumentPath(this.path, dynamometer.config.delimiter!);
  }

  get path() {
    return `${this._path}${this.dynamometer.config.delimiter!}${this.id}`;
  }

  collection(collectionPath: string, args?: CollectionArgs) {
    return new Collection(
      this.dynamometer,
      `${this.path}${this.dynamometer.config.delimiter!}${collectionPath}`,
      this,
      args
    );
  }

  get() {
    return this.dynamometer.ddbDocClient.get({
      TableName: this.dynamometer.config.tableName,
      Key: {
        [this.dynamometer.config.partitionKey!]: this._path,
        [this.dynamometer.config.sortKey!]: this.id,
      },
    });
  }

  set(data: any) {
    return this.dynamometer.ddbDocClient.put({
      TableName: this.dynamometer.config.tableName,
      Item: {
        [this.dynamometer.config.partitionKey!]: this._path,
        [this.dynamometer.config.sortKey!]: this.id,
        ...data,
      },
    });
  }

  delete() {
    return this.dynamometer.ddbDocClient.delete({
      TableName: this.dynamometer.config.tableName,
      Key: {
        [this.dynamometer.config.partitionKey!]: this._path,
        [this.dynamometer.config.sortKey!]: this.id,
      },
    });
  }

  async update(data: any) {
    const response = await this.get();
    return await this.set(merge(response.Item, data));
  }
}
