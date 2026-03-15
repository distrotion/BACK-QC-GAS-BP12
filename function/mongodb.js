const { MongoClient } = require('mongodb');
// const url = 'mongodb://127.0.0.1:17020';
//const url = 'mongodb://172.23.10.99:27017';
const url = 'mongodb://172.23.10.99:27017';

let client = null;

async function getClient() {
  if (!client) {
    client = new MongoClient(url);
    await client.connect();
    console.log('MongoDB connected');
  }
  return client;
}

exports.insertMany = async (db_input, collection_input, input) => {
  const c = await getClient();
  const collection = c.db(db_input).collection(collection_input);
  return collection.insertMany(input);
};

exports.find = async (db_input, collection_input, input) => {
  const c = await getClient();
  const collection = c.db(db_input).collection(collection_input);
  return collection.find(input).limit(1000).sort({ "_id": -1 }).toArray();
};

exports.findsome = async (db_input, collection_input, input) => {
  const c = await getClient();
  const collection = c.db(db_input).collection(collection_input);
  return collection.find(input).limit(500).sort({ "_id": -1 }).project({ "PO": 1, "CP": 1, "ALL_DONE": 1 }).toArray();
};

exports.findproject = async (db_input, collection_input, input1, input2) => {
  const c = await getClient();
  const collection = c.db(db_input).collection(collection_input);
  return collection.find(input1).limit(500).sort({ "_id": -1 }).project(input2).toArray();
};

exports.update = async (db_input, collection_input, input1, input2) => {
  const c = await getClient();
  const collection = c.db(db_input).collection(collection_input);
  const res = await collection.updateOne(input1, input2);

  // บันทึก record ทุกครั้งที่มีการ update
  const logCollection = c.db('LOG').collection('UPDATE_LOG');
  await logCollection.insertOne({
    "timestamp": new Date(),
    "db": db_input,
    "collection": collection_input,
    "filter": input1,
    "update": input2,
    "matchedCount": res.matchedCount,
    "modifiedCount": res.modifiedCount,
  });

  return res;
};

exports.findSAP = async (urls, db_input, collection_input, input) => {
  const c = new MongoClient(urls);
  await c.connect();
  const collection = c.db(db_input).collection(collection_input);
  const res = await collection.find(input).limit(30000).sort({ "_id": -1 }).toArray();
  await c.close();
  return res;
};
