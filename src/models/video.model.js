import mongoose ,{ Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    videoFile: {
        type: String, // URL of the video file cloudinary
        required: true
    },
    thumbnail: {
        type: String, // URL of the thumbnail image cloudinary
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // Duration of the video in seconds
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    
},{
    timestamps: true,
})

videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video", videoSchema);