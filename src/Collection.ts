/**
 * Collection: Represents a collection of documents within a DynamoDB table.
 *
 * This class provides methods to interact with a specific collection within a DynamoDB table.
 * It allows for operations such as querying, adding, and accessing individual documents within the collection.
 */

// Import necessary modules
import { Document } from './Document';
import { Dynamometer } from './Dynamometer';
import { checkCollectionPath } from './utils/checkCollectionPath';
import { transformResponse } from './utils/transformResponse';

export type CollectionArgs = {
  /**
   * @description Adds a prefix to every document which is created within this collection.
   * @example { prefix: 'COMMENT' } -> COMMENT#12345...
   */
  prefix?: string;
};

export class Collection<Type, Parent = any> {
  private beginsWithValue!: string;

  /**
   * @param dynamometer - The Dynamometer instance associated with this collection.
   * @param path - The path to the collection within the DynamoDB table.
   * @param parent - The parent document containing this collection (if any).
   * @param args - Optional arguments for the collection.
   */
  constructor(
    private readonly dynamometer: Dynamometer,
    readonly path: string,
    public parent?: Parent,
    private readonly args?: CollectionArgs
  ) {
    checkCollectionPath(path, dynamometer.config.delimiter);
  }

  /**
   * Retrieve all documents within this collection from the DynamoDB table.
   *
   * @returns A promise that resolves with an array of documents.
   */
  async get(): Promise<Array<Type>> {
    const response = await this.dynamometer.dynamoDBDocument.query({
      TableName: this.dynamometer.config.tableName,
      KeyConditionExpression: `#PK = :PK${
        this.beginsWithValue ? ' and begins_with(#SK, :SK)' : ''
      }`,
      ExpressionAttributeNames: {
        '#PK': this.dynamometer.config.partitionKey,
        ...(this.beginsWithValue && { '#SK': this.dynamometer.config.sortKey }),
      },
      ExpressionAttributeValues: {
        ':PK': this.path,
        ...(this.beginsWithValue && { ':SK': this.beginsWithValue }),
      },
    });
    return (response.Items ?? []).map(item =>
      transformResponse<Type>(item, this.dynamometer.config)
    );
  }

  /**
   * Filter documents within this collection based on a prefix for the sort key.
   *
   * @param sortKeyBeginsWith - The prefix for the sort key.
   * @returns The current Collection instance for chaining.
   */
  beginsWith(sortKeyBeginsWith: string): Collection<Type> {
    this.beginsWithValue = sortKeyBeginsWith;
    return this;
  }

  /**
   * Access a specific document within this collection.
   *
   * @param id - The ID of the document. If not provided, a new ID will be generated.
   * @returns A Document instance representing the specified document.
   */
  doc(id: string = this.dynamometer.config.generateId()): Document<Type, this> {
    return new Document(this.dynamometer, this.path, this.createId(id), this);
  }

  /**
   * Add a new document to this collection in the DynamoDB table.
   *
   * @param data - The data for the new document.
   * @returns A promise that resolves with a Document instance representing the newly added document.
   */
  async add(data: Type): Promise<Document<Type, this>> {
    const uuid = this.dynamometer.config.generateId();
    const response = await this.dynamometer.dynamoDBDocument.put({
      TableName: this.dynamometer.config.tableName,
      Item: {
        ...data,
        [this.dynamometer.config.partitionKey]: this.path,
        [this.dynamometer.config.sortKey]: this.createId(uuid),
      },
    });
    return new Document<Type, this>(this.dynamometer, this.path, uuid, this);
  }

  /**
   * Create a document ID by optionally prefixing it based on the collection arguments.
   *
   * @param id - The base ID.
   * @returns The created document ID.
   */
  private createId(id: string): string {
    const delimiter = this.args?.prefix
      ? this.dynamometer.config.delimiter
      : '';
    return `${this.args?.prefix ?? ''}${delimiter}${id}`;
  }
}
