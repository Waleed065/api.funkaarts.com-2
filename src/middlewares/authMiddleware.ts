import { NextFunction, Request, Response } from "express";
import { Catch, NotFound } from "../utils/functions";
import firebaseAdmin from "firebase-admin";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.header("x-auth-token");
  const id = req.header("x-api-key");

  const invalidRequest = NotFound(res);
  const onError = Catch(res);

  if (!token || !id) return invalidRequest([]);
  try {
    firebaseAdmin
      .auth()
      .verifyIdToken(token)
      .then((decodedToken) => {
        const uid = decodedToken.uid;

        if (uid === id && decodedToken.admin === true) {
          res.locals.uid = uid;
          res.locals.token = token;

          next();
        } else {
          return invalidRequest([]);
        }
      })
      .catch(onError);
  } catch (e) {
    onError(e);
  }
}
