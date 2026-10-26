import { NextResponse } from "next/server";
import { getUserTagFromCookie } from "@/lib/cookies";

export async function GET(request: Request) {
  const myTag = await getUserTagFromCookie();

  if (!myTag) {
    return NextResponse.json({
      "[ERRO]": "Não está logado",
    });
  }

  return NextResponse.json({
    tag: myTag,
  });
}
