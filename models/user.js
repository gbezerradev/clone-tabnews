import database from "infra/database";
import { ValidationError } from "infra/errors";

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

const user = {
  create,
};

export default user;
