import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/auth.routes.js';
import { dbConnect } from "./src/db.js";
import cookieParser from "cookie-parser";
import meRoutes from "./src/routes/me.routes.js";
import profileRoutes from "./src/routes/profile.routes.js";
import testRoutes from "./src/routes/test.routes.js";
import attemptRoutes from "./src/routes/attempt.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";
import readinessRoutes from "./src/routes/readiness.routes.js";
import gapsRoutes from "./src/routes/gaps.routes.js";
import planRoutes from "./src/routes/plan.routes.js";
import timeEstimateRoutes from "./src/routes/timeEstimate.routes.js";
import milestonesRoutes from "./src/routes/milestones.routes.js";
import progressRoutes from "./src/routes/progress.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import adminQuestionRoutes from "./src/routes/admin.questions.routes.js";
import adminAnalyticsRoutes from "./src/routes/admin.analytics.routes.js";







const PORT = process.env.PORT;

const app = express();
await dbConnect();
// Define CORS options
const corsOptions = {
    origin: [
        'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Content-Disposition'],
    credentials: true,  // Allow cookies and credentials
    preflightContinue: false,  // If false, CORS preflight requests will end with 204 (no content)
    optionsSuccessStatus: 204  // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Enable CORS globally
app.use(cors(corsOptions));

app.use(cookieParser());


// Apply CORS to preflight (OPTIONS) requests as well
// app.options('*', cors(corsOptions));

// Middleware to log incoming requests (for debugging)
app.use((req, res, next) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    next();
});

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Route handling
app.use("/api/auth", authRoutes);
app.use("/api", meRoutes);
app.use("/api", profileRoutes);
app.use("/api", testRoutes);
app.use("/api", attemptRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", readinessRoutes);
app.use("/api", gapsRoutes);
app.use("/api", planRoutes);
app.use("/api", timeEstimateRoutes);
app.use("/api", milestonesRoutes);
app.use("/api", progressRoutes);
app.use("/api", adminRoutes);
app.use("/api", adminQuestionRoutes);
app.use("/api", adminAnalyticsRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`Server running on port ${PORT}`);
});
