import mysql from "mysql";

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "collegeerp",
    connectionLimit: 10
});

export default pool;
