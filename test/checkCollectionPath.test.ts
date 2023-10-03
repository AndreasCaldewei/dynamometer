import { checkCollectionPath } from '../src/utils/checkCollectionPath';

describe('checkCollectionPath', () => {
  const delimiter = '#';

  it('should throw an error if path starts with the delimiter', () => {
    const path = '#myCollection';
    expect(() => checkCollectionPath(path, delimiter)).toThrowError(
      'Collection name cannot start with char "#".'
    );
  });

  it('should throw an error if path represents a document', () => {
    const path = 'myCollection#myDocument';
    expect(() => checkCollectionPath(path, delimiter)).toThrowError(
      'This is a path for a document!'
    );
  });

  it('should return segments if path is valid', () => {
    const path = 'myCollection';
    const result = checkCollectionPath(path, delimiter);
    expect(result).toEqual(['myCollection']);
  });

  it('should return segments for deeper collection paths', () => {
    const path = 'parentCollection#docId#childCollection';
    const result = checkCollectionPath(path, delimiter);
    expect(result).toEqual(['parentCollection', 'docId', 'childCollection']);
  });
});
