import { Dynamometer } from '../src';
import { createTable } from './utils/createTable';
import { deleteTable } from './utils/deleteTable';

describe('Collection ', () => {
  const tableName = 'Test';
  let dynamometer: Dynamometer;

  beforeEach(async () => {
    await deleteTable();
    await createTable();
    let uuidCounter = -1;
    dynamometer = Dynamometer.create({
      tableName,
      dynamoDBClientConfig: {
        endpoint: 'http://localhost:8000/',
        region: 'eu-central-1',
      },
      uuidFunction() {
        uuidCounter = uuidCounter + 1;
        return uuidCounter.toString();
      },
    });
  });

  test('add', async () => {
    const commentsCollection = dynamometer
      .collection('POSTS')
      .doc('1234')
      .collection('COMMENTS');

    await commentsCollection.add({
      text: 'Test Comment',
    });

    const response = await commentsCollection.get();

    expect(commentsCollection.path).toBe('POSTS#1234#COMMENTS');
    expect(response.Items?.length).toBe(1);
    response.Items?.forEach((item, index) => {
      expect(item).toStrictEqual({
        PK: 'POSTS#1234#COMMENTS',
        SK: index.toString(),
        text: 'Test Comment',
      });
    });
  });

  test('get', async () => {
    const commentsCollection = dynamometer
      .collection('POSTS')
      .doc('1234')
      .collection('COMMENTS');

    await commentsCollection.add({
      text: 'Test Comment',
    });

    await commentsCollection.add({
      text: 'Test Comment',
    });

    const response = await commentsCollection.get();

    expect(commentsCollection.path).toBe('POSTS#1234#COMMENTS');
    expect(response.Items?.length).toBe(2);
    response.Items?.forEach((item, index) => {
      expect(item).toStrictEqual({
        PK: 'POSTS#1234#COMMENTS',
        SK: index.toString(),
        text: 'Test Comment',
      });
    });
  });

  test('beginsWith', async () => {
    const commentsCollectionPublished = dynamometer
      .collection('POSTS')
      .doc('1234')
      .collection('COMMENTS', { prefix: 'PUBLISHED' });

    await commentsCollectionPublished.add({
      text: 'Test Comment',
    });

    await commentsCollectionPublished.add({
      text: 'Test Comment',
    });

    const commentsCollectionUnpublished = dynamometer
      .collection('POSTS')
      .doc('1234')
      .collection('COMMENTS', { prefix: 'UNPUBLISHED' });

    await commentsCollectionUnpublished.add({
      text: 'Test Comment',
    });

    await commentsCollectionUnpublished.add({
      text: 'Test Comment',
    });

    const response = await commentsCollectionPublished
      .beginsWith('PUBLISHED')
      .get();

    expect(commentsCollectionPublished.path).toBe('POSTS#1234#COMMENTS');
    expect(response.Items?.length).toBe(2);
    response.Items?.forEach((item, index) => {
      expect(item).toStrictEqual({
        PK: 'POSTS#1234#COMMENTS',
        SK: `PUBLISHED#${index.toString()}`,
        text: 'Test Comment',
      });
    });
  });

  test('doc', () => {
    const doc = dynamometer.collection('POSTS').doc('1234');

    expect(doc.path).toBe('POSTS#1234');
  });
});
