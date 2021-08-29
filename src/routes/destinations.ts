import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { getQuery } from "../mysql/getQuery";

const router = Router();


router.route("/:countryId/cities").get((req, res) => {
  const { countryId } = req.params;
  const query = `SELECT DISTINCT cityId FROM vehicles WHERE countryId = "${countryId}";`;

  getQuery({res, query})
});

router.route("/:countryId/post-ad-cities").get(authMiddleware, (req, res) => {
  const { countryId } = req.params;
  const query = `SELECT cityId FROM cities WHERE countryId = "${countryId}";`;

  getQuery({res, query})
});

export default router;
