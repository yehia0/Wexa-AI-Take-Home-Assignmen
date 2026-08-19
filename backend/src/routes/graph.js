import { Router } from "express";
import { runRead } from "../db/driver.js";

const router = Router();

// GET /api/graph/customer/:id — a small neighborhood subgraph around one
// customer (2 hops out), shaped for a force-directed graph view in the UI.
router.get("/customer/:id", async (req, res, next) => {
  try {
    const records = await runRead(
      `MATCH path = (c:Customer {id: $customerId})-[*1..2]-(n)
       RETURN path
       LIMIT 60`,
      { customerId: req.params.id }
    );

    const nodes = new Map();
    const links = [];

    for (const record of records) {
      const path = record.get("path");
      for (const segment of path.segments) {
        for (const node of [segment.start, segment.end]) {
          if (!nodes.has(node.identity.toString())) {
            nodes.set(node.identity.toString(), {
              id: node.identity.toString(),
              label: node.labels[0],
              name: node.properties.name || node.properties.id,
            });
          }
        }
        links.push({
          source: segment.start.identity.toString(),
          target: segment.end.identity.toString(),
          type: segment.relationship.type,
        });
      }
    }

    res.json({ nodes: [...nodes.values()], links });
  } catch (err) {
    next(err);
  }
});

export default router;
