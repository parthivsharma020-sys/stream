import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // file has been uploaded successfull
    // console.log(response,"------response in detatils----");

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the localy saved temporary file as the upload operation got failed
  }
};

export { uploadOnCloudinary };

//upload remote GoogleDrive image and apply auto-tagging
// cloudinary.uploader
//   .upload(
//     "https://drive.google.com/file/d/1gnXAJZh-Of70TzpU1Meja4TAgqc6CVe7/view",
//     {
//       public_id: "bag_model",
//       categorization: "google_tagging",
//       auto_tagging: 0.75,
//     },
//   )
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((error) => {
//     console.log(error);
//   });
