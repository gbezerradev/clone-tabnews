import database from "infra/database";
import { NotFoundError, ValidationError } from "infra/errors";

async function create({ username, email, password }) {
  await checkIfEmailIsAlreadyInUse(email);
  await checkIfUsernameIsAlreadyInUse(username);

  const newUser = await runInsertQuery({
    username,
    email,
    password,
  });
  return newUser;

  async function checkIfEmailIsAlreadyInUse(email) {
    const result = await database.query({
      text: `
        SELECT
          *
        FROM
          users
        WHERE
          LOWER(email) = LOWER($1) 
        ;`,
      values: [email],
    });

    if (result.rows.length > 0) {
      throw new ValidationError({
        message: "O email informado já está em uso",
        action: "Informe outro email",
      });
    }
  }

  async function checkIfUsernameIsAlreadyInUse(username) {
    const result = await database.query({
      text: `
        SELECT
          *
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1) 
        ;`,
      values: [username],
    });

    if (result.rows.length > 0) {
      throw new ValidationError({
        message: "O nome de usuário informado já está em uso",
        action: "Informe outro nome de usuário",
      });
    }
  }

  async function runInsertQuery({ username, email, password }) {
    const result = await database.query({
      text: `
        INSERT INTO
          users (username, email, password)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
        ;`,
      values: [username, email, password],
    });

    return result.rows[0];
  }
}

async function findOneByUsername(username) {
  const userRecord = await runSelectQuery(username);
  return userRecord;

  async function runSelectQuery(username) {
    const result = await database.query({
      text: `
        SELECT
          *
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        LIMIT
          1
        ;`,
      values: [username],
    });

    if (result.rows.length === 0) {
      throw new NotFoundError({
        message: "O username informado não foi encontrado",
        action: "Verifique se o username está correto",
      });
    }

    return result.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
};

export default user;
