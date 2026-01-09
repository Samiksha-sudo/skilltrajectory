import dotenv from "dotenv";
import { Sequelize, DataTypes } from "./config/connection.js";

dotenv.config();

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "mysql",
  logging: false,
});

// Define User model (matches users table)
export const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.ENUM("USER", "ADMIN"), allowNull: false, defaultValue: "USER" },
    created_at: { type: DataTypes.DATE, allowNull: false },
  },
  { tableName: "users", timestamps: false }
);

export async function dbConnect() {
  await sequelize.authenticate();
  console.log("DB connected");
}
