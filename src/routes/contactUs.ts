import { Router } from "express";
import { getQuery } from "../mysql/getQuery";
import { NotFound } from "../utils/functions";

const router = Router();

router.route("/").post((req, res) => {
  const { name, number, email, subject, body } = req?.body ?? {};

  const InvalidRequest = NotFound(res);

  if (
    !name?.length ||
    !number?.length ||
    !email?.length ||
    !subject?.length ||
    !body?.length
  ) {
    return InvalidRequest([]);
  }


  const query = `INSERT INTO contactUsRequests 
  (name, number, email, subject, body) VALUES 
  ("${name}", "${number}", "${email}", "${subject}", "${body}");`;

  return getQuery({ res, query });
});

export default router;
