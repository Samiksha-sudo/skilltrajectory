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

export const UserProfile = sequelize.define(
  "UserProfile",
  {
    user_id: { type: DataTypes.INTEGER, primaryKey: true },
    target_role: { type: DataTypes.STRING(100), allowNull: false },
    experience_level: {
      type: DataTypes.ENUM("BEGINNER", "INTERMEDIATE", "ADVANCED"),
      allowNull: false,
    },
    daily_study_minutes: { type: DataTypes.INTEGER, allowNull: true },
    updated_at: { type: DataTypes.DATE, allowNull: false },
  },
  { tableName: "user_profile", timestamps: false }
);


export async function dbConnect() {
  await sequelize.authenticate();
  console.log("DB connected");
}
