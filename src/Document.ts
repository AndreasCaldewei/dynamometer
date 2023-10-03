/**
 * Document: Represents a single document within a DynamoDB table.
 *
 * This class provides methods to interact with a specific document within a DynamoDB table.
 * It allows for operations such as getting, setting, deleting, and updating the document.
 * Additionally, it provides a way to access sub-collections within the document.
 */

import { Collection, CollectionArgs } from './Collection';
import { Dynamometer } from './Dynamometer';
import { checkDocumentPath } from './utils/checkDocumentPath';
import { transformResponse } from './utils/transformResponse';
// eslint-disable-next-line node/no-extraneous-import
import merge from 'deepmerge';

export class Document<Type, Parent = any> {
  /**
   * @param dynamometer - The Dynamometer instance associated with this document.
   * @param _path - The path to the document within the DynamoDB table.
   * @param id - The ID of the document.
   * @param parent - The parent collection containing this document.
   */
  constructor(
    readonly dynamometer: Dynamometer,
    private readonly _path: string,
    readonly id: string,
    readonly parent: Parent
  ) {
    checkDocumentPath(this.path, dynamometer.config.delimiter);
  }

  /**
   * Computes the full path to the document by appending the document ID to the provided path.
   *
   * @returns The full path to the document.
   */
  get path(): string {
    return `${this._path}${this.dynamometer.config.delimiter}${this.id}`;
  }

  /**
   * Create and return a new Collection instance within this document.
   *
   * @param collectionPath - The path for the sub-collection.
   * @param args - Optional arguments for the sub-collection.
   * @returns A new Collection instance.
   */
  collection<Type>(
    collectionPath: string,
    args?: CollectionArgs
  ): Collection<Type, this> {
    return new Collection<Type, this>(
      this.dynamometer,
      `${this.path}${this.dynamometer.config.delimiter}${collectionPath}`,
      this,
      args
    );
  }

  /**
   * Retrieve the data of this document from the DynamoDB table.
   *
   * @returns A promise that resolves with the document data.
   */
  async get(): Promise<Type | null> {
    const response = await this.dynamometer.dynamoDBDocument.get({
      TableName: this.dynamometer.config.tableName,
      Key: {
        [this.dynamometer.config.partitionKey]: this._path,
        [this.dynamometer.config.sortKey]: this.id,
      },
    });

    if (!response.Item) return null;

    return transformResponse<Type>(response.Item, this.dynamometer.config);
  }

  /**
   * Set or overwrite the data of this document in the DynamoDB table.
   *
   * @param data - The data to set for the document.
   */
  async set(data: any): Promise<void> {
    await this.dynamometer.dynamoDBDocument.put({
      TableName: this.dynamometer.config.tableName,
      Item: {
        [this.dynamometer.config.partitionKey]: this._path,
        [this.dynamometer.config.sortKey]: this.id,
        ...data,
      },
    });
  }

  /**
   * Delete this document from the DynamoDB table.
   */
  async delete(): Promise<void> {
    const response = await this.dynamometer.dynamoDBDocument.delete({
      TableName: this.dynamometer.config.tableName,
      Key: {
        [this.dynamometer.config.partitionKey]: this._path,
        [this.dynamometer.config.sortKey]: this.id,
      },
    });
  }

  /**
   * Update the data of this document in the DynamoDB table.
   *
   * @param data - The data to update for the document.
   */
  async update(data: any): Promise<void> {
    const response = await this.get();
    await this.set(merge(response as any, data));
  }
}
