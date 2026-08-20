import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import type { RegisterInput, LoginInput, UpdateProfileInput } from "@mogoj/shared";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";
import {
  signAccessToken,
  generateOpaqueToken,
  hashToken,
} from "../../utils/generateToken.js";
import { env } from "../../config/env.js";
import { toJsonInput } from "../../utils/prismaJson.js";

const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  preferences: true,
  createdAt: true,
  updatedAt: true,
} as const;

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
}

async function issueTokens(userId: string): Promise<IssuedTokens> {
  const accessToken = signAccessToken(userId);
  const refreshToken = generateOpaqueToken();
  const csrfToken = crypto.randomBytes(24).toString("hex");

  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    },
  });

  return { accessToken, refreshToken, csrfToken };
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash },
    select: PUBLIC_USER_SELECT,
  });

  const tokens = await issueTokens(user.id);
  return { user, tokens };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const tokens = await issueTokens(user.id);
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return { user: publicUser, tokens };
}

export async function refreshTokens(rawRefreshToken: string): Promise<{ userId: string } & IssuedTokens> {
  const tokenHash = hashToken(rawRefreshToken);
  const existing = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!existing || existing.revokedAt || existing.expiresAt < new Date()) {
    // Reuse of an already-rotated/expired token: treat as a possible theft
    // and revoke every outstanding token for that user if we can identify one.
    if (existing?.userId) {
      await prisma.refreshToken.updateMany({
        where: { userId: existing.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    throw ApiError.unauthorized("Invalid refresh token");
  }

  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revokedAt: new Date() },
  });

  const tokens = await issueTokens(existing.userId);
  return { userId: existing.userId, ...tokens };
}

export async function revokeRefreshToken(rawRefreshToken: string): Promise<void> {
  const tokenHash = hashToken(rawRefreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: PUBLIC_USER_SELECT });
  if (!user) throw ApiError.notFound("User not found");
  return user;
}

export async function updateUserProfile(userId: string, input: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.avatar !== undefined && { avatar: input.avatar }),
      ...(input.preferences !== undefined && { preferences: toJsonInput(input.preferences) }),
    },
    select: PUBLIC_USER_SELECT,
  });

  return user;
}
