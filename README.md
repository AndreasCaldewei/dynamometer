
# Dynamometer

![Dynamometer Logo](logo.svg)

Dynamometer simplifies the use of a single table design in your DynamoDB queries.

- [npm package](https://www.npmjs.com/package/dynamometer)
- [Build Status](https://github.com/AndreasCaldewei/dynamometer/actions/workflows/release.yml)
- [Downloads](https://www.npmtrends.com/dynamometer)
- [Issues](https://github.com/AndreasCaldewei/dynamometer/issues)
- [Code Coverage](https://codecov.io/gh/AndreasCaldewei/dynamometer)
- [Semantic Release](https://github.com/semantic-release/semantic-release)
- [Commitizen Friendly](http://commitizen.github.io/cz-cli/)

## Introduction

Using a single design approach in DynamoDB can be challenging. Dynamometer introduces "Collections" and "Docs" to make your data more understandable. It's perfect for simple projects, allowing you to adopt a single-table approach without diving deep into access patterns.

## Features

- User-friendly API for querying and creating DynamoDB items.
- Automatic structuring of data in a single table design.

## Installation

```bash
npm install dynamometer       # npm
yarn add dynamometer          # yarn
pnpm add dynamometer          # pnpm
```

## Basic Usage

### Setting Up

```ts
import { Dynamometer } from 'dynamometer';

const db = Dynamometer.create({
  tableName: "dataTable"
});
```

### Collections

Collections contain multiple items.

**Creating a Collection:**
```ts
const collection = db.collection("USERS");
```

**Adding an Item:**
```ts
collection.add({
  name: "John Doe"
});
```

**Querying All Items:**
```ts
const response = await collection.get();
```

### Documents

A document is an individual item within a collection.

**Accessing a Document by ID:**
```ts
const doc = db.collection("USERS").doc("123");
```

**Setting Document Data:**
```ts
const response = await doc.set({
  name: "John Doe"
});
```

**Retrieving Document Data:**
```ts
const data = await doc.get();
```

**Updating a Document:**
```ts
const response = await doc.update({
  name: "John Doester"
});
```

**Deleting a Document:**
```ts
const response = await doc.delete();
```

---

