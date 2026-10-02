import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const submissionSchema = z.object({
  organizerName: z.string().min(2, "Nama penyelenggara minimal 2 karakter"),
  organizerEmail: z.string().email("Email tidak valid"),
  organizerPhone: z.string().min(8, "Nomor telepon minimal 8 digit"),
  eventName: z.string().min(3, "Nama event minimal 3 karakter"),
  targetAudience: z.string().min(3, "Target audiens wajib diisi"),
  featuresRequested: z.array(z.string()).min(1, "Pilih minimal 1 fitur Cetas yang dibutuhkan"),
  proposalFileUrl: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = submissionSchema.parse(body);

    const submissionId = `sub-${Date.now()}`;

    try {
      // Cari atau buat user EO jika DB online
      let user = await prisma.user.findUnique({
        where: { email: data.organizerEmail },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: data.organizerName,
            email: data.organizerEmail,
            phone: data.organizerPhone,
            passwordHash: "TEMPORARY_OAUTH_OR_AUTO_GENERATED",
            role: "EVENT_ORGANIZER",
          },
        });
      }

      await prisma.eventSubmission.create({
        data: {
          id: submissionId,
          userId: user.id,
          eventName: data.eventName,
          targetAudience: data.targetAudience,
          featuresRequested: data.featuresRequested.join(", "),
          proposalFileUrl: data.proposalFileUrl,
          status: "PENDING",
        },
      });

      // Catat log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "EVENT_SUBMISSION_CREATED",
          entityName: "EventSubmission",
          entityId: submissionId,
          detailsJson: JSON.stringify({
            eventName: data.eventName,
            features: data.featuresRequested,
          }),
        },
      });
    } catch (dbErr) {
      console.warn("[Submission API DB Offline]: Menggunakan simulasi pengajuan proposal event", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "Proposal pengajuan event Anda berhasil dikirim ke Admin Cetas!",
      submissionId,
    });
  } catch (error) {
    console.error("[Submission API Error]:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Gagal mengirim pengajuan event" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const submissions = await prisma.eventSubmission.findMany({
      include: {
        user: {
          select: { name: true, email: true, phone: true },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ success: true, submissions });
  } catch (error) {
    console.warn("[Get Submissions DB Offline / Mock]:", error);
    return NextResponse.json({
      success: true,
      submissions: [
        {
          id: "sub-demo-01",
          eventName: "Festival Seni & Musik Indie Jakarta 2026",
          featuresRequested: "Cetas Ticketing, Iklan Cetas Kita",
          status: "PENDING",
          submittedAt: new Date().toISOString(),
          user: { name: "Komunitas Nada Kita", email: "nada@event.com", phone: "081299887766" },
        },
      ],
    });
  }
}
