require("dotenv").config();

const prisma = require("./db");

async function main() {
  const students = await prisma.student.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      name: true,
      username: true,
      role: true,
      team: true,
      rfidUid: true,
    },
  });

  console.log("\nActive Registered Students");
  console.log("==========================\n");

  if (students.length === 0) {
    console.log("No active students found.");
    return;
  }

  students.forEach((student, index) => {
    console.log(`${index + 1}. ${student.name}`);

    console.log("");
  });

  console.log(`Total active students: ${students.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());