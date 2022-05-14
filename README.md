# Dynamometer

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

> A library to easily work with DynamoDB and enforces single table design approach.


Inspired by [Firestore SDK](https://firebase.google.com/docs/firestore).

```ts
const db = Dynamometer.create({
  tableName: "dataTable"
})

db.collection('USERS')
  .doc("xspvLRiJ")
  .collection("TODOS")
  .add({
    text: "Makes managing your data a breeze."
  })

```

## Features

- Easy to use API to query and create items in DynamoDB.
- Data is automatically structured in single table design.

---

## Install

```bash
npm install dynamometer
```

## Usage

```ts
import { Dynamometer } from 'dynamometer';

const db = Dynamometer.create({
  tableName: "dataTable"
})
```

---

### Collection

A collection holds a number of items.

#### Creating a collection

```ts
const collection = db.collection("USERS")
```

With a collection, items can be added to it or all can be queried.

#### Adding  an item

```ts

collection.add({
  name: "John Doe"
})

```

#### Query all Items

```ts

const reponse = await collection.get()

```

#### Doc

If you know the ID of an item in the collection or you want to give it your own ID you can use the doc methode.

```ts
// get the doc
collection.doc("123").get()

// add the doc with the id 123
collection.doc("123").add({
  name: "John Doe"
})
```

---

### Document

A document is an item of a collection. It offers CRUD methodes.

#### Doc

If you know the ID of an item in the collection or you want to give it your own ID you can use the doc methode.

#### Creating a document

```ts
const doc = db.collection("USERS").doc("123")
```

#### Set doc data

```ts
 const repsonse = await doc.set({
  name: "John Doe"
})
```

#### Get doc data

```ts
const data = await doc.get()
```

#### Update doc

```ts
const response = await doc.update({
  name: "John Doester"
})
```

#### Delete doc

```ts
const response = await doc.delete()
```

[build-img]:https://github.com/AndreasCaldewei/dynamometer/actions/workflows/release.yml/badge.svg

[build-url]:https://github.com/AndreasCaldewei/dynamometer/actions/workflows/release.yml

[downloads-img]:https://img.shields.io/npm/dt/dynamometer

[downloads-url]:https://www.npmtrends.com/dynamometer

[npm-img]:https://img.shields.io/npm/v/dynamometer

[npm-url]:https://www.npmjs.com/package/dynamometer

[issues-img]:https://img.shields.io/github/issues/AndreasCaldewei/dynamometer

[issues-url]:https://github.com/AndreasCaldewei/dynamometer/issues

[codecov-img]:https://codecov.io/gh/AndreasCaldewei/dynamometer/branch/main/graph/badge.svg

[codecov-url]:https://codecov.io/gh/AndreasCaldewei/dynamometer

[semantic-release-img]:https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg

[semantic-release-url]:https://github.com/semantic-release/semantic-release

[commitizen-img]:https://img.shields.io/badge/commitizen-friendly-brightgreen.svg

[commitizen-url]:http://commitizen.github.io/cz-cli/

