// Seeds CognoDB with a small, realistic Fraise-style dataset:
// Areas, Customers, Restaurants, Dishes, Drivers, Orders + their relationships.
// Run with: npm run seed

import { driver, closeDriver } from "../db/driver.js";

const areas = ["Nasr City", "Maadi", "Zamalek", "Dokki"];

const restaurants = [
  { id: "r1", name: "Koshary Abou Tarek", cuisine: "Egyptian", area: "Dokki" },
  { id: "r2", name: "Zooba", cuisine: "Egyptian Street Food", area: "Zamalek" },
  { id: "r3", name: "Pizza Pino", cuisine: "Italian", area: "Maadi" },
  { id: "r4", name: "Sushi Yama", cuisine: "Japanese", area: "Zamalek" },
  { id: "r5", name: "Burger Bay", cuisine: "American", area: "Nasr City" },
];

const dishesByRestaurant = {
  r1: ["Koshary", "Rice Pudding"],
  r2: ["Taameya Wrap", "Molokhia Bowl"],
  r3: ["Margherita Pizza", "Pasta Alfredo"],
  r4: ["California Roll", "Salmon Nigiri"],
  r5: ["Classic Cheeseburger", "Spicy Chicken Burger"],
};

const customers = [
  { id: "c1", name: "Yehia", area: "Nasr City" },
  { id: "c2", name: "Mona", area: "Maadi" },
  { id: "c3", name: "Omar", area: "Zamalek" },
  { id: "c4", name: "Salma", area: "Dokki" },
  { id: "c5", name: "Karim", area: "Nasr City" },
];

const drivers = [
  { id: "d1", name: "Ahmed" },
  { id: "d2", name: "Hassan" },
];

async function run() {
  const session = driver.session();
  try {
    console.log("[seed] Clearing existing data...");
    await session.run("MATCH (n) DETACH DELETE n");

    console.log("[seed] Creating constraints...");
    for (const label of ["Customer", "Restaurant", "Dish", "Driver", "Order", "Area"]) {
      await session.run(
        `CREATE CONSTRAINT IF NOT EXISTS FOR (n:${label}) REQUIRE n.id IS UNIQUE`
      );
    }

    console.log("[seed] Creating areas...");
    for (const name of areas) {
      await session.run(`MERGE (a:Area {id: $id}) SET a.name = $name`, {
        id: name.toLowerCase().replace(/\s/g, "-"),
        name,
      });
    }

    console.log("[seed] Creating restaurants...");
    for (const r of restaurants) {
      await session.run(
        `MERGE (rest:Restaurant {id: $id})
         SET rest.name = $name, rest.cuisine = $cuisine
         WITH rest
         MATCH (a:Area {id: $areaId})
         MERGE (rest)-[:LOCATED_IN]->(a)`,
        { id: r.id, name: r.name, cuisine: r.cuisine, areaId: r.area.toLowerCase().replace(/\s/g, "-") }
      );
      for (const dishName of dishesByRestaurant[r.id]) {
        const dishId = `${r.id}-${dishName.toLowerCase().replace(/\s/g, "-")}`;
        await session.run(
          `MATCH (rest:Restaurant {id: $rid})
           MERGE (d:Dish {id: $did})
           SET d.name = $name
           MERGE (rest)-[:SERVES]->(d)`,
          { rid: r.id, did: dishId, name: dishName }
        );
      }
    }

    console.log("[seed] Creating customers...");
    for (const c of customers) {
      await session.run(
        `MERGE (cust:Customer {id: $id})
         SET cust.name = $name
         WITH cust
         MATCH (a:Area {id: $areaId})
         MERGE (cust)-[:LIVES_IN]->(a)`,
        { id: c.id, name: c.name, areaId: c.area.toLowerCase().replace(/\s/g, "-") }
      );
    }

    console.log("[seed] Creating drivers...");
    for (const d of drivers) {
      await session.run(`MERGE (driver:Driver {id: $id}) SET driver.name = $name`, d);
    }

    console.log("[seed] Creating orders, ratings...");
    // A handful of orders that create real overlap between customers' tastes,
    // so the recommendation query has something meaningful to traverse.
    const orders = [
      { id: "o1", customer: "c1", restaurant: "r1", dishes: ["r1-koshary"], driver: "d1" },
      { id: "o2", customer: "c2", restaurant: "r1", dishes: ["r1-koshary"], driver: "d1" },
      { id: "o3", customer: "c2", restaurant: "r3", dishes: ["r3-margherita-pizza"], driver: "d2" },
      { id: "o4", customer: "c3", restaurant: "r3", dishes: ["r3-margherita-pizza"], driver: "d2" },
      { id: "o5", customer: "c3", restaurant: "r4", dishes: ["r4-california-roll"], driver: "d1" },
      { id: "o6", customer: "c4", restaurant: "r2", dishes: ["r2-taameya-wrap"], driver: "d2" },
      { id: "o7", customer: "c5", restaurant: "r5", dishes: ["r5-classic-cheeseburger"], driver: "d1" },
      { id: "o8", customer: "c1", restaurant: "r5", dishes: ["r5-classic-cheeseburger"], driver: "d2" },
    ];

    for (const o of orders) {
      await session.run(
        `MATCH (cust:Customer {id: $customerId}), (rest:Restaurant {id: $restaurantId}), (drv:Driver {id: $driverId})
         MERGE (ord:Order {id: $id})
         SET ord.placedAt = datetime()
         MERGE (cust)-[:ORDERED]->(ord)
         MERGE (ord)-[:FROM]->(rest)
         MERGE (drv)-[:DELIVERED]->(ord)`,
        { id: o.id, customerId: o.customer, restaurantId: o.restaurant, driverId: o.driver }
      );
      for (const dishId of o.dishes) {
        await session.run(
          `MATCH (ord:Order {id: $orderId}), (d:Dish {id: $dishId})
           MERGE (ord)-[:CONTAINS]->(d)`,
          { orderId: o.id, dishId }
        );
      }
    }

    // Ratings, including a couple of "suspicious" ones (rated but never ordered)
    // to give the trust-flags query something to find.
    const ratings = [
      { customer: "c1", restaurant: "r1", stars: 5 },
      { customer: "c2", restaurant: "r1", stars: 4 },
      { customer: "c2", restaurant: "r3", stars: 5 },
      { customer: "c4", restaurant: "r2", stars: 5 },
      // suspicious: c4 and c5 rate r4 highly without ever ordering from it
      { customer: "c4", restaurant: "r4", stars: 5 },
      { customer: "c5", restaurant: "r4", stars: 5 },
    ];
    for (const r of ratings) {
      await session.run(
        `MATCH (cust:Customer {id: $customerId}), (rest:Restaurant {id: $restaurantId})
         MERGE (cust)-[rated:RATED]->(rest)
         SET rated.stars = $stars`,
        { customerId: r.customer, restaurantId: r.restaurant, stars: r.stars }
      );
    }

    console.log("[seed] Done.");
  } finally {
    await session.close();
    await closeDriver();
  }
}

run().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
