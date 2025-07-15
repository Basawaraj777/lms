import { reuireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { S3 } from "@/lib/S3Client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// const aj = arcjet
//   .withRule(
//     detectBot({
//       mode: "LIVE",
//       allow: [],
//     })
//   )
//   .withRule(
//     fixedWindow({
//       mode: "LIVE",
//       window: "1m",
//       max: 5,
//     })
//   );

export async function DELETE(req: Request) {
  const session = await reuireAdmin();
  try {
    // const decision = await aj.protect(req, {
    //   fingerprint: session?.user.id as string,
    // });

    // if (decision.isDenied()) {
    //   return NextResponse.json({ error: "Go get a job bro" }, { status: 429 });
    // }
    if (session.user.role != "admin") {
      return NextResponse.json({ error: "Go get a job bro" }, { status: 429 });
    }
    const body = await req.json();
    const key = body.key;

    if (!key) {
      return NextResponse.json(
        { error: "Missing or invalid object key" },
        { status: 400 }
      );
    }

    const command = new DeleteObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      Key: key,
    });

    await S3.send(command);
    return NextResponse.json(
      { message: "File deleted sunccefully" },
      { status: 200 }
    );
  } catch (error) {
    {
      error: "Missing or invalid object key";
    }
    {
      status: 400;
    }
  }
}
