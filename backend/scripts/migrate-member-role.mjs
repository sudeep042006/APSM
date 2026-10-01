// One-off data migration: drop the legacy "member" role.
//
// The product has exactly two roles — admin and creator. Older rows were
// written with "member", which is not a valid enum value, so any `user.save()`
// (for example persisting a refreshed OAuth token) failed validation and the
// API answered 400. Both accounts affected are dashboard users with linked
// social accounts, so they become admins.
//
// Run once:  node scripts/migrate-member-role.mjs
import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../modules/auth/auth.model.js";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const stale = await User.find({ role: { $in: ["member", null] } }).select("email role");

  if (stale.length === 0) {
    console.log("Nothing to migrate.");
  } else {
    for (const u of stale) {
      console.log(`  ${u.email}: "${u.role ?? "(undefined)"}" -> "admin"`);
    }
    // updateMany bypasses document validation, which is the point: these rows
    // cannot be saved through the model until the value is legal.
    const res = await User.updateMany(
      { role: { $in: ["member", null] } },
      { $set: { role: "admin" } }
    );
    console.log(`Migrated ${res.modifiedCount} account(s).`);
  }

  const counts = await User.aggregate([{ $group: { _id: "$role", n: { $sum: 1 } } }]);
  console.log("Roles now:", JSON.stringify(counts));

  await mongoose.disconnect();
};

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err.message);
    process.exit(1);
  });