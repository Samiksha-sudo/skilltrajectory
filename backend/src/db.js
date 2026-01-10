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

export const Test = sequelize.define("Test", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  duration_minutes: { type: DataTypes.INTEGER, allowNull: false },
  section_config_json: { type: DataTypes.JSON, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { tableName: "tests", timestamps: false });

export const Question = sequelize.define("Question", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  section: { type: DataTypes.STRING(50), allowNull: false },
  topic_tag: { type: DataTypes.STRING(80), allowNull: false },
  difficulty: { type: DataTypes.STRING(20), allowNull: false },
  question_text: { type: DataTypes.TEXT, allowNull: false },
  options_json: { type: DataTypes.JSON, allowNull: false },
  correct_option: { type: DataTypes.STRING(10), allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  created_at: { type: DataTypes.DATE, allowNull: false },
}, { tableName: "questions", timestamps: false });

export const Attempt = sequelize.define("Attempt", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  test_id: { type: DataTypes.INTEGER, allowNull: false },
  started_at: { type: DataTypes.DATE, allowNull: false },
  submitted_at: { type: DataTypes.DATE, allowNull: true },
  total_time_sec: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.ENUM("STARTED", "SUBMITTED"), allowNull: false, defaultValue: "STARTED" },
}, { tableName: "attempts", timestamps: false });

export const AttemptScore = sequelize.define("AttemptScore", {
  attempt_id: { type: DataTypes.INTEGER, primaryKey: true },
  total_score: { type: DataTypes.INTEGER, allowNull: true },
  max_score: { type: DataTypes.INTEGER, allowNull: true },
  accuracy_pct: { type: DataTypes.DECIMAL(5,2), allowNull: true },
  avg_time_per_q: { type: DataTypes.DECIMAL(10,2), allowNull: true },
  section_scores_json: { type: DataTypes.JSON, allowNull: true },
  computed_at: { type: DataTypes.DATE, allowNull: true },
}, { tableName: "attempt_scores", timestamps: false });

export const ReadinessResult = sequelize.define("ReadinessResult", {
  attempt_id: { type: DataTypes.INTEGER, primaryKey: true },
  readiness_level: { type: DataTypes.STRING(30), allowNull: true },
  confidence_score: { type: DataTypes.DECIMAL(5,2), allowNull: true },
  explanation_json: { type: DataTypes.JSON, allowNull: true },
  computed_at: { type: DataTypes.DATE, allowNull: true },
}, { tableName: "readiness_results", timestamps: false });

export const AttemptAnswer = sequelize.define("AttemptAnswer", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  attempt_id: { type: DataTypes.INTEGER, allowNull: false },
  question_id: { type: DataTypes.INTEGER, allowNull: false },
  selected_option: { type: DataTypes.STRING(10), allowNull: true },
  is_correct: { type: DataTypes.BOOLEAN, allowNull: true },
  time_spent_sec: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: "attempt_answers", timestamps: false });
