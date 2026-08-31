import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
// import { isPasswordCorrect } from "../models/user.model.js";

const genrateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    // console.log(accessToken, refreshToken);

    user.refreshToken = refreshToken;
    // user.save({ validateBeforeSave: false }) is used in Mongoose to save a document without running schema validation.
    await user.save({ validateBeforeSave: false });

    return {
      accessToken,
      refreshToken,
    };
  } catch (err) {
    throw new ApiError(
      500,
      "something went wrong while genarating Access and Refresh Tokens",
      err,
    );
  }
};

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
  // console.log(email, password);

  if (
    // here , we are not use map() because map return new  [treu,false,..] array but some method check if atleast one element satisfy the condition then it's return treu
    [fullName, email, username, password].some((field) => field?.trim() == "")
  ) {
    throw new ApiError(404, "All field are required");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  // console.log(user);
  if (existedUser) {
    throw new ApiError(409, "User with email or usernaem is already exists");
  }
  //  this file is still on serner not on cloudinary

  // console.log(req.files);f
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

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
    "-password -refreshToken",
  );
  if (!createdUser) {
    throw new ApiError(500, "somthing went wrong while registring user..");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Register successfully"));

  // ApiResponse()
});
const loginUser = asyncHandler(async (req, res) => {
  //  req body -> data
  // username or email
  // find the user
  // password check
  // Access and refresh token
  // send cookies (sequare)

  const { email, username, password } = req.body;
  if (!(email && password)) {
    throw new ApiError(404, "username or E-mail is required");
  }
  const user = await User.findOne({ $or: [{ email }, { username }] });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Password is incorrect");
  }
  const { accessToken, refreshToken } = await genrateAccessAndRefreshTokens(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    },
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out successfully"));
});

const refreshAccessToken = asyncHandler(async () => {
  const incommingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incommingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }
  // It does not return null. if token is expired it throw errror
  try {
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "invalid refresh TOKEN");
    }

    if (incommingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired or used..");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { newAccessToken, newRefreshToken } =
      await genrateAccessAndRefreshTokens(user._id);
    // If you don't pass options, the cookies will still be created, but they will use the default cookie settings.
    return res
      .status(200)
      .cookie("accessToken", newAccessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          },
          "access Token refresh",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export { registerUser, loginUser, logoutUser,refreshAccessToken };
