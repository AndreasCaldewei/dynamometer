export type CollectionArgs = {
  /**
   * @description Adds a prefix to every document which is created with this collection.
   * @example { prefix: 'COMMENT' } -> COMMENT#12345...
   */
  prefix?: string;
};
