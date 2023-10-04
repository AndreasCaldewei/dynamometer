/**
 * Represents a reference to a collection within a DynamoDB database.
 * Provides methods for performing operations on documents within this collection.
 *
 * @template Type - The TypeScript type representing the documents' data structure in this collection.
 */

import { DocumentReference } from './DocumentReference';
import { Dynamometer } from './Dynamometer';
import { checkCollectionPath } from './utils/checkCollectionPath';
import { transformResponse } from './utils/transformResponse';
import { FilterFunction } from './Filters';

export class CollectionReference<Type> {
  private readonly _parent; // Reference to the parent DocumentReference

  /**
   * Creates a new CollectionReference instance.
   *
   * @param {Dynamometer} dynamometer - An instance of the Dynamometer class for managing DynamoDB operations.
   * @param {string} collectionId - The unique identifier for this collection.
   * @param {DocumentReference<unknown>} parent - Optional parent DocumentReference if this collection is a sub-collection.
   */
  constructor(
    private readonly dynamometer: Dynamometer,
    private readonly collectionId: string,
    parent?: DocumentReference<unknown>
  ) {
    this._parent = parent;
    // Ensure the collection path is valid
    checkCollectionPath(this.path(), dynamometer.config.delimiter);
  }

  /**
   * Returns the path of this collection, which includes the parent document's path (if applicable) and the collection ID.
   *
   * @returns {string} - The collection's path.
   */
  path(): string {
    return `${this.parent()?.path() ?? ''}${
      this._parent?.path ? this.dynamometer.config.delimiter : ''
    }${this.collectionId}`;
  }

  /**
   * Returns the parent DocumentReference if this collection is a sub-collection.
   *
   * @returns {DocumentReference<unknown>} - The parent DocumentReference.
   */
  parent(): DocumentReference<unknown> {
    return this._parent as DocumentReference<unknown>;
  }

  /**
   * Retrieves documents from the collection that match the provided filter criteria.
   *
   * @param {FilterFunction} filter - Optional filter function for querying the collection.
   * @returns {Promise<Array<Type>>} - A promise that resolves to an array of matching documents.
   */
  async get(filter?: FilterFunction): Promise<Array<Type>> {
    const response = await this.dynamometer.database.query({
      partitionKey: this.path(),
      filter,
    });

    return (response.Items ?? []).map(item =>
      transformResponse<Type>(item, this.dynamometer.config)
    );
  }

  /**
   * Creates a reference to a new document within this collection with an optional custom ID.
   *
   * @param {string} id - The ID for the new document (optional, a generated ID will be used if not provided).
   * @returns {DocumentReference<Type>} - A reference to the new document.
   */
  doc(
    id: string = this.dynamometer.config.generateId()
  ): DocumentReference<Type> {
    return new DocumentReference(this.dynamometer, this, id);
  }

  /**
   * Adds a new document to the collection with the provided data.
   *
   * @param {{ $id?: string } & Type} data - The data to be added to the new document.
   * @returns {Promise<DocumentReference<Type>>} - A promise that resolves to a reference to the new document.
   */
  async add(data: { $id?: string } & Type): Promise<DocumentReference<Type>> {
    const { $id = this.dynamometer.config.generateId(), ..._data } = data;

    await this.dynamometer.database.put({
      partitionKey: this.path(),
      sortKey: $id,
      data: _data,
    });

    return new DocumentReference<Type>(this.dynamometer, this, $id);
  }
}
