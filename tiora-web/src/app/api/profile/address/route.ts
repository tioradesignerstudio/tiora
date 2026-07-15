import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getVerifiedEmailFromCookie } from "@/db/auth-helper";

// Helper: get user by email from cookie
async function getUserFromCookie() {
  const email = await getVerifiedEmailFromCookie("auth_session");
  if (!email) return { user: null, email: null };

  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return { user: rows[0] ?? null, email };
}

// Helper: parse stored address field → string[]
function parseAddresses(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [raw];
  } catch {
    return [raw];
  }
}

export async function GET() {
  try {
    const { user } = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const addresses = parseAddresses(user.address);
    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error("Address GET Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { address } = await req.json();
    const { user, email } = await getUserFromCookie();

    if (!user || !email) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const addresses = parseAddresses(user.address);
    if (!addresses.includes(address)) {
      addresses.push(address);
    }

    await db.update(users)
      .set({ address: JSON.stringify(addresses) })
      .where(eq(users.email, email));

    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error("Address POST Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { address } = await req.json();
    const { user, email } = await getUserFromCookie();

    if (!user || !email) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const addresses = parseAddresses(user.address).filter((a) => a !== address);

    await db.update(users)
      .set({ address: addresses.length > 0 ? JSON.stringify(addresses) : null })
      .where(eq(users.email, email));

    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error("Address DELETE Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
