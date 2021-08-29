import { Response } from "express";
import { db } from "./connection";
import { Catch, NotFound, Then } from "../utils/functions";

interface schema {
  res: Response;
  queries: string[];
  onResolve: (result: any) => any;
}

export async function getMultipleQueries({ res, queries, onResolve }: schema) {
  const onError = Catch(res);
  const onSuccess = Then(res);
  const InvalidRequest = NotFound(res);

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
      const results = onResolve(result);

      if (!results) return InvalidRequest([]);
      return onSuccess(results);
    })
    .catch(onError);
}
