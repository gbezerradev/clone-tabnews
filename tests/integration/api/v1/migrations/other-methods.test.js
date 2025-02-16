import database from "infra/database.js";

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

test("Any method other than GET or POST to /api/v1/migrations should return 405", async () => {
  const methods = ["PUT", "DELETE", "PATCH", "OPTIONS"];
  for (const method of methods) {
    await cleanDatabase();

    const response = await fetch("http://localhost:3000/api/v1/migrations", {
      method,
    });
    expect(response.status).toBe(405);
  }
});
