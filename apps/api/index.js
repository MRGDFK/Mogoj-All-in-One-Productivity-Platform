// Vercel entry: the prebuilt bundle (tsup, see vercel.json). Skips Vercel's own TS compile, which ignores our tsconfig.
// Vercel only picks an entry file that imports express, hence the bare import.
import "express";
export { default } from "./dist/app.js";
