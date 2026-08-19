import { Router } from "express";
import { runRead } from "../db/driver.js";

const router = Router();

// GET /api/restaurants
router.get("/", async (req, res, next) => {
  try {
    const records = await runRead(
      `MATCH (r:Restaurant)
       OPTIONAL MATCH (c:Customer)-[rated:RATED]->(r)
       WITH r, avg(rated.stars) AS avgRating, count(rated) AS ratingCount
       RETURN r.id AS id, r.name AS name, r.cuisine AS cuisine,
              coalesce(round(avgRating * 10) / 10, 0) AS avgRating, ratingCount
       ORDER BY r.name`
    );
    res.json(records.map((r) => r.toObject()));
  } catch (err) {
    next(err);
  }
});

// GET /api/restaurants/trust-flags
// Flags restaurants that get most of their 5-star ratings from customers who
// never actually ordered from them (i.e. a RATED edge with no matching ORDERED
// chain to that restaurant) — a pattern-shaped fraud signal that's a natural
// graph traversal (path non-existence check) but a genuinely awkward
// multi-way LEFT JOIN + NOT EXISTS subquery in a relational schema.
router.get("/trust-flags", async (req, res, next) => {
  try {
    const records = await runRead(
      `MATCH (c:Customer)-[rated:RATED]->(r:Restaurant)
       WHERE rated.stars >= 4
         AND NOT (c)-[:ORDERED]->(:Order)-[:FROM]->(r)
       WITH r, count(rated) AS suspiciousRatings
       WHERE suspiciousRatings >= 2
       RETURN r.id AS id, r.name AS name, suspiciousRatings
       ORDER BY suspiciousRatings DESC`
    );
    res.json(records.map((r) => r.toObject()));
  } catch (err) {
    next(err);
  }
});

export default router;
