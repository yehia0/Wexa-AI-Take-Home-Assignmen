# GraphDB Application — Wexa AI Take-Home Assignment

A full-stack graph database application built with **CognoDB**, **Node.js**, **Express**, **React**, and **Tailwind CSS**.

The application demonstrates how graph data modeling and multi-hop traversal can be used to build a recommendation system based on customer relationships, restaurant preferences, and trust signals.

---

## Overview

This project was built as part of the **Wexa AI Take-Home Assignment**.

The application uses **CognoDB** as the graph database layer and the official **Neo4j JavaScript Driver** to communicate with the database over the Bolt protocol.

The main goal is to demonstrate:

* Graph-oriented data modeling
* Multi-hop Cypher queries
* Parameterized database queries
* Realistic graph seed data
* A clean backend architecture
* An interactive frontend for exploring the graph
* Graceful database error handling

---

## Use Case

### Customer & Restaurant Recommendation Network

The application models customers, their social connections, and the restaurants they like.

A customer can receive restaurant recommendations based on restaurants liked by people within their social network, including multi-hop connections up to four levels deep.

For example:

```text
Customer A
    │
    └── FRIEND
          │
          └── Customer B
                │
                └── FRIEND
                      │
                      └── Customer C
                            │
                            └── LIKED
                                  │
                                  ▼
                            Restaurant
```

This allows the application to answer relationship-oriented questions such as:

> "Which restaurants are liked by people connected to this customer within four degrees?"

---

## Why a Graph Database?

This use case is naturally relationship-driven.

In a traditional relational database, finding recommendations across multiple levels of a customer's social network would require multiple self-joins and increasingly complex queries as the traversal depth grows.

With a graph database, relationships are first-class entities. **Cypher** allows these relationships to be expressed directly as graph patterns, making multi-hop traversal easier to write, understand, and maintain.

CognoDB supports **openCypher over the Bolt protocol**, allowing the application to use the official Neo4j driver without requiring a custom database SDK.

---

## Data Model

The graph currently contains two primary node types:

### Nodes

* `Customer`

  * `id`
  * `name`
  * `location`

* `Restaurant`

  * `id`
  * `name`
  * `cuisine`
  * `avgRating`

### Relationships

* `(:Customer)-[:FRIEND]->(:Customer)`
* `(:Customer)-[:LIKED]->(:Restaurant)`

### Graph Diagram

```text
                    ┌──────────────┐
                    │   Customer   │
                    └──────┬───────┘
                           │
                        FRIEND
                           │
                           ▼
                    ┌──────────────┐
                    │   Customer   │
                    └──────┬───────┘
                           │
                         LIKED
                           │
                           ▼
                    ┌──────────────┐
                    │  Restaurant  │
                    └──────────────┘
```

The seed data intentionally contains overlapping relationships so that multi-hop recommendations can produce meaningful results.

---

## Main Graph Queries

### 1. Multi-hop Restaurant Recommendation

The main recommendation query traverses the customer's network up to four friendship hops and finds restaurants liked by connected customers.

```cypher
MATCH (c:Customer {id: $customerId})
      -[:FRIEND*1..4]-
      (f:Customer)
      -[:LIKED]->
      (r:Restaurant)
RETURN DISTINCT
    r.name AS name,
    r.cuisine AS cuisine,
    r.avgRating AS avgRating
ORDER BY r.avgRating DESC
```

The query uses a parameter (`$customerId`) rather than concatenating user input directly into the Cypher query.

### 2. Restaurant Trust Signals

The application also uses graph traversal to determine trust-related signals based on the existence or absence of specific paths between customers and restaurants.

### 3. Graph Subgraph

A dedicated graph endpoint exposes a portion of the network so the frontend can visualize customers, restaurants, and their relationships.

---

## Project Structure

```text
backend/
├── src/
│   ├── db/
│   │   └── driver.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── customers.js
│   │   ├── restaurants.js
│   │   └── graph.js
│   ├── scripts/
│   │   └── seed.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── package-lock.json

frontend/
├── public/
│   └── icons.svg
├── src/
│   ├── assets/
│   │   └── vite.svg
│   ├── components/
│   │   ├── CustomerSelector.jsx
│   │   ├── RecommendationsList.jsx
│   │   └── GraphVisualizer.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

---

## Technology Stack

### Database

* **CognoDB Cloud**
* OpenCypher
* Bolt protocol

### Backend

* **Node.js**
* **Express**
* **Neo4j Official JavaScript Driver**
* dotenv
* CORS
* Helmet
* Morgan

### Frontend

* **React**
* **Vite**
* **Tailwind CSS**

---

## Environment Setup

### 1. Create a CognoDB Instance

Create a free CognoDB Cloud instance and obtain the connection URI and generated password.

The connection URI follows this format:

```env
bolt+s://<instance-id>.databases.cognodb.cloud
```

The database username is:

```text
cognodb
```

### 2. Configure Environment Variables

Create a `.env` file inside the `backend` directory:

```env
COGNODB_URI=bolt+s://<your-instance-id>.databases.cognodb.cloud
COGNODB_USER=cognodb
COGNODB_PASSWORD=<your-generated-password>
PORT=4000
```

**Do not commit `.env` to GitHub.**

Use `.env.example` as the template for required environment variables.

---

## Running the Backend

From the project root:

```bash
cd backend
npm install
```

Load the seed data:

```bash
npm run seed
```

Start the development server:

```bash
npm run dev
```

Or start the production server:

```bash
npm start
```

---

## Running the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server will provide the local frontend URL.

---

## API Endpoints

### Customers

```text
GET /api/customers/:id/recommendations
```

Returns restaurant recommendations based on the customer's social graph.

### Restaurants

```text
GET /api/restaurants/:id/trust
```

Returns graph-based trust signals for a restaurant.

### Graph

```text
GET /api/graph
```

Returns graph data used by the frontend to visualize the network.

---

## Error Handling

The backend includes centralized error handling through:

```text
src/middleware/errorHandler.js
```

Database connection failures and request errors are handled gracefully so that the API can return meaningful error responses instead of crashing the application.

---

## Seed Data

The project includes a dedicated seed script:

```text
backend/src/scripts/seed.js
```

The script creates realistic customers, restaurants, friendships, and restaurant preferences.

The relationships intentionally include overlapping connections to demonstrate meaningful multi-hop graph traversal and recommendations.

Run the seed script with:

```bash
npm run seed
```

---

## Security

Sensitive database credentials are loaded through environment variables.

The following should **never** be committed to the repository:

```text
.env
```

Only the example configuration should be included:

```text
.env.example
```

Cypher queries are parameterized using the official Neo4j driver to avoid constructing queries through string concatenation.

---

## Demo

### Hosted Application

> Add the deployed application URL here.

```text
https://your-demo-url.com
```

### Screen Recording

> Add the screen recording link here.

---

## Screenshots

Add screenshots of the application here, including:

1. Main recommendation interface
2. Restaurant trust information
3. Graph visualization

---

## What This Project Demonstrates

This project demonstrates:

* Graph data modeling with nodes and relationships
* Multi-hop traversal using Cypher
* Relationship-based recommendations
* Parameterized Cypher queries
* Realistic graph seed data
* REST API design with Express
* Centralized error handling
* Interactive graph visualization
* Separation between frontend, backend, and database layers

---

## License

This project was created as a take-home assignment for **Wexa AI**.
