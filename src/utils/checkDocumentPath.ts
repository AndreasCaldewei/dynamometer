/**
 * checkDocumentPath: Validates the provided path for a document.
 *
 * This function checks if the provided path is valid for a document based on the specified delimiter.
 * It ensures that the path represents a document and not a collection.
 *
 * @param path - The path to be validated.
 * @param delimiter - The delimiter used in the path.
 *
 * @returns An array of segments from the path if the path is valid.
 *
 * @throws Error if the path represents a collection and not a document.
 */
export const checkDocumentPath = (path: string, delimiter: string) => {
  const segments = path.split(delimiter);

  if (segments.length % 2 == 1) {
    throw new Error('This is a path for a Collection!');
  }

  return segments;
};
