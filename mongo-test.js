import { MongoClient } from "mongodb";

// Connection URI
const uri = "mongodb://localhost:27017/careerlaunchpad";

// Create a new MongoClient
const client = new MongoClient(uri);

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log("Connected successfully to MongoDB server");
    
    // Get the database
    const database = client.db("careerlaunchpad");
    
    // List all collections
    const collections = await database.listCollections().toArray();
    console.log("Collections in database:", collections.map(c => c.name));
    
    // Close the connection
    await client.close();
    console.log("Disconnected from MongoDB server");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

run(); 