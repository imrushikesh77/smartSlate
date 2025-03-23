import express from 'express';
import cors from 'cors';
const app = express();
import Router from './routes/aiRoutes.js';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "https://smartslate.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
app.options('*', cors());
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', 'https://smartslate.vercel.app');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.send();
});


app.use("/", Router);



export default app;