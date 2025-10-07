import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name:{type: String, required:true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dob: { type: Date, required: true },
  firstName: { type: String },
  lastName: { type: String },
  about: { type: String },
  profileImage: { type: String },
  interests: [{ type: String }],
  socialLinks: {
    facebook: { type: String },
    instagram: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Password Hashing (before save)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password Check Function
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

//Use ESM export
export default User;
