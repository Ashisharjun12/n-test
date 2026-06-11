import { RequestHandler } from "express";
import { z } from "zod";
import { ApiError } from "../errors/apiError.js";

type validateTarget = 'body' | 'query' | 'params'

export const validate = (schema: z.ZodSchema, target: validateTarget = 'body'): RequestHandler => (req, _res, next) => {

    const result = schema.safeParse(req[target])

    if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message
        }))
        throw ApiError.badRequest("Validation Failed", errors)

    }

    Object.assign(req[target] as object, result.data);
    next();


}