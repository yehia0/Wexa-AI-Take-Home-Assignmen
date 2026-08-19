GraphDB Application - Wexa AI Take-Home Assignment
A full-stack graph database application built with CognoDB, Node.js, Express, React, and Tailwind CSS.

Use Case and Why a Graph Database
Use Case: A multi-hop recommendation system for customers and restaurants, mapping social connections and preferences.

Why a Graph Database: In a traditional relational database, finding recommendations across multi-hop friend networks requires complex and expensive nested JOIN operations that scale poorly. CognoDB allows fast traversals using Cypher, where relationships are first-class citizens, making pattern-matching and multi-hop paths natural and efficient.

Data Model
The graph consists of two primary node labels and typed relationships:

Nodes: Customer, Restaurant

Relationships: Customer-FRIEND-Customer, Customer-LIKED-Restaurant

[Customer] --[:FRIEND]--> [Customer]
    |
    v
[:LIKED]
    |
    v
[Restaurant]
Tech Stack
Database: CognoDB (Cloud instance speaking open Cypher over Bolt protocol)

Backend: Node.js, Express, official Neo4j Driver

Frontend: React, Vite, Tailwind CSS

Setup and Run Instructions
1. Environment Setup
Create a .env file in your backend directory with your CognoDB credentials:

Code snippet
COGNODB_URI=bolt+s://<your-instance-id>.databases.cognodb.cloud
COGNODB_USER=cognodb
COGNODB_PASSWORD=<your-generated-password>
PORT=4000
2. Run Backend
Bash
cd backend
npm install
npm run seed  
npm start     
3. Run Frontend
Bash
cd frontend
npm install
npm run dev   
Main Cypher Query
Cypher
MATCH (c:Customer {id: $customerId})-[:FRIEND*1..4]-(f:Customer)-[:LIKED]->(r:Restaurant)
RETURN DISTINCT r.name AS name, r.cuisine AS cuisine, r.avgRating AS avgRating