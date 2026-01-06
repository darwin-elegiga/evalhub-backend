/*
  Warnings:

  - You are about to drop the column `code` on the `subjects` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "subjects" DROP COLUMN "code",
ADD COLUMN     "color" TEXT;
