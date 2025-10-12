import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";
import { ValidationError } from "../utils/error";

export const validation = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = {
      ...req.body,
      ...req.params,
      ...req.query,
      files:req.files,
      ...req.file
    };

    const result = schema.safeParse(data);

    if (!result.success) {
    const errors = result.error.issues.map((error) => {
        return `${error.path} => ${error.message}\n`
    })

    throw new ValidationError(errors.join(','))
    }


    
    return next();
  };
};
