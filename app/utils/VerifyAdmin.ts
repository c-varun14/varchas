import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const culturalAdmins = ["varun1492006@gmail.com"];

const sportsAdmin = ["varun1492006@gmail.com", "shashanknm9535@gmail.com"];

export const verifyAdmin = async (adminOf: "cultural" | "sports") => {
  const data = await auth.api.getSession({
    headers: await headers(),
  });
  if (!data) return false;
  if (adminOf == "cultural" && culturalAdmins.includes(data.user.email))
    return true;
  if (adminOf == "sports" && sportsAdmin.includes(data.user.email)) return true;
  return false;
};
