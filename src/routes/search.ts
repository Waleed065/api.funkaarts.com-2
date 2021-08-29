import { Router } from "express";
import { getQuery } from "../mysql/getQuery";
import { NotFound } from '../utils/functions';

const router = Router();

router.route("/").get((req, res) => {
  const searchParam = req.query?.q;

  if (!searchParam) {
    const InvalidRequest = NotFound(res);
    return InvalidRequest([]);
  }

  const query = `SELECT DISTINCT
        vehicles.title

        FROM vehicles WHERE 
        MATCH (title, companyId, cityId, countryId) 
        AGAINST ( "${searchParam}*" IN BOOLEAN MODE) LIMIT 10;`;

  getQuery({ res, query });
});

export default router;
