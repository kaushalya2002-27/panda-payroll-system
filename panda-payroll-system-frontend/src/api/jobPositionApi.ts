import { z } from "zod";
import axios from "axios";

export const jobPositionSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type jobPositionSchema = z.infer<typeof jobPositionSchema>;

// Fetch job positions from the Payroll System's "Departments & Positions" module
export async function fetchJobPositionData() {
  const res = await axios.get("/api/payroll/job-positions");
  return res.data;
}