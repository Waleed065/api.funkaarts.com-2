import { Response } from "express";
import { db } from "../mysql/connection";
import { Catch, Then } from "../utils/functions";

interface schema {
  res: Response;
  query: string;
}

export function getQuery({ res, query }: schema) {
  const onSuccess = Then(res);
  const onError = Catch(res);

  db.query(query, (err, response) => {
    if (err) {
      // console.log(err);
      return onError(err);
    }
    
    return onSuccess(response);
  });
}
