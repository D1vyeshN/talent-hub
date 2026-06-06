import { Schema } from "mongoose";
import { User } from "../users/user.model";

const AdminSchema = new Schema({
  permissions: {
    type: [String],
    default: ["manage_users", "manage_jobs", "manage_companies", "view_analytics"],
  },
});

export const Admin = User.discriminator("admin", AdminSchema);