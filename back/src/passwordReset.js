require("dotenv").config();
const bcrypt = require("bcrypt");
const prisma = require("./db");

async function main() {
  const username = "bensoneldhoct@gmail.com";
  const newPassword = "password";

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.student.update({
    where: { username },
    data: { passwordHash },
  });

  console.log(`Password reset for ${username}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());