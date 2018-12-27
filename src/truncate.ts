'use strict';
import { Db } from 'mongodb';

export default function truncateFactory(
  db: Db
): (collectionNames: string[]) => Promise<void> {
  return((collectionNames: string[]) => {
    const promises: Promise<void>[] = [];

    for (let i = 0; i < collectionNames.length; i++) {
      const collection = db.collection(collectionNames[i]);
      promises.push(
        collection.deleteMany({})
        .then(deleteResult => {
          if (deleteResult.result.ok !== 1) {
            return(Promise.reject(new Error(
              `Failed to truncate "${collectionNames[i]}", having deleted ` +
              `${deleteResult.result.n} documents.`
            )));
          }
          return(Promise.resolve());
        })
      );
    }

    return(
      Promise.all(promises)
      .then(() => Promise.resolve())
    );
  });
}