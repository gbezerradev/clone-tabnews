import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const dbVersionResult = await database.query("SHOW server_version;");
  const dbVersion = dbVersionResult.rows[0].server_version;

  const dbMaxConnectionsResult = await database.query("SHOW max_connections;");
  const dbMaxConnections = dbMaxConnectionsResult.rows[0].max_connections;

  const dbOpenConnectionsResult = await database.query({
    text: "SELECT count(*)::int as opened_connections FROM pg_stat_activity where datname = $1",
    values: [process.env.POSTGRES_DB],
  });
  const dbOpenConnections = dbOpenConnectionsResult.rows[0].opened_connections;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: dbVersion,
        max_connections: parseInt(dbMaxConnections),
        opened_connections: dbOpenConnections,
      },
    },
  });
}

export default status;
