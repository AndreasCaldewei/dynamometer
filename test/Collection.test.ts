import { Dynamometer, Filters } from '../src';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { delay } from './utils/delay';
import { deleteTable } from './utils/deleteTable';
import { createTable } from './utils/createTable';

describe('Collection', () => {
  const tableName = 'Test';
  let dynamometer: Dynamometer;

  beforeEach(async () => {
    await delay();
    await deleteTable();
    await delay();
    await createTable();
    await delay();

    const dynamoDBDocument = DynamoDBDocument.from(
      new DynamoDBClient({
        endpoint: 'http://localhost:8000/',
        region: 'eu-central-1',
      }),
      {
        marshallOptions: {
          convertEmptyValues: false,
          removeUndefinedValues: false,
          convertClassInstanceToMap: false,
        },
        unmarshallOptions: {
          wrapNumbers: false,
        },
      }
    );

    let uuidCounter = -1;
    dynamometer = Dynamometer.fromDynamoDBDocument(dynamoDBDocument, {
      tableName,
      generateId() {
        return (++uuidCounter).toString();
      },
    });
  });

  afterEach(async () => {
    await delay();
    await deleteTable();
    await delay();
  });

  const setupCommentsCollection = () =>
    dynamometer.collection('POSTS').doc('1234').collection('COMMENTS');

  test('add', async () => {
    const commentsCollection = setupCommentsCollection();

    await commentsCollection.doc().set({ text: 'Test Comment' });

    const response = await commentsCollection.get();

    expect(commentsCollection.path()).toBe('POSTS#1234#COMMENTS');
    expect(response?.length).toBe(1);
    expect(response).toEqual([{ id: '1', text: 'Test Comment' }]);
  });

  test('get', async () => {
    const commentsCollection = setupCommentsCollection();

    await commentsCollection.doc().set({ text: 'Test Comment' });

    const response = await commentsCollection.get();

    expect(commentsCollection.path()).toBe('POSTS#1234#COMMENTS');
    expect(response?.length).toBe(1);
    expect(response).toEqual([{ id: '1', text: 'Test Comment' }]);
  });

  test('beginsWith', async () => {
    const comments = setupCommentsCollection();

    await Promise.all([
      comments.doc('PUBLISHED:0').set({ text: 'Test Comment' }),
      comments.doc('PUBLISHED:1').set({ text: 'Test Comment' }),
      comments.doc('UNPUBLISHED:0').set({ text: 'Test Comment' }),
      comments.doc('UNPUBLISHED:1').set({ text: 'Test Comment' }),
    ]);

    const response = await comments.get(Filters.BeginsWith('PUBLISHED'));

    expect(comments.path()).toBe('POSTS#1234#COMMENTS');
    expect(response?.length).toBe(2);
    expect(response).toEqual([
      { id: '1', text: 'Test Comment' },
      { id: '2', text: 'Test Comment' },
    ]);
  });

  test('doc', () => {
    const doc = dynamometer.collection('POSTS').doc('1234');
    expect(doc.path()).toBe('POSTS#1234');
  });
});
