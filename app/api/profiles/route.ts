import { createProfile, getProfileByUserId } from "@/db/actions/profiles";
import { stackServerApp } from "@/stack";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if profile already exists
    const existingProfile = await getProfileByUserId(user.id);
    if (existingProfile) {
      return NextResponse.json(
        { profile: existingProfile, message: "Profile already exists" },
        { status: 200 }
      );
    }

    // Create new profile with data from request
    const body = await request.json();
    const profile = await createProfile(user, body);

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }
}
