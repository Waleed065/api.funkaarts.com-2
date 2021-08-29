import { Router } from "express";
import { getQuery } from "../mysql/getQuery";

const router = Router();

router.route("/:companyId").get((req, res) => {
  let { companyId } = req.params;
  const { filter, sort, country, city } = req.query;
  companyId = companyId.replace(/[+\-><\(\)~*\"@]+/g, " ");

  let where = "";
  if (companyId.startsWith("q=")) {
    where += ` MATCH (title, companyId, cityId, countryId) 
    AGAINST ( "${companyId.replace("q=", "")}*" IN BOOLEAN MODE) `;
  } else {
    where += ` companyId = "${companyId}" `;
  }

  switch (filter) {
    case "all":
      where += "";
      break;
    case "available":
      where += " AND vehicles.vehicleAvailable = true ";
      break;
    case "unavailable":
      where += " AND vehicles.vehicleAvailable = false ";
      break;
    case "driver-true":
      where +=
        " AND vehicles.vehicleAvailable = true AND vehicles.driverAvailable = true ";
      break;
    case "driver-false":
      where +=
        " AND vehicles.vehicleAvailable = true AND vehicles.driverAvailable = false ";
      break;
    case "insurance-true":
      where +=
        " AND vehicles.vehicleAvailable = true AND vehicles.insuranceAvailable = true ";
      break;
    case "insurance-false":
      where +=
        " AND vehicles.vehicleAvailable = true AND vehicles.insuranceAvailable = false ";
      break;

    default:
      where += " AND vehicles.vehicleAvailable = true ";
      break;
  }

  let order = "";
  switch (sort) {
    case "rent-asc":
      order += " vehicles.vehicleRentPerDay ASC ";
      break;
    case "rent-desc":
      order += " vehicles.vehicleRentPerDay DESC ";
      break;
    case "latest":
      order += " vehicles.createdAt DESC ";
      break;
    case "relivance":
      order += " vehicles.title ASC ";
      break;

    default:
      order += " vehicles.title ASC, vehicles.model DESC";
      break;
  }

  if (country) where += ` AND vehicles.countryId = "${country}" `;
  if (city) where += ` AND vehicles.cityId = "${city}" `;

  // const query = `SELECT
  // vehicles.id,
  // vehicles.title,
  // vehicles.model,
  // vehicles.vehicleRentPerDay,
  // vehicles.vehicleRentPerMonth,
  // img.url AS avatar
  // FROM vehicles
  // LEFT JOIN (
  // SELECT vehicleId, url, ROW_NUMBER() OVER (PARTITION BY vehicleId) AS duplicates FROM images
  // ) img
  // ON vehicles.id = img.vehicleId AND img.duplicates = 1
  // WHERE vehicles.countryId = "${countryId}" AND vehicles.cityId = "${cityId}"
  // AND vehicles.companyId = "${companyId}" AND vehicles.vehicleAvailable = true;`;

  const query = `SELECT 
    vehicles.id,
    vehicles.companyId,
    vehicles.title,
    vehicles.model, 
    vehicles.vehicleRentPerDay, 
    vehicles.vehicleRentPerMonth, 
    vehicles.countryId, 
    vehicles.cityId, 

    (SELECT images.url 
    FROM images 
    WHERE images.vehicleId = vehicles.id 
    LIMIT 1) AS avatar 
    FROM vehicles 

    WHERE 
    ${where}
    ORDER BY
    ${order}
    ;`;


    return getQuery({ res, query });
});

export default router;
