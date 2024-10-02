import express from 'express'
const Router = express.Router();

import { 
    postCalculate,
    getHealth
} from "../controllers/aiController.js"

Router.post("/calculate",postCalculate)
Router.get("/health",getHealth);


export default Router;