/**
 * Represents a reference to a document within a collection in a DynamoDB database.
 * Provides methods for performing operations on this document.
 *
 * @template Type - The TypeScript type representing the document's data structure.
 */

import { CollectionReference } from './CollectionReference';
import { Dynamometer } from './Dynamometer';
import { checkDocumentPath } from './utils/checkDocumentPath';
import { transformResponse } from './utils/transformResponse';
// eslint-disable-next-line node/no-extraneous-import
import merge from 'deepmerge';
import { FilterFunction } from './Filters';

export class DocumentReference<Type = any> {
  private _parent; // Reference to the parent CollectionReference
  private id: string;

  /**
   * Creates a new DocumentReference instance.
   *
   * @param {Dynamometer} dynamometer - An instance of the Dynamometer class for managing DynamoDB operations.
   * @param {CollectionReference<Type>} parent - The parent CollectionReference to which this document belongs.
   * @param {string} documentId - The unique identifier for this document.
   */
  constructor(
    private readonly dynamometer: Dynamometer,
    parent: CollectionReference<Type>,
    private readonly documentId?: string
  ) {
    this.id = this.dynamometer.config.generateId();
    this._parent = parent;
    // Ensure the document path is valid
    checkDocumentPath(this.path(), dynamometer.config.delimiter);
  }

  private get sortKey() {
    return this.documentId ?? this.id;
  }

  /**
   * Returns the path of this document, which includes the parent collection's path and the document ID.
   *
   * @returns {string} - The document's path.
   */
  path(): string {
    return `${this.parent()?.path()}${this.dynamometer.config.delimiter}${
      this.sortKey
    }`;
  }

  /**
   * Returns the parent CollectionReference to which this document belongs.
   *
   * @returns {CollectionReference<Type>} - The parent CollectionReference.
   */
  parent(): CollectionReference<Type> {
    return this._parent as CollectionReference<Type>;
  }

  /**
   * Creates a new CollectionReference instance for a sub-collection within this document.
   *
   * @param {string} id - The ID of the sub-collection.
   * @param {FilterFunction} filter - Optional filter function for querying the sub-collection.
   * @returns {CollectionReference<Type>} - A reference to the sub-collection.
   */
  collection<Type>(
    id: string,
    filter?: FilterFunction
  ): CollectionReference<Type> {
    return new CollectionReference<Type>(this.dynamometer, id, this);
  }

  /**
   * Retrieves the document's data from the DynamoDB table.
   *
   * @returns {Promise<Type | null>} - A promise that resolves to the document's data or null if not found.
   */
  async get(): Promise<Type | null> {
    const response = await this.dynamometer.database.get({
      partitionKey: this.parent().path(),
      sortKey: this.sortKey,
    });

    if (!response.Item) return null;

    return transformResponse<Type>(response.Item, this.dynamometer.config);
  }

  /**
   * Sets the data of this document in the DynamoDB table.
   *
   * @param {Type} data - The data to be set for the document.
   * @returns {Promise<void>} - A promise that resolves when the data is successfully set.
   */
  async set(data: Type): Promise<void> {
    await this.dynamometer.database.put({
      partitionKey: this.parent().path(),
      sortKey: this.sortKey,
      data: {
        ...data,
        [this.dynamometer.config.idField]: this.id,
      },
    });
  }

  /**
   * Deletes this document from the DynamoDB table.
   *
   * @returns {Promise<void>} - A promise that resolves when the document is successfully deleted.
   */
  async delete(): Promise<void> {
    await this.dynamometer.database.delete({
      partitionKey: this.parent().path(),
      sortKey: this.sortKey,
    });
  }

  /**
   * Updates the document's data by merging it with the provided partial data.
   *
   * @param {Partial<Type>} data - The partial data to merge with the current document data.
   * @returns {Promise<void>} - A promise that resolves when the update is successfully performed.
   */
  async update(data: Partial<Type>): Promise<void> {
    // Retrieve the current document data
    const response = await this.get();
    // Merge the current data with the partial data and update the document
    await this.set(merge(response ?? {}, data));
  }
}
