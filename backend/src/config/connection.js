import { Sequelize, QueryTypes, DataTypes } from 'sequelize';

const environment = process.env.DEPLOYMENT;
const prodEnvironmentList = ["prod", "master", "production"];
const CURRENT_LAMBDA_FUNCTION_TIMEOUT = 60;
const Op = Sequelize.Op;
const operatorsAliases = {
  $or   : Op.or,
  $eq   : Op.eq,
  $lt   : Op.lt,
  $gt   : Op.gt,
  $lte  : Op.lte,
  $gte  : Op.gte,
  $ne   : Op.ne,
  $like : Op.like,
  $not  : Op.not,
  $in   : Op.in,
  $nin  : Op.nin
}
// uncomment for prod

 let host= process.env.DB_HOST
 let user= process.env.DB_USER
 let password= process.env.DB_PASS
 let database= process.env.DB_NAME
 let port= process.env.DB_PORT

// uncomment for local

/*let host= 'localhost'
let user= 'root'
let password= 'Admin@123'
let database= 'windeep_finance'
let port= 3306*/

let params = {
  host: host,
  dialect: 'mysql',
  port: port,
  define: {
    timestamps: false,
    freezeTableName: true // Combine these into one 'define' object
  },
  pool: {
      max: 10,
      min: 0,
      idle: 0,
      acquire: 10000,
      evict: CURRENT_LAMBDA_FUNCTION_TIMEOUT
  },
  operatorsAliases: operatorsAliases,
  logging: prodEnvironmentList.includes(environment) ? false : console.log
}

console.log(JSON.stringify({ file: 'SequelizeWriteConnection.js', line: 55, environment, database, user, password, host, params }));

const sequelize = new Sequelize(database, user, password, params); // Pass the 'params' object here

export {
  sequelize,
  QueryTypes,
  Sequelize,
  DataTypes
};