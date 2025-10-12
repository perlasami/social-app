import multer, { diskStorage, memoryStorage } from "multer";
import type { Request } from "express";
import { ApplicationException } from "../error";

export enum storeIn {
  disk = "disk",
  memory = "memory",
}

export const fileTypes = {
  images: ["image/jpg", "image/png", "image/gif"],
};

export const uploadFiles = ({
  StoreIn = storeIn.memory,
  type = fileTypes.images,
}: {
  StoreIn?: storeIn;
  type?: string[];
}) => {
  const storage =
    StoreIn == storeIn.memory ? memoryStorage() : diskStorage({});

  const fileFilter: multer.Options["fileFilter"] = (
    req: Request,
    file: Express.Multer.File,
    cb: CallableFunction
  ) => {
    if (file.size >= 200 * 1024 * 1024 && StoreIn == storeIn.memory) {
      return cb(new ApplicationException("use disk not memory", 500));
    } else if (!type.includes(file.mimetype)) {
      return cb(new ApplicationException("invalid file type", 409));
    }
    cb(null, true);
  };

  return multer({ storage, fileFilter });
};


