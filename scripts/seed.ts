import { faker } from "@faker-js/faker";
import { hashPassword } from "better-auth/crypto"; // Import hashPassword
import { sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  accountTable,
  announcements,
  sessionTable,
  teamInviteCodes,
  teamMembers,
  teams,
  userTable,
} from "~/db/schema";
import { AnnouncementPriority } from "~/db/types"; // Added import for priority
import { db } from "../db";

async function seed() {
  // Clean DB: truncate all tables in dependency order
  await db.execute(
    sql`TRUNCATE TABLE team_invite_codes, announcements, team_members, teams, account, "user", session CASCADE`,
  );

  const arabicNames = [
    "Mohamed Alaoui",
    "Said Benani",
    "Fatima Zahra",
    "Khadija Idrissi",
    "Youssef Amine",
    "Hicham Bouzid",
    "Salma Chafai",
    "Abdellah Naciri",
    "Meryem El Aaroui",
    "Yassine Barada",
    "Amina Benjelloun",
    "Hassan Tazi",
    "Leila Saadi",
    "Hamza Belmekki",
    "Zineb El Aaroui",
    "Omar El Fassi",
    "Nadia Bennis",
    "Karim El Mansouri",
    "Samira El Ghazali",
    "Rachid El Idrissi",
    "Imane El Khatib",
    "Younes El Amrani",
    "Sara El Yacoubi",
    "Mounir El Hachimi",
    "Latifa El Fadili",
    "Nabil El Malki",
    "Rania El Gharbi",
    "Tarik El Moutawakkil",
    "Soukaina El Fassi",
    "Jalil El Amrani",
    "Mouad El Idrissi",
    "Hajar Boukhris",
    "Ayoub El Mahdi",
    "Ilham Bennis",
    "Zakaria El Khatib",
    "Najib El Ghazali",
    "Malak Benjelloun",
    "Yassir Tazi",
    "Siham El Aaroui",
    "Othmane Belmekki",
    "Rim El Fassi",
    "Houda Saadi",
    "Reda Barada",
    "Asmae Chafai",
    "Walid Bouzid",
    "Souad Belmekki",
    "Fouad El Mansouri",
    "Samia Idrissi",
    "Khalid Naciri",
    "Laila Benani",
    "Ayman Amine",
    "Ikram El Ghazali",
    "Yassine El Malki",
    "Kenza Saadi",
    "Soukaina El Aaroui",
    "Badr El Amrani",
    "Sanae El Fadili",
    "Meryem El Mahdi",
    "Noureddine Alaoui",
    "Imane Benjelloun",
    "Omar Bouzid",
    "Nadia El Fassi",
    "Hicham El Ghazali",
    "Salma El Aaroui",
    "Karim Barada",
    "Amina El Khatib",
    "Tarik Boukhris",
    "Latifa El Mansouri",
    "Hamza El Malki",
    "Rania El Fadili",
    "Abdelhak El Ghazali",
    "Mounir Benjelloun",
    "Loubna El Amrani",
    "Youssef El Fassi",
    "Samira El Aaroui",
    "Nabil El Khatib",
    "Imane Bouzid",
    "Younes Belmekki",
    "Sara Benani",
    "Mohamed El Ghazali",
    "Khadija El Aaroui",
    "Hassan El Fadili",
    "Leila El Mahdi",
    "Hamza Benjelloun",
    "Zineb El Ghazali",
    "Omar El Mansouri",
    "Nadia Benani",
    "Karim El Fadili",
    "Samira El Mahdi",
    "Rachid El Amrani",
    "Imane El Ghazali",
    "Younes Benjelloun",
    "Sara El Mahdi",
    "Mounir El Khatib",
    "Latifa El Aaroui",
    "Nabil El Amrani",
    "Rania El Mansouri",
    "Tarik El Ghazali",
    "Soukaina El Mahdi",
    "Jalil El Fadili",
    "Amina El Ouazzani",
    "Hassan El Moudden",
    "Fatima El Moutawakkil",
    "Khadija El Moudden",
    "Youssef El Yacoubi",
    "Hicham El Moudden",
    "Salma El Hachimi",
    "Abdellah El Mahdi",
    "Meryem El Moudden",
    "Yassine El Yacoubi",
    "Amina El Aaroui",
    "Hassan El Ghazali",
    "Fatima El Fassi",
    "Khadija El Hachimi",
    "Youssef El Amrani",
    "Hicham El Fassi",
    "Salma El Aaroui",
    "Abdellah El Ghazali",
    "Meryem El Fassi",
    "Yassine El Hachimi",
    "Amina El Idrissi",
    "Hassan El Mansouri",
    "Fatima El Mahdi",
    "Khadija El Idrissi",
    "Youssef El Ghazali",
    "Hicham El Mansouri",
    "Salma El Idrissi",
    "Abdellah El Mahdi",
    "Meryem El Idrissi",
    "Yassine El Mansouri",
    "Amina El Khatib",
    "Hassan El Yacoubi",
    "Fatima El Amrani",
    "Khadija El Khatib",
    "Youssef El Khatib",
    "Hicham El Yacoubi",
    "Salma El Khatib",
    "Abdellah El Amrani",
    "Meryem El Yacoubi",
    "Yassine El Khatib",
    "Amina El Fadili",
    "Hassan El Fassi",
    "Fatima El Hachimi",
    "Khadija El Fadili",
    "Youssef El Fassi",
    "Hicham El Hachimi",
    "Salma El Fadili",
    "Abdellah El Fassi",
    "Meryem El Fadili",
    "Yassine El Hachimi",
    "Amina El Moudden",
    "Hassan El Moudden",
    "Fatima El Moudden",
    "Khadija El Moudden",
    "Youssef El Moudden",
    "Hicham El Moudden",
    "Salma El Moudden",
    "Abdellah El Moudden",
    "Meryem El Moudden",
    "Yassine El Moudden",
    "Amina El Moutawakkil",
    "Hassan El Moutawakkil",
    "Fatima El Moutawakkil",
    "Khadija El Moutawakkil",
    "Youssef El Moutawakkil",
    "Hicham El Moutawakkil",
    "Salma El Moutawakkil",
    "Abdellah El Moutawakkil",
    "Meryem El Moutawakkil",
    "Yassine El Moutawakkil",
    "Amina El Ouazzani",
    "Hassan El Ouazzani",
    "Fatima El Ouazzani",
    "Khadija El Ouazzani",
    "Youssef El Ouazzani",
    "Hicham El Ouazzani",
    "Salma El Ouazzani",
    "Abdellah El Ouazzani",
    "Meryem El Ouazzani",
    "Yassine El Ouazzani",
  ];

  const names = [...new Set(arabicNames)].sort(() => 0.5 - Math.random());

  // 1. Users
  const studentCount = 100;
  const teacherCount = 20;
  const adminCount = 1;
  const students = Array.from({ length: studentCount }).map((_, i) => ({
    id: nanoid(),
    name: names[i],
    email: `student${i + 1}@example.com`,
    emailVerified: true,
    role: "student",
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  const teachers = Array.from({ length: teacherCount }).map((_, i) => ({
    id: nanoid(),
    name: names[studentCount + i],
    email: `teacher${i + 1}@example.com`,
    emailVerified: true,
    role: "teacher",
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  const admins = [
    {
      id: nanoid(),
      name: names[studentCount + teacherCount],
      email: "admin1@example.com",
      emailVerified: true,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  const userList = [...students, ...teachers, ...admins];
  await db.insert(userTable).values(userList);

  // 1b. Accounts (for email/password login)
  // Use better-auth's hashPassword to generate the hash in salt:key format
  const passwordHash = await hashPassword("password123");
  const accountList = userList.map((user) => ({
    id: nanoid(),
    accountId: user.email,
    providerId: "credential", // as required by better-auth
    userId: user.id,
    password: passwordHash, // Store the combined salt:key hash
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  await db.insert(accountTable).values(accountList);

  // 1c. Sessions (create a session for each user)
  const sessionList = userList.map((user) => ({
    id: nanoid(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week from now
    token: nanoid(32),
    createdAt: new Date(),
    updatedAt: new Date(),
    ipAddress: faker.internet.ip(),
    userAgent: faker.internet.userAgent(),
    userId: user.id,
    impersonatedBy: null,
  }));
  await db.insert(sessionTable).values(sessionList);

  // 2. Teams
  const teamCount = 40;
  const teamTypes = [
    "classroom",
    "club",
    "study_group",
    "committee",
    "sports",
    "music",
    "science",
    "math",
    "art",
    "debate",
  ];
  const teamList = Array.from({ length: teamCount }).map((_, i) => ({
    id: nanoid(),
    name: `${faker.word.adjective()} ${faker.word.noun()} Team ${i + 1}`,
    type: faker.helpers.arrayElement(teamTypes),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  await db.insert(teams).values(teamList);

  // 3. Team Members (assign each student and teacher to a random team)
  const teamMemberList = [
    ...students.map((student) => ({
      id: nanoid(),
      userId: student.id,
      teamId: faker.helpers.arrayElement(teamList).id,
      role: "student",
      joinedAt: new Date(),
    })),
    ...teachers.map((teacher) => ({
      id: nanoid(),
      userId: teacher.id,
      teamId: faker.helpers.arrayElement(teamList).id,
      role: "teacher",
      joinedAt: new Date(),
    })),
  ];
  await db.insert(teamMembers).values(teamMemberList);

  // 4. Announcements (school/class/grade/event content)
  const announcementSubjects = [
    "Upcoming Exam",
    "Class Schedule",
    "Grade Release",
    "School Event",
    "Parent-Teacher Meeting",
    "Holiday Notice",
    "Sports Day",
    "Art Exhibition",
    "Science Fair",
    "Math Competition",
    "Field Trip",
    "Assignment Reminder",
    "Project Submission",
    "Extra Classes",
    "Results Announcement",
    "Workshop",
    "Seminar",
    "New Teacher Introduction",
    "Classroom Change",
    "Library Update",
  ];
  const announcementList = Array.from({ length: 100 }).map(() => {
    const subject = faker.helpers.arrayElement(announcementSubjects);
    const details = faker.lorem.sentences(2);
    return {
      id: nanoid(),
      senderId: faker.helpers.arrayElement([...students, ...teachers]).id,
      content: `${subject}: ${details}`,
      createdAt: faker.date.recent({ days: 30 }),
      // type: 'plain',
    };
  });
  await db.insert(announcements).values(announcementList);

  // 5. Team Invite Codes (optional, keep small for demo)
  const inviteCodeList = Array.from({ length: 5 }).map(() => {
    const team = faker.helpers.arrayElement(teamList);
    return {
      code: nanoid(6).toUpperCase(),
      teamId: team.id,
      createdBy: faker.helpers.arrayElement(userList).id,
      expiresAt: faker.date.soon(),
      maxUses: 10,
      uses: 0,
      createdAt: new Date(),
    };
  });
  await db.insert(teamInviteCodes).values(inviteCodeList);

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});


  // Seed Teams and Members
  const createdTeams = [];
  for (let i = 0; i < 5; i++) {
    const teamId = `team-${nanoid(8)}`;
    const teamName = faker.company.name();
    await db.insert(teams).values({
      id: teamId,
      name: teamName,
      ownerId: createdUsers[i % createdUsers.length].id, // Assign owner
      createdAt: faker.date.past(),
      updatedAt: new Date(),
    });
    createdTeams.push({ id: teamId, name: teamName });

    // Add owner as member
    await db.insert(teamMembers).values({
      id: `member-${nanoid(8)}`,
      teamId: teamId,
      userId: createdUsers[i % createdUsers.length].id,
      role: "admin", // Owner is admin
      joinedAt: new Date(),
    });

    // Add some other members
    const memberCount = faker.number.int({ min: 2, max: 5 });
    for (let j = 0; j < memberCount; j++) {
      const memberIndex = (i + j + 1) % createdUsers.length; // Ensure different members
      // Avoid adding the owner again
      if (createdUsers[memberIndex].id !== createdUsers[i % createdUsers.length].id) {
        await db.insert(teamMembers).values({
          id: `member-${nanoid(8)}`,
          teamId: teamId,
          userId: createdUsers[memberIndex].id,
          role: faker.helpers.arrayElement(["member", "editor"]), // Random role
          joinedAt: faker.date.past(),
        });
      }
    }

    // Seed Invite Codes for each team
    const inviteCodeCount = faker.number.int({ min: 1, max: 3 });
    for (let k = 0; k < inviteCodeCount; k++) {
      await db.insert(teamInviteCodes).values({
        id: `invite-${nanoid(8)}`,
        code: nanoid(10), // Generate a unique invite code
        teamId: teamId,
        expiresAt: faker.date.future(),
        createdAt: new Date(),
        createdBy: createdUsers[i % createdUsers.length].id, // Created by owner
        maxUses: faker.helpers.arrayElement([null, 5, 10]), // Optional max uses
        uses: 0,
      });
    }

    // Seed Announcements for each team (Existing English)
    const announcementCount = faker.number.int({ min: 5, max: 15 });
    const priorities = Object.values(AnnouncementPriority);
    for (let l = 0; l < announcementCount; l++) {
      const senderIndex = (i + l) % createdUsers.length;
      await db.insert(announcements).values({
        id: `announcement-${nanoid(12)}`,
        content: faker.lorem.paragraph(),
        priority: faker.helpers.arrayElement(priorities),
        teamId: teamId,
        senderId: createdUsers[senderIndex].id,
        createdAt: faker.date.past(),
      });
    }

    // Seed 10 Arabic Announcements for each team
    for (let m = 0; m < 10; m++) {
      const senderIndex = (i + m) % createdUsers.length;
      await db.insert(announcements).values({
        id: `announcement-ar-${nanoid(10)}`,
        content: `AR: ${faker.lorem.paragraph()}`, // Placeholder Arabic content
        priority: faker.helpers.arrayElement(priorities),
        teamId: teamId,
        senderId: createdUsers[senderIndex].id,
        createdAt: faker.date.past(),
      });
    }

    // Seed 10 French Announcements for each team
    for (let n = 0; n < 10; n++) {
      const senderIndex = (i + n) % createdUsers.length;
      await db.insert(announcements).values({
        id: `announcement-fr-${nanoid(10)}`,
        content: `FR: ${faker.lorem.paragraph()}`, // Placeholder French content
        priority: faker.helpers.arrayElement(priorities),
        teamId: teamId,
        senderId: createdUsers[senderIndex].id,
        createdAt: faker.date.past(),
      });
    }
  }

  console.log("✅ Database seeded successfully!");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
