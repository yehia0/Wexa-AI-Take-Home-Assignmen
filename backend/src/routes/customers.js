import { Router } from "express";
import { runRead } from "../db/driver.js";

const router = Router();

// GET /api/customers — list customers for the picker UI
router.get("/", async (req, res, next) => {
  try {
    const records = await runRead(
      `MATCH (c:Customer)
       OPTIONAL MATCH (c)-[:LIVES_IN]->(a:Area)
       RETURN c.id AS id, c.name AS name, a.name AS area
       ORDER BY c.name`
    );
    res.json(records.map((r) => r.toObject()));
  } catch (err) {
    next(err);
  }
});

// GET /api/customers/:id/recommendations
// Multi-hop traversal (4 hops): find customers who ordered overlapping dishes,
// then surface restaurants THOSE customers liked that this customer hasn't tried.
// This kind of "similar taste → new suggestion" query is the awkward-in-SQL case:
// it would need several self-joins on an orders/order_items table and still
// wouldn't express "shared dish overlap" as cleanly as a graph pattern match.
router.get("/:id/recommendations", async (req, res, next) => {
  try {
    const records = await runRead(
      `MATCH (me:Customer {id: $customerId})-[:ORDERED]->(:Order)-[:CONTAINS]->(d:Dish)
       MATCH (peer:Customer)-[:ORDERED]->(:Order)-[:CONTAINS]->(d)
       WHERE peer.id <> me.id
       WITH me, peer, count(DISTINCT d) AS sharedDishes
       ORDER BY sharedDishes DESC
       LIMIT 20
       MATCH (peer)-[:ORDERED]->(:Order)-[:FROM]->(r:Restaurant)
       WHERE NOT (me)-[:ORDERED]->(:Order)-[:FROM]->(r)
       WITH r, sum(sharedDishes) AS score
       OPTIONAL MATCH (c2:Customer)-[rated:RATED]->(r)
       RETURN r.id AS id, r.name AS name, r.cuisine AS cuisine,
              score, round(avg(rated.stars) * 10) / 10 AS avgRating
       ORDER BY score DESC, avgRating DESC
       LIMIT 5`,
      { customerId: req.params.id }
    );
    res.json(records.map((r) => r.toObject()));
  } catch (err) {
    next(err);
  }
});

export default router;
