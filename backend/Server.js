import express from 'express';
import cors from 'cors';
// import memberRoutes from './routes/memberRoutes.js';
// import adminLoginRouter from './routes/adminLoginRouter.js';
// import memeberShareRouter from './routes/memeberShareRouter.js';
// import memberTransactionsRouter from './routes/memberTransactionsRouter.js';
// import requestLoan from './routes/requestLoan.js';
// import memberdetails from './routes/memberDetailsRoutes.js';

const PORT = 9000;
const app = express();

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

// // Apply CORS to preflight (OPTIONS) requests as well
// app.options('*', cors(corsOptions));

// // Middleware to log incoming requests (for debugging)
app.use((req, res, next) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    next();
});

// // Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// // Route handling
// // app.use("/member", memberRoutes);
// // app.use("/admin/login", adminLoginRouter);
// // app.use("/member/shares", memeberShareRouter);
// // app.use("/member/loan", memberTransactionsRouter);
// // app.use("/member/requestLoan", requestLoan);
// // app.use("/member/memberdetails", memberdetails);

// // Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`Server running on port ${PORT}`);
});
