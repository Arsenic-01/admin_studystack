// app/api/admin/stats/teacher-contributions/route.ts

import { fetchTeacherContributions } from "@/lib/actions/AdminFetching.actions";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchTeacherContributions();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching teacher contributions:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher contributions" },
      { status: 500 }
    );
  }
}
