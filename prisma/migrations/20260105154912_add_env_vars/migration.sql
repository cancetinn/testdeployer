-- CreateTable
CREATE TABLE "EnvironmentVariable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EnvironmentVariable_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "EnvironmentVariable_botId_key_key" ON "EnvironmentVariable"("botId", "key");
