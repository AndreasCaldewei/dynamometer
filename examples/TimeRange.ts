import { Dynamometer, Filters } from '../src';

const db = Dynamometer.create({
  tableName: 'test',
});

const events = db.collection('EVENT');
async function createEvent() {
  // EVENT#1696524529
  return await events.doc(Date.now().toString()).set({
    name: 'eventName',
  });
}

export async function filterEvents() {
  const now = Date.now();
  return await events.get(Filters.Between(now - 1000 * 60 * 60 * 24, now));
}
