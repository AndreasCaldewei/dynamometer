/**
 * checkCollectionPath: Validates the provided path for a collection.
 *
 * This function checks if the provided path is valid for a collection based on the specified delimiter.
 * It ensures that:
 * 1. The path does not start with the delimiter.
 * 2. The path represents a collection and not a document.
 *
 * @param path - The path to be validated.
 * @param delimiter - The delimiter used in the path.
 *
 * @returns An array of segments from the path if the path is valid.
 *
 * @throws Error if the path starts with the delimiter.
 * @throws Error if the path represents a document and not a collection.
 */
export const checkCollectionPath = (path: string, delimiter: string) => {
  if (path.charAt(0) === delimiter) {
    throw new Error(`Collection name cannot start with char "${delimiter}".`);
  }

  const segments = path.split(delimiter);

  if (segments.length % 2 == 0) {
    throw new Error('This is a path for a document!');
  }

  return segments;
};
