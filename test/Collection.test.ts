import { Dynamometer, Filters } from '../src';
import { createTable } from './utils/createTable';
import { deleteTable } from './utils/deleteTable';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { delay } from './utils/delay';

describe('Collection ', () => {
  const tableName = 'Test';
  let dynamometer: Dynamometer;

  beforeEach(async () => {
    await delay();
    await deleteTable();
    await delay();
    await createTable();
    await delay();

    let uuidCounter = -1;
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

    dynamometer = Dynamometer.fromDynamoDBDocument(dynamoDBDocument, {
      tableName,
      generateId() {
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

    expect(commentsCollection.path()).toBe('POSTS#1234#COMMENTS');
    expect(response?.length).toBe(1);
    response?.forEach((item, index) => {
      expect(item).toStrictEqual({
        id: '0',
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

    expect(commentsCollection.path()).toBe('POSTS#1234#COMMENTS');
    expect(response?.length).toBe(2);
    response?.forEach((item, index) => {
      expect(item).toStrictEqual({
        id: index.toString(),
        text: 'Test Comment',
      });
    });
  });

  test('beginsWith', async () => {
    const comments = dynamometer
      .collection('POSTS')
      .doc('1234')
      .collection('COMMENTS');

    await comments.doc('PUBLISHED:0').set({
      text: 'Test Comment',
    });
    await comments.doc('PUBLISHED:1').set({
      text: 'Test Comment',
    });

    await comments.doc('UNPUBLISHED:0').set({
      text: 'Test Comment',
    });
    await comments.doc('UNPUBLISHED:1').set({
      text: 'Test Comment',
    });

    const response = await comments.get(Filters.BeginsWith('PUBLISHED'));

    expect(comments.path()).toBe('POSTS#1234#COMMENTS');
    expect(response?.length).toBe(2);
    response?.forEach((item, index) => {
      expect(item).toStrictEqual({
        id: `PUBLISHED:${index.toString()}`,
        text: 'Test Comment',
      });
    });
  });

  test('doc', () => {
    const doc = dynamometer.collection('POSTS').doc('1234');

    expect(doc.path()).toBe('POSTS#1234');
  });
});
