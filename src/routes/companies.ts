import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { getQuery } from "../mysql/getQuery";


const router = Router();

router.route("/").get(authMiddleware, (req, res) => {
  const query = `SELECT * FROM companies;`;

  return getQuery({res, query})
});


router.route("/:countryId/:cityId").get((req, res) => {
  const { countryId, cityId } = req.params;

  const query = `SELECT * FROM companies WHERE companies.id IN 
  (SELECT DISTINCT companyId FROM vehicles WHERE 
  countryId = "${countryId}" AND cityId = "${cityId}");`;

  return getQuery({res, query})
});

export default router;
