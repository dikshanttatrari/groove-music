const { MongoClient, ObjectId } = require("mongodb");
let nanoid;
import("nanoid").then((mod) => {
  nanoid = mod.nanoid;
});

const uri =
  "mongodb+srv://dikshanttatrari12:dikshanttatrari@dropstore.x7yxtpl.mongodb.net/";
const dbName = "test";
const collectionName = "products";

async function addProductIds() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const cursor = collection.find({ productId: { $exists: false } });

    let updatedCount = 0;

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const newId = nanoid(10);

      const result = await collection.updateOne(
        { _id: new ObjectId(doc._id) },
        { $set: { productId: newId } }
      );

      if (result.modifiedCount > 0) {
        console.log(`✅ Updated ${doc._id} with productId: ${newId}`);
        updatedCount++;
      } else {
        console.warn(`⚠️ Failed to update ${doc._id}`);
      }
    }

    console.log(`✨ Done! ${updatedCount} products updated.`);
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.close();
  }
}

addProductIds();
