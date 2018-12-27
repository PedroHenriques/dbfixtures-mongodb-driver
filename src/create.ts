'use strict';
import {
  connect, MongoClientOptions, MongoClientCommonOption
} from 'mongodb';
import truncateFactory from './truncate';
import insertFixturesFactory from './insertFixtures';
import closeFactory from './close';
import { IDriver } from './interfaces';

export default async function create(
  args: {
    connectURI: string, connectOptions?: MongoClientOptions, dbName: string,
    dbOptions?: MongoClientCommonOption
  }
): Promise<IDriver> {
  const client = await connect(args.connectURI, args.connectOptions);
  const db = client.db(args.dbName, args.dbOptions);

  return({
    truncate: truncateFactory(db),
    insertFixtures: insertFixturesFactory(db),
    close: closeFactory(client),
  });
}