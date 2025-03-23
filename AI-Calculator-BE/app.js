import express from 'express';
import cors from 'cors';
const app = express();
import Router from './routes/aiRoutes.js';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({
    origin: process.env.ENV == "dev" ? process.env.CORS_ORIGIN_DEV : process.env.CORS_ORIGIN_PROD,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
app.options('*', cors());
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', process.env.ENV == "dev" ? process.env.CORS_ORIGIN_DEV : process.env.CORS_ORIGIN_PROD);
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.send();
});


app.use("/", Router);



export default app;