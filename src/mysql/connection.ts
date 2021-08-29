import dotenv from 'dotenv';
import mysql from "mysql";

dotenv.config();




export const db = mysql.createConnection({
  host: '',
  port: 0,

  user: '',
  password: '',
  database: '',
});