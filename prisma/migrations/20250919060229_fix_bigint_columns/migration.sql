/*
  Warnings:

  - You are about to alter the column `playbackPositionTicks` on the `sessions` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `runtimeTicks` on the `sessions` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "itemId" TEXT,
    "itemName" TEXT,
    "itemType" TEXT,
    "deviceName" TEXT,
    "clientName" TEXT,
    "playMethod" TEXT,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "playbackPositionTicks" BIGINT,
    "runtimeTicks" BIGINT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_sessions" ("clientName", "createdAt", "deviceName", "endTime", "id", "isActive", "itemId", "itemName", "itemType", "playMethod", "playbackPositionTicks", "runtimeTicks", "startTime", "updatedAt", "userId") SELECT "clientName", "createdAt", "deviceName", "endTime", "id", "isActive", "itemId", "itemName", "itemType", "playMethod", "playbackPositionTicks", "runtimeTicks", "startTime", "updatedAt", "userId" FROM "sessions";
DROP TABLE "sessions";
ALTER TABLE "new_sessions" RENAME TO "sessions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
