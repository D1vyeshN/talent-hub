import { Request, Response } from "express";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json(new ApiResponse(400, null, "No file uploaded"));
    return;
  }

  const result = await uploadToCloudinary(req.file, "company-logos");
  res.json(new ApiResponse(200, result, "Image uploaded successfully"));
});
