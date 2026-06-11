import express, { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { httpLogger } from "./shared/middlewares/logger.middleware.js";
import { errorHandler } from "./shared/errors/errorHandler.js";
import productRoute from "./modules/product/product.route.js";
import customerRoute from "./modules/customer/customer.route.js";
import companyRoute from "./modules/company/company.route.js";
import quotationRoute from "./modules/quotation/quotation.route.js";
import uploadRoute from "./modules/upload/upload.route.js";
import dispatchAddressRoute from "./modules/dispatchAddress/dispatchAddress.route.js";
import authRoute from "./modules/auth/auth.route.js";
import userRoute from "./modules/user/user.route.js";
import bankRoute from "./modules/bank/bank.route.js";


export class App {
    private app: Application;
    constructor() {
        this.app = express();
        this.app.set("trust proxy", 1);
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    private setupMiddleware() {
        const corsOption = {
            origin: ["http://localhost:5173"],
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            credentials: true,
        };

        this.app.use(helmet());
        this.app.use(cors(corsOption));
        this.app.use(httpLogger);
        this.app.use(express.json());
        this.app.use(cookieParser());
        this.app.use(express.urlencoded({ extended: true }))
    }

    private setupRoutes() {
        // health route
        this.app.get("/health", (_req, res) => {
            res.status(200).json({ message: "Nero Backend is Live" })
        })

        const prefix = "/api/v1"

        // global ratelimit (TODO)

        // register routes

        this.app.use(`${prefix}/auth`, authRoute)
        this.app.use(`${prefix}/user`, userRoute)
        this.app.use(`${prefix}/company`, companyRoute)
        this.app.use(`${prefix}/bank`, bankRoute)
        this.app.use(`${prefix}/product`, productRoute)
        this.app.use(`${prefix}/customer`, customerRoute)
        this.app.use(`${prefix}/dispatchAddress`, dispatchAddressRoute)
        this.app.use(`${prefix}/quotation`, quotationRoute)
        this.app.use(`${prefix}/upload`, uploadRoute)
    }

    private setupErrorHandling() {
        this.app.use(errorHandler)
    }

    public getApp() {
        return this.app;
    }

}

export default App;