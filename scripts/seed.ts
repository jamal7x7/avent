import { faker } from "@faker-js/faker";
import { hashPassword } from "better-auth/crypto";
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
import { AnnouncementPriority } from "~/db/types";
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
  const passwordHash = await hashPassword("password123");
  const accountList = userList.map((user) => ({
    id: nanoid(),
    accountId: user.email,
    providerId: "credential",
    userId: user.id,
    password: passwordHash,
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
      priority: faker.helpers.arrayElement(Object.values(AnnouncementPriority)),
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

  console.log("✅ Database seeded successfully!");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
