import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //  get user detail from frontend
  // validate-not empty
  // check user is already exists or not
  // check for images ,check for avatar
  // upload then cloudinary
  // create user object -create entry in db
  // remove password and refresh token feild from response
  // check for user creation
  // return res
  const { fullName, email, username, password } = req.body;
  console.log(email, password);

  if (
    [fullName, email, username, password].some((field) => field?.trim() == "")
  ) {
    throw new ApiError(404, "All field are required");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  console.log(user);
  if (existedUser) {
    throw ApiError(409, "User with email or usernaem is already exists");
  }
  //  this file is still on serner not on cloudinary
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.cover[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required.");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required.");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    email,
    coverImage: coverImage?.url || "",
    password,             
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
  if (createdUser) {
    throw new ApiError(500,"somthing went wrong while registring user..")
  }

  return res.status(201).json(
    new ApiResponse(200,createdUser,"UserRegister successfully")
  )

  // ApiResponse()

});

export { registerUser };
