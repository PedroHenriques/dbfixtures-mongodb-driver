'use strict';
import { MongoClient } from 'mongodb';

export default function closeFactory(client: MongoClient) {
  return((): Promise<void> => client.close());
}