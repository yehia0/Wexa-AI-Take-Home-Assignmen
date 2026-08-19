import neo4j from "neo4j-driver";
import dotenv from "dotenv";

dotenv.config();

const { COGNODB_URI, COGNODB_USER, COGNODB_PASSWORD } = process.env;

if (!COGNODB_URI || !COGNODB_USER || !COGNODB_PASSWORD) {
  console.error(
    "[db] Missing CognoDB connection env vars. Copy .env.example to .env and fill it in."
  );
}

// Single shared driver instance for the whole app (do NOT open a new driver per request).
export const driver = neo4j.driver(
  COGNODB_URI,
  neo4j.auth.basic(COGNODB_USER, COGNODB_PASSWORD),
  { disableLosslessIntegers: true }
);

// Call once at boot to fail fast with a clear message if the instance is unreachable.
export async function verifyConnection() {
  try {
    await driver.verifyConnectivity();
    console.log("[db] Connected to CognoDB.");
    return true;
  } catch (err) {
    console.error("[db] Could not connect to CognoDB:", err.message);
    return false;
  }
}

// Helper: run a read query with parameters, always via a fresh session, always closed.
export async function runRead(cypher, params = {}) {
  const session = driver.session({ defaultAccessMode: neo4j.session.READ });
  try {
    const result = await session.run(cypher, params);
    return result.records;
  } finally {
    await session.close();
  }
}

// Helper: run a write query with parameters.
export async function runWrite(cypher, params = {}) {
  const session = driver.session({ defaultAccessMode: neo4j.session.WRITE });
  try {
    const result = await session.run(cypher, params);
    return result.records;
  } finally {
    await session.close();
  }
}

export async function closeDriver() {
  await driver.close();
}
