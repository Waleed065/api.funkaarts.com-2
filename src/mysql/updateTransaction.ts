import { Response } from "express";
import { db } from "./connection";
import { Catch, Then } from "../utils/functions";

interface schema {
  res: Response;
  queries: string[];
}

export async function updateTransaction({ res, queries }: schema) {
  const onSuccess = Then(res);
  const onError = Catch(res);

  // console.log(queries);
  db.beginTransaction((err) => {
    if (err) return onError(err);

    const promises = [];
    for (let query of queries) {
      promises.push(
        new Promise((resolve, reject) => {
          db.query(query, (err, response) => {
            if (err) {
              return reject(err);
            } else {
              return resolve(response);
            }
          });
        })
      );
    }

    return Promise.all(promises)
      .then((result) => {
        db.commit((err) => {
          if (err) {
            db.rollback();
            return onError(err);
          } else return onSuccess(result);
        });
      })
      .catch((error) => {
        console.log(error);
        db.rollback();
        return onError(error);
      });
  });
}
