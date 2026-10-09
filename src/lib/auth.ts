import {
  SignJWT,
  jwtVerify,
  type JWTPayload,
} from "jose";

import { createHash } from "crypto";

import { db } from "@/lib/db";

// ======================================================
// CONFIG
// ======================================================

const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  "dev-only-change-this-secret";

const secret = new TextEncoder().encode(
  AUTH_SECRET
);

const SESSION_DURATION_SECONDS =
  8 * 60 * 60;

// ======================================================
// TYPE
// ======================================================

export type SessionUser = {
  id: string;
  role: string;
  name: string;
};

// ======================================================
// HASH TOKEN
// ======================================================

function hashToken(token: string) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

// ======================================================
// CREATE SESSION TOKEN
// ======================================================

export async function createSessionToken(
  user: SessionUser
) {
  const now = Math.floor(
    Date.now() / 1000
  );

  const expiresAt =
    new Date(
      Date.now() +
        SESSION_DURATION_SECONDS * 1000
    );

  // ====================================================
  // JWT
  // ====================================================

  const token =
    await new SignJWT({
      role: user.role,
      name: user.name,
    })
      .setProtectedHeader({
        alg: "HS256",
      })
      .setSubject(user.id)
      .setIssuedAt(now)
      .setExpirationTime(
        now + SESSION_DURATION_SECONDS
      )
      .sign(secret);

  // ====================================================
  // TOKEN ID
  // ====================================================

  const tokenId =
    hashToken(token);

  // ====================================================
  // HAPUS SESSION LAMA USER
  // ====================================================

  await db.session.deleteMany({
    where: {
      userId: user.id,
    },
  });

  // ====================================================
  // SIMPAN SESSION BARU
  // ====================================================

  await db.session.create({
    data: {
      userId: user.id,
      tokenId,
      expiresAt,
    },
  });

  return token;
}

// ======================================================
// VERIFY SESSION TOKEN
// ======================================================

export async function verifySessionToken(
  token: string
) {
  if (!token) {
    throw new Error(
      "NO_SESSION_TOKEN"
    );
  }

  // ====================================================
  // 1. VERIFY JWT
  // ====================================================

  let payload: JWTPayload;

  try {
    const result =
      await jwtVerify(
        token,
        secret
      );

    payload = result.payload;
  } catch (error) {
    console.error(
      "JWT VERIFY ERROR:",
      error
    );

    throw new Error(
      "JWT_INVALID_OR_EXPIRED"
    );
  }

  // ====================================================
  // 2. AMBIL USER ID
  // ====================================================

  const userId =
    String(payload.sub || "");

  const role =
    String(payload.role || "");

  const name =
    String(payload.name || "");

  if (!userId) {
    throw new Error(
      "SESSION_USER_ID_MISSING"
    );
  }

  // ====================================================
  // 3. HASH TOKEN
  // ====================================================

  const tokenId =
    hashToken(token);

  // ====================================================
  // 4. CARI SESSION DB
  // ====================================================

  let session;

  try {
    session =
      await db.session.findUnique({
        where: {
          tokenId,
        },
      });
  } catch (error) {
    console.error(
      "SESSION DATABASE ERROR:",
      error
    );

    throw new Error(
      "SESSION_DATABASE_ERROR"
    );
  }

  // ====================================================
  // 5. SESSION TIDAK ADA
  // ====================================================

  if (!session) {
    throw new Error(
      "SESSION_NOT_FOUND"
    );
  }

  // ====================================================
  // 6. SESSION MILIK USER YANG BENAR
  // ====================================================

  if (
    session.userId !== userId
  ) {
    throw new Error(
      "SESSION_USER_MISMATCH"
    );
  }

  // ====================================================
  // 7. CEK EXPIRED DATABASE
  // ====================================================

  if (
    session.expiresAt.getTime() <=
    Date.now()
  ) {
    await db.session
      .delete({
        where: {
          id: session.id,
        },
      })
      .catch(() => {});

    throw new Error(
      "SESSION_EXPIRED"
    );
  }

  // ====================================================
  // 8. VALID
  // ====================================================

  return {
    userId,
    role,
    name,
  };
}

// ======================================================
// DELETE SESSION
// ======================================================

export async function deleteSession(
  token: string
) {
  if (!token) {
    return;
  }

  const tokenId =
    hashToken(token);

  await db.session.deleteMany({
    where: {
      tokenId,
    },
  });
}

// ======================================================
// DELETE ALL USER SESSIONS
// ======================================================

export async function deleteAllUserSessions(
  userId: string
) {
  await db.session.deleteMany({
    where: {
      userId,
    },
  });
}

// ======================================================
// CLEANUP EXPIRED SESSIONS
// ======================================================

export async function cleanupExpiredSessions() {
  await db.session.deleteMany({
    where: {
      expiresAt: {
        lte: new Date(),
      },
    },
  });
}