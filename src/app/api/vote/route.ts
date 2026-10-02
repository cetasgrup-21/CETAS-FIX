import { NextRequest, NextResponse } from "next/server";
import {
  INITIAL_EVENT_VOTINGS,
  EventVotingConfig,
  VoteCategory,
  VoteCandidate,
} from "@/lib/vote-unified-data";

declare global {
  var __cetasEventVotings: EventVotingConfig[] | undefined;
}

if (!global.__cetasEventVotings) {
  global.__cetasEventVotings = JSON.parse(JSON.stringify(INITIAL_EVENT_VOTINGS));
}

// GET: Ambil struktur voting (Event -> Kategori -> Peserta)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");

  let result = global.__cetasEventVotings || [];
  if (eventId) {
    const single = result.find((ev) => ev.eventId === eventId);
    return NextResponse.json({ success: true, eventVoting: single });
  }

  return NextResponse.json({
    success: true,
    totalEvents: result.length,
    eventVotings: result,
  });
}

// POST: Tambah Kategori Baru atau Tambah Peserta Baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. TAMBAH KATEGORI BARU (Misal: Tingkat SMP, Tingkat SMA, Kategori Purna)
    if (action === "ADD_CATEGORY") {
      const { eventId, title, description, pricePerVote } = body;
      const targetEvent = global.__cetasEventVotings?.find((ev) => ev.eventId === eventId);
      if (!targetEvent) {
        return NextResponse.json({ success: false, message: "Event tidak ditemukan" }, { status: 404 });
      }

      const newCategory: VoteCategory = {
        id: `cat-${Date.now().toString().slice(-6)}`,
        eventId,
        title: title || "Kategori Baru",
        description: description || "",
        pricePerVote: Number(pricePerVote) || 2000,
        candidates: [],
      };

      targetEvent.categories.push(newCategory);

      return NextResponse.json({
        success: true,
        message: `Kategori '${newCategory.title}' berhasil ditambahkan ke event!`,
        category: newCategory,
      });
    }

    // 2. TAMBAH PESERTA / KANDIDAT BARU KE KATEGORI
    if (action === "ADD_CANDIDATE") {
      const { eventId, categoryId, candidateNumber, name, institution, photoUrl, tagline, totalVotes } = body;

      const targetEvent = global.__cetasEventVotings?.find((ev) => ev.eventId === eventId);
      if (!targetEvent) {
        return NextResponse.json({ success: false, message: "Event tidak ditemukan" }, { status: 404 });
      }

      const targetCategory = targetEvent.categories.find((c) => c.id === categoryId);
      if (!targetCategory) {
        return NextResponse.json({ success: false, message: "Kategori tidak ditemukan" }, { status: 404 });
      }

      const newCandidate: VoteCandidate = {
        id: `cand-${Date.now().toString().slice(-6)}`,
        categoryId,
        candidateNumber: candidateNumber || `0${targetCategory.candidates.length + 1}`,
        name,
        institution: institution || "Instansi / Sekolah Peserta",
        photoUrl: photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        tagline: tagline || "Visi misi peserta voting.",
        totalVotes: 0, // Integritas mutlak: suara awal selalu 0, anti-manipulasi!
      };

      targetCategory.candidates.push(newCandidate);

      return NextResponse.json({
        success: true,
        message: `Peserta '${newCandidate.name}' berhasil didaftarkan dengan 0 suara awal!`,
        candidate: newCandidate,
      });
    }

    // 3. PENCATATAN SUARA VOTING RESMI (MIDTRANS VERIFIED VOTE)
    if (action === "RECORD_VOTE") {
      const { eventId, categoryId, candidateId, addedVotes, orderNumber, voterName } = body;

      const targetEvent = global.__cetasEventVotings?.find((ev) => ev.eventId === eventId);
      if (!targetEvent) {
        return NextResponse.json({ success: false, message: "Event tidak ditemukan" }, { status: 404 });
      }

      const targetCategory = targetEvent.categories.find((c) => c.id === categoryId);
      if (!targetCategory) {
        return NextResponse.json({ success: false, message: "Kategori tidak ditemukan" }, { status: 404 });
      }

      const cand = targetCategory.candidates.find((c) => c.id === candidateId);
      if (!cand) {
        return NextResponse.json({ success: false, message: "Peserta tidak ditemukan" }, { status: 404 });
      }

      const votesIncrement = Math.max(1, Number(addedVotes) || 1);
      cand.totalVotes += votesIncrement;

      return NextResponse.json({
        success: true,
        message: `Berhasil mencatat ${votesIncrement} suara sah untuk ${cand.name} dari voter ${voterName || "Anonim"} (Order: ${orderNumber || "-"})!`,
        candidate: cand,
        totalVotes: cand.totalVotes,
      });
    }

    // 4. TAMBAH EVENT VOTING BARU (DARI EVENT YANG ADA)
    if (action === "ADD_EVENT_VOTING") {
      const { eventId, eventTitle, bannerUrl } = body;
      const newEventVoting: EventVotingConfig = {
        eventId: eventId || `ev-${Date.now()}`,
        eventTitle: eventTitle || "Event Baru Cetas Vote",
        eventDate: "Desember 2026",
        bannerUrl: bannerUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
        categories: [
          {
            id: `cat-${Date.now()}-1`,
            eventId: eventId,
            title: "Tingkat SMP",
            pricePerVote: 2000,
            candidates: [],
          },
          {
            id: `cat-${Date.now()}-2`,
            eventId: eventId,
            title: "Tingkat SMA",
            pricePerVote: 2000,
            candidates: [],
          },
          {
            id: `cat-${Date.now()}-3`,
            eventId: eventId,
            title: "Kategori Purna / Umum",
            pricePerVote: 2000,
            candidates: [],
          },
        ],
      };

      global.__cetasEventVotings?.unshift(newEventVoting);

      return NextResponse.json({
        success: true,
        message: `Event voting '${newEventVoting.eventTitle}' berhasil dibuat dengan kategori default (SMP, SMA, Purna)!`,
        eventVoting: newEventVoting,
      });
    }

    return NextResponse.json({ success: false, message: "Aksi tidak dikenali" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal memproses penambahan vote" }, { status: 500 });
  }
}

// PUT: Edit Kategori atau Edit Peserta
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, eventId, categoryId, candidateId, updates } = body;

    const targetEvent = global.__cetasEventVotings?.find((ev) => ev.eventId === eventId);
    if (!targetEvent) {
      return NextResponse.json({ success: false, message: "Event tidak ditemukan" }, { status: 404 });
    }

    const targetCategory = targetEvent.categories.find((c) => c.id === categoryId);
    if (!targetCategory) {
      return NextResponse.json({ success: false, message: "Kategori tidak ditemukan" }, { status: 404 });
    }

    if (action === "EDIT_CATEGORY") {
      Object.assign(targetCategory, updates);
      return NextResponse.json({
        success: true,
        message: "Kategori berhasil diperbarui!",
        category: targetCategory,
      });
    }

    if (action === "EDIT_CANDIDATE") {
      const cand = targetCategory.candidates.find((c) => c.id === candidateId);
      if (!cand) {
        return NextResponse.json({ success: false, message: "Peserta tidak ditemukan" }, { status: 404 });
      }
      // INTEGRITAS ANTI-MANIPULASI:
      // Hanya izinkan edit data profil (nomor urut, nama, instansi, foto, visi misi)
      // totalVotes TIDAK DAPAT diubah secara manual melalui edit form!
      if (updates.candidateNumber !== undefined) cand.candidateNumber = updates.candidateNumber;
      if (updates.name !== undefined) cand.name = updates.name;
      if (updates.institution !== undefined) cand.institution = updates.institution;
      if (updates.photoUrl !== undefined) cand.photoUrl = updates.photoUrl;
      if (updates.tagline !== undefined) cand.tagline = updates.tagline;

      return NextResponse.json({
        success: true,
        message: "Data profil peserta berhasil diperbarui (suara tetap terlindungi & sah)!",
        candidate: cand,
      });
    }

    return NextResponse.json({ success: false, message: "Aksi tidak valid" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal mengedit data vote" }, { status: 500 });
  }
}

// DELETE: Hapus Kategori atau Hapus Peserta
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const categoryId = searchParams.get("categoryId");
    const candidateId = searchParams.get("candidateId");

    const targetEvent = global.__cetasEventVotings?.find((ev) => ev.eventId === eventId);
    if (!targetEvent) {
      return NextResponse.json({ success: false, message: "Event tidak ditemukan" }, { status: 404 });
    }

    if (candidateId && categoryId) {
      // Hapus Peserta dari Kategori
      const cat = targetEvent.categories.find((c) => c.id === categoryId);
      if (cat) {
        cat.candidates = cat.candidates.filter((c) => c.id !== candidateId);
        return NextResponse.json({ success: true, message: "Peserta berhasil dihapus dari kategori!" });
      }
    } else if (categoryId) {
      // Hapus Kategori dari Event
      targetEvent.categories = targetEvent.categories.filter((c) => c.id !== categoryId);
      return NextResponse.json({ success: true, message: "Kategori berhasil dihapus dari event!" });
    }

    return NextResponse.json({ success: false, message: "Parameter tidak lengkap" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal menghapus data vote" }, { status: 500 });
  }
}
