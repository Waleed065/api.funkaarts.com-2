import express from "express";
import admin from "firebase-admin";

import cors from "cors";
import { db } from "./mysql/connection";

import destinations from "./routes/destinations";
import companies from "./routes/companies";
import vehicles from "./routes/vehicles";
import vehicle from "./routes/vehicle";
import paras from "./routes/paras";
import contactUs from "./routes/contactUs";
import search from "./routes/search";

admin.initializeApp({
  credential: admin.credential.cert(require("../adminSdk.json")),
  storageBucket: "",
});

const whiteList = [
  "http://localhost:3000",
  "https://example.com"
];
const corsOptions = {
  origin: whiteList,
  optionsSuccessStatus: 200 
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());


app.use("/search", search);
app.use("/destinations", destinations);
app.use("/companies", companies);
app.use("/vehicles", vehicles);
app.use("/vehicle", vehicle);
app.use("/paras", paras);
app.use("/contact-us", contactUs);

const port = process.env.PORT ?? 4000;

db.connect((err) => {
  if (err) throw err;
  app.listen(port, () => console.log(`Server running on port ${port}`));
});
