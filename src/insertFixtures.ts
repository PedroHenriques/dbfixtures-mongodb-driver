'use strict';
import { Db } from 'mongodb';

export default function insertFixturesFactory(db: Db) {
  return(async (collectionName: string, fixtures: [{}]): Promise<void> => {
    const collection = db.collection(collectionName);
    const insertResult = await collection.insertMany(fixtures);
    if (insertResult.result.ok !== 1) {
      return(Promise.reject(new Error(
        `Failed to insert the fixtures for the collection "${collectionName}"` +
        `, having inserted ${insertResult.result.n} documents.`
      )));
    }
    return(Promise.resolve());
  });
}