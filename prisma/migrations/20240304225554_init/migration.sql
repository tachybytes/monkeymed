-- CreateTable
CREATE TABLE "Teste" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teste" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Teste_teste_key" ON "Teste"("teste");
