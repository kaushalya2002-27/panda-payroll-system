import { z } from "zod";
import axios from "axios";

export const departmentSchema = z.object({
  id: z.number(),
  name: z.string(),
  active_employees_count: z.number().optional(),
});

export type departmentSchema = z.infer<typeof departmentSchema>;

// Fetch departments from the Payroll System's "Departments & Positions" module
export async function fetchDepartmentData() {
  const res = await axios.get("/api/payroll/departments");
  return res.data;
}