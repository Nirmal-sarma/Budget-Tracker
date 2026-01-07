// lib/prisma.ts
import { PrismaClient } from "@/lib/generated/prisma";

const globalForPrisma = global as unknown as { prisma: PrismaClient; __prismaQueue?: unknown };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Simple concurrency limiter to reduce simultaneous Prisma calls (mitigation for connection pool exhaustion).
// Controlled by PRISMA_CONCURRENCY env var (default 5).
const PRISMA_CONCURRENCY = Number(process.env.PRISMA_CONCURRENCY ?? 5);

type Resolver = () => void;
let current = 0;
const queue: Resolver[] = [];

function acquire(): Promise<() => void> {
  return new Promise((resolve) => {
    const tryAcquire = () => {
      if (current < PRISMA_CONCURRENCY) {
        current += 1;
        resolve(release);
      } else {
        queue.push(tryAcquire);
      }
    };
    tryAcquire();
  });

  function release() {
    current = Math.max(0, current - 1);
    const next = queue.shift();
    if (next) next();
  }
}

export async function runWithPrisma<T>(fn: () => Promise<T>): Promise<T> {
  const release = await acquire();
  try {
    return await fn();
  } finally {
    release();
  }
}