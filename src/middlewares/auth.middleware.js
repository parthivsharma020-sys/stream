import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// when res object not used then we replace with "_"
export const verifyJwt = asyncHandler(async (req, _, next) => {
  //    here we use cookies?. bcauz if this application on mobile then accesstoken not in cookie ,cookies in req header
 try {
   const token =
     req.cookies?.accessToken ||
     req.header("Authorization")?.replace("Bearer ", "");
 
   if (!token) {
     throw new ApiError(401, "Unauthorized request");
   }
 
   const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
   const user = await User.findById(decodedToken?._id).select(
     "-password -refreshToken",
   );
   if (!user) {
     // next:  about frontend
     throw new ApiError(401, "invalid Access Token");
   }
   req.user = user;
   next(); 
 } catch (error) {
  throw new ApiError(401,error?.message || "invalid access token")
 }
});
