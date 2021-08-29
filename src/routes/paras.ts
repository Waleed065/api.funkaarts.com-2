import { Router } from "express";
import { getQuery } from "../mysql/getQuery";

const router = Router();


router.route("/").get((req, res) => {
  const query = `SELECT aboutUs, paraFive, paraFour, 
  paraThree, paraTwo, paraOne, privacyPolicy, termsOfService 
  FROM paras WHERE id = 1`;
  return getQuery({ res, query });
});

export default router;
