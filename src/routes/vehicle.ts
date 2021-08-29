import { Router } from "express";
import admin from "firebase-admin";
import { db } from "../mysql/connection";
import { Catch, NotFound, Then } from "../utils/functions";
import { booleanType } from "../utils/booleanType";
import { updateTransaction } from "../mysql/updateTransaction";
import { getMultipleQueries } from "../mysql/getMultipleQueries";
import { authMiddleware } from "../middlewares/authMiddleware";
import { refFromUrl } from "../utils/refFromUrl";

const router = Router();

router.route("/:vehicleId").get((req, res) => {
  const { vehicleId } = req.params;

  const query1 = `SELECT *
    FROM vehicles 
    WHERE id = ${vehicleId} LIMIT 1;`;

  const query2 = `SELECT id, url
    FROM images 
    WHERE vehicleId = ${vehicleId};`;

  const queries = [query1, query2];

  const onResolve = (results: any) => {
    if (!results[0]?.[0]?.id) return false;

    const { driverAvailable, vehicleAvailable, insuranceAvailable } =
      results[0][0];
    results = [
      {
        ...results[0][0],
        driverAvailable: booleanType[driverAvailable],
        vehicleAvailable: booleanType[vehicleAvailable],
        insuranceAvailable: booleanType[insuranceAvailable],
        images: results[1],
      },
    ];
    return results;
  };

  return getMultipleQueries({ res, queries, onResolve });
});

router.route("/:vehicleId").put(authMiddleware, (req, res) => {
  const { vehicleId } = req.params;
  const { vehicle } = req.body;
  const InvalidRequest = NotFound(res);

  const {
    driverAvailable,
    driverRentPerDay,
    driverRentPerMonth,
    insuranceAvailable,
    insuranceRentPerDay,
    insuranceRentPerMonth,
    model,
    title,
    vehicleAvailable,
    vehicleRentPerDay,
    vehicleRentPerMonth,

    countryId,
    cityId,
    companyId,
    id,

    images,
  } = vehicle;

  const validate = [
    typeof driverAvailable === "boolean",
    Boolean(driverRentPerDay),
    Boolean(driverRentPerMonth),
    typeof insuranceAvailable === "boolean",
    Boolean(insuranceRentPerDay),
    Boolean(insuranceRentPerMonth),
    Boolean(model),
    Boolean(title),
    typeof vehicleAvailable === "boolean",
    Boolean(vehicleRentPerDay),
    Boolean(vehicleRentPerMonth),

    Boolean(countryId),
    Boolean(cityId),
    Boolean(companyId),
    id.toString() === vehicleId.toString(),

    images?.length === 3,
  ];

  if (!validate.every((item) => item === true)) {
    return InvalidRequest([]);
  }

  if (
    !images.every(
      (img: any) => Boolean(img.url) === true && Boolean(img.id) === true
    )
  ) {
    return InvalidRequest([]);
  }

  const query1 = `UPDATE vehicles SET 
    driverAvailable = ${driverAvailable},
    driverRentPerDay = ${driverRentPerDay},
    driverRentPerMonth = ${driverRentPerMonth},
    insuranceAvailable = ${insuranceAvailable},
    insuranceRentPerDay = ${insuranceRentPerDay},
    insuranceRentPerMonth = ${insuranceRentPerMonth},
    model = ${model},
    title = "${title}",
    vehicleAvailable = ${vehicleAvailable},
    vehicleRentPerDay = ${vehicleRentPerDay},
    vehicleRentPerMonth = ${vehicleRentPerMonth}

    WHERE id = "${vehicleId}"
    AND countryId = "${countryId}"
    AND cityId = "${cityId}"
    AND companyId = "${companyId}"
    ;`;

  let whenStatement = "";
  let inStatement = "";
  for (let img of images) {
    whenStatement += `WHEN ${img.id} THEN "${img.url}" `;
    inStatement += `, ${img.id}`;
  }
  inStatement = inStatement.replace(",", "");

  const query2 = `UPDATE images SET
    url = (
    CASE id 
    ${whenStatement}
    END) 
    WHERE id IN(${inStatement})
    ;`;

  const queries = [query1, query2];


  return updateTransaction({ res, queries });
});

router.route("/:vehicleId").delete(authMiddleware, (req, res) => {
  const { vehicleId } = req.params;

  const InvalidRequest = NotFound(res);
  const onSuccess = Then(res);
  const onError = Catch(res);

  const id = req.header("x-api-key");

  const query1 = `SELECT id, url FROM images WHERE vehicleId = ${vehicleId}`;
  const query2 = `DELETE FROM vehicles WHERE id = ${vehicleId}`;

  return db.beginTransaction((err) => {
    if (err) return onError(err);

    return db.query(query1, (err, response) => {
      if (err) {
        db.rollback();
        return onError(err);
      }

      const valid = response.every(
        (img: any) => refFromUrl(img.url).split("/")[1] === id
      );

      if (!valid) {
        db.rollback();
        return InvalidRequest([]);
      }

      return db.query(query2, (er, result) => {
        if (er) {
          db.rollback();
          return onError(er);
        }

        const promises: Promise<any>[] = [];

        response.forEach((img: any) => {
          const ref = refFromUrl(img.url);
          promises.push(
            new Promise((resolve, reject) => {
              admin
                .storage()
                .bucket()
                .file(ref)
                .delete()
                .then(() => {
                  resolve(true);
                })
                .catch(() => {
                  reject(false);
                });
            })
          );
        });

        return Promise.all(promises)
          .then((result) => {
            db.commit();
            console.log("Success Baby");
            return onSuccess(result);
          })
          .catch((err) => {
            console.log({ error4: err });

            db.rollback();
            return onError(err);
          });
      });
    });
  });
});

router
  .route("/:countryId/:cityId/:companyId")
  .post(authMiddleware, (req, res) => {
    const { countryId, cityId, companyId } = req.params;
    const { vehicle } = req.body;
    const InvalidRequest = NotFound(res);
    const onSuccess = Then(res);
    const onError = Catch(res);

    const {
      title,
      model,
      vehicleAvailable,
      vehicleRentPerDay,
      vehicleRentPerMonth,
      driverAvailable,
      driverRentPerDay,
      driverRentPerMonth,
      insuranceAvailable,
      insuranceRentPerDay,
      insuranceRentPerMonth,
      images,
    } = vehicle;

    const validate = [
      typeof driverAvailable === "boolean",
      Boolean(driverRentPerDay),
      Boolean(driverRentPerMonth),
      typeof insuranceAvailable === "boolean",
      Boolean(insuranceRentPerDay),
      Boolean(insuranceRentPerMonth),
      Boolean(model),
      Boolean(title),
      typeof vehicleAvailable === "boolean",
      Boolean(vehicleRentPerDay),
      Boolean(vehicleRentPerMonth),

      Boolean(countryId),
      Boolean(cityId),
      Boolean(companyId),

      images?.length === 3,
    ];

    if (!validate.every((item) => item === true)) {
      return InvalidRequest([]);
    }

    if (!images.every((img: any) => Boolean(img.url) === true)) {
      return InvalidRequest([]);
    }

    const query1 = `INSERT INTO vehicles 
    (countryId, cityId, companyId, title, model, vehicleAvailable, vehicleRentPerDay, vehicleRentPerMonth, driverAvailable, driverRentPerDay, driverRentPerMonth, insuranceAvailable, insuranceRentPerDay, insuranceRentPerMonth)
    VALUES
    ("${countryId}", "${cityId}", "${companyId}", "${title}", ${model}, ${vehicleAvailable}, ${vehicleRentPerDay}, ${vehicleRentPerMonth}, ${driverAvailable}, ${driverRentPerDay}, ${driverRentPerMonth}, ${insuranceAvailable}, ${insuranceRentPerDay}, ${insuranceRentPerMonth})
    ;`;

    return db.beginTransaction((err) => {
      if (err) return InvalidRequest([]);

      db.query(query1, (err, response) => {
        if (err) {
          console.log(err);
          db.rollback();
          return onError(err);
        }

        const query2 = `
          INSERT INTO images 
          (vehicleId, url)
          VALUES
          (${response.insertId}, "${images[0].url}"),
          (${response.insertId}, "${images[1].url}"),
          (${response.insertId}, "${images[2].url}")
        `;

        db.query(query2, (err, result) => {
          if (err) {
            console.log(err);
            db.rollback();
            return onError(err);
          }

          db.commit();
          return onSuccess(result);
        });
      });
    });
  });


export default router;