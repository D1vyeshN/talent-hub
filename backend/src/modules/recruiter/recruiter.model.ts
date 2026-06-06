import { Schema } from "mongoose";
import { User } from "../users/user.model";

const RecruiterSchema = new Schema({
  company:     { type: String, default: "" },
  companyId:   { type: Schema.Types.ObjectId, ref: "Company", default: null },
  designation: { type: String, default: "" },
  postedJobs:  [{ type: Schema.Types.ObjectId, ref: "Job" }],
});

export const Recruiter = User.discriminator("recruiter", RecruiterSchema);