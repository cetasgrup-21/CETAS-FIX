import { NextRequest, NextResponse } from "next/server";

export interface VoteCandidateRecord {
  id: string;
  number: string;
  name: string;
  major: string;
  photoUrl: string;
  tagline: string;
  votes: number;
}

declare global {
  var __cetasVoteCandidates: VoteCandidateRecord[] | undefined;
}

if (!global.__cetasVoteCandidates) {
  global.__cetasVoteCandidates = [
    {
      id: "cand-01",
      number: "01",
      name: "Nadia Safira",
      major: "Teknik Informatika 2023",
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      tagline: "Inovasi digital untuk pemberdayaan generasi muda kampus.",
      votes: 1482,
    },
    {
      id: "cand-02",
      number: "02",
      name: "Reza Pratama",
      major: "Ilmu Komunikasi 2022",
      photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
      tagline: "Kolaborasi aktif dan kepemimpinan inklusif berkarakter.",
      votes: 1120,
    },
    {
      id: "cand-03",
      number: "03",
      name: "Citra Lestari",
      major: "Desain Komunikasi Visual 2024",
      photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      tagline: "Kreativitas tanpa batas mengangkat budaya Nusantara.",
      votes: 702,
    },
  ];
}

// GET: Ambil daftar kandidat
export async function GET() {
  return NextResponse.json({
    success: true,
    candidates: global.__cetasVoteCandidates,
  });
}

// POST: Tambah kandidat baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.number) {
      return NextResponse.json({ success: false, message: "Nomor dan nama kandidat wajib diisi" }, { status: 400 });
    }

    const newCandidate: VoteCandidateRecord = {
      id: `cand-${Date.now().toString().slice(-5)}`,
      number: body.number,
      name: body.name,
      major: body.major || "Mahasiswa Berprestasi",
      photoUrl: body.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      tagline: body.tagline || "Visi misi kandidat Cetas Vote.",
      votes: Number(body.votes) || 0,
    };

    global.__cetasVoteCandidates?.push(newCandidate);

    return NextResponse.json({
      success: true,
      message: "Kandidat vote baru berhasil ditambahkan!",
      candidate: newCandidate,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal menambah kandidat" }, { status: 500 });
  }
}

// PUT: Edit kandidat
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    const index = global.__cetasVoteCandidates?.findIndex((c) => c.id === id);
    if (index === undefined || index === -1) {
      return NextResponse.json({ success: false, message: "Kandidat tidak ditemukan" }, { status: 404 });
    }

    const existing = global.__cetasVoteCandidates![index];
    const updated: VoteCandidateRecord = {
      ...existing,
      ...updates,
      id: existing.id,
      votes: updates.votes !== undefined ? Number(updates.votes) : existing.votes,
    };

    global.__cetasVoteCandidates![index] = updated;

    return NextResponse.json({
      success: true,
      message: "Data kandidat berhasil diperbarui!",
      candidate: updated,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal mengedit kandidat" }, { status: 500 });
  }
}

// DELETE: Hapus kandidat
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "ID kandidat wajib diisi" }, { status: 400 });
    }

    global.__cetasVoteCandidates = global.__cetasVoteCandidates?.filter((c) => c.id !== id);

    return NextResponse.json({
      success: true,
      message: "Kandidat berhasil dihapus dari sistem",
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal menghapus kandidat" }, { status: 500 });
  }
}
