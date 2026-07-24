import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  try {
    const session = await requireAdminSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json(
        { error: "كلمة المرور الحالية والجديدة مطلوبتان." },
        { status: 400 }
      );
    }

    if (body.newPassword.length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور الجديدة يجب ان تكون 6 احرف على الاقل." },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { id: session.user.id },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "المستخدم غير موجود." },
        { status: 404 }
      );
    }

    const isCurrentValid = await bcrypt.compare(
      body.currentPassword,
      admin.passwordHash
    );

    if (!isCurrentValid) {
      return NextResponse.json(
        { error: "كلمة المرور الحالية غير صحيحة." },
        { status: 400 }
      );
    }

    const newHash = await bcrypt.hash(body.newPassword, 12);

    await prisma.admin.update({
      where: { id: session.user.id },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ message: "تم تغيير كلمة المرور بنجاح." });
  } catch (error) {
    console.error("POST /api/settings/change-password failed:", error);
    return NextResponse.json(
      { error: "Failed to change password." },
      { status: 500 }
    );
  }
}
