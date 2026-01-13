import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";
require("dotenv").config();

interface IComment extends Document {
  user: IUser;
  questions: string;
  questionsReplies?: IComment[];
}

// interface IReviewReplies extends Document {
//   user: IUser;
//   questionsReplies?: IReviewReplies[];
// }

interface IReview extends Document {
  user: IUser;
  rating: number;
  comment: string;
reviewReplies?: IComment[];

// reviewReplies?: IReviewReplies[];
}

interface ILink extends Document {
  title: string;
  url: string;
}

interface ICourseData extends Document {
  title: string;
  description: string;
  videoUrl: string;
  videoThumbnail: object;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: ILink[];
  suggestion: string;
  questions: IComment[];
}

interface ICourse extends Document {
  name: string;
  description: string;
  price: number;
  estimatedPrice?: number;
  thumbnail: object;
  tags: string;
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  prerequistes: { title: string }[];
  reviews: IReview[];
  courseData: ICourseData[];
  rating?: number;
  purchased?: number;
}

const reviewSchema = new Schema<IReview>({
  user: Object,
  rating: {
    type: Number,
    default: 0,
  },
  comment: String,
});

const linkSchema = new Schema<ILink>({
  title: String,
  url: String,
});

const commentSchema = new Schema<IComment>({
  user: Object,
  questions: String,
  questionsReplies: [Object],
});

const courseDataSchema: Schema<ICourseData> = new mongoose.Schema({
  title: String,
  description: String,
  videoSection: String,
  videoLength: Number,
  videoPlayer: String,
  videoUrl: String,
  links: [linkSchema],
  suggestion: String,
  questions: [commentSchema],
});

const courseSchema: Schema<ICourse> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    estimatedPrice: {
      type: Number,
    },
    thumbnail: {
      public_id: {
        required: true,
        type: String,
      },
      url: {
        required: true,
        type: String,
      },
    },
    tags: {
      required: true,
      type: String,
    },
    level: {
      required: true,
      type: String,
    },
    demoUrl: {
      required: true,
      type: String,
    },
    benefits: [{ title: String }],
    prerequistes: [{ title: String }],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    rating: {
      default: 0,
      type: Number,
    },
    purchased: {
      default: 0,
      type: Number,
    },
  },
  { timestamps: true }
);
const CourseModel: Model<ICourse> = mongoose.model("Course", courseSchema);
export default CourseModel;
