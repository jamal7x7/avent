Ensure a Clean Database State
If you haven’t already, run:

```sh

dropdb avent
createdb avent

```

This will reset your database (all data will be lost).

2. Run Migrations
Apply all Drizzle migrations to create the tables:

```sh

pnpm db:migrate

```

Watch for errors. If you see errors like "already exists," your DB is not clean or the migration state is out of sync.

3. Confirm Table Existence
You can check tables exist using psql:

```sh

psql -d avent -c '\dt'

```

4. Arabic Names

```ts

const arabicNames = [
  "Mohamed Alaoui", "Said Benani", "Fatima Zahra", "Khadija Idrissi", "Youssef Amine",
  "Hicham Bouzid", "Salma Chafai", "Abdellah Naciri", "Meryem El Aaroui", "Yassine Barada",
  "Amina Benjelloun", "Hassan Tazi", "Leila Saadi", "Hamza Belmekki", "Zineb El Aaroui",
  "Omar El Fassi", "Nadia Bennis", "Karim El Mansouri", "Samira El Ghazali", "Rachid El Idrissi",
  "Imane El Khatib", "Younes El Amrani", "Sara El Yacoubi", "Mounir El Hachimi", "Latifa El Fadili",
  "Nabil El Malki", "Rania El Gharbi", "Tarik El Moutawakkil", "Soukaina El Fassi", "Jalil El Amrani",
  "Mouad El Idrissi", "Hajar Boukhris", "Ayoub El Mahdi", "Ilham Bennis", "Zakaria El Khatib",
  "Najib El Ghazali", "Malak Benjelloun", "Yassir Tazi", "Siham El Aaroui", "Othmane Belmekki",
  "Rim El Fassi", "Houda Saadi", "Reda Barada", "Asmae Chafai", "Walid Bouzid",
  "Souad Belmekki", "Fouad El Mansouri", "Samia Idrissi", "Khalid Naciri", "Laila Benani",
  "Ayman Amine", "Ikram El Ghazali", "Yassine El Malki", "Kenza Saadi", "Soukaina El Aaroui",
  "Badr El Amrani", "Sanae El Fadili", "Meryem El Mahdi", "Noureddine Alaoui", "Imane Benjelloun",
  "Omar Bouzid", "Nadia El Fassi", "Hicham El Ghazali", "Salma El Aaroui", "Karim Barada",
  "Amina El Khatib", "Tarik Boukhris", "Latifa El Mansouri", "Hamza El Malki", "Rania El Fadili",
  "Abdelhak El Ghazali", "Mounir Benjelloun", "Loubna El Amrani", "Youssef El Fassi", "Samira El Aaroui",
  "Nabil El Khatib", "Imane Bouzid", "Younes Belmekki", "Sara Benani", "Mohamed El Ghazali",
  "Khadija El Aaroui", "Hassan El Fadili", "Leila El Mahdi", "Hamza Benjelloun", "Zineb El Ghazali",
  "Omar El Mansouri", "Nadia Benani", "Karim El Fadili", "Samira El Mahdi", "Rachid El Amrani",
  "Imane El Ghazali", "Younes Benjelloun", "Sara El Mahdi", "Mounir El Khatib", "Latifa El Aaroui",
  "Nabil El Amrani", "Rania El Mansouri", "Tarik El Ghazali", "Soukaina El Mahdi", "Jalil El Fadili",
  "Amina El Ouazzani", "Hassan El Moudden", "Fatima El Moutawakkil", "Khadija El Moudden", "Youssef El Yacoubi",
  "Hicham El Moudden", "Salma El Hachimi", "Abdellah El Mahdi", "Meryem El Moudden", "Yassine El Yacoubi",
  "Amina El Aaroui", "Hassan El Ghazali", "Fatima El Fassi", "Khadija El Hachimi", "Youssef El Amrani",
  "Hicham El Fassi", "Salma El Aaroui", "Abdellah El Ghazali", "Meryem El Fassi", "Yassine El Hachimi",
  "Amina El Idrissi", "Hassan El Mansouri", "Fatima El Mahdi", "Khadija El Idrissi", "Youssef El Ghazali",
  "Hicham El Mansouri", "Salma El Idrissi", "Abdellah El Mahdi", "Meryem El Idrissi", "Yassine El Mansouri",
  "Amina El Khatib", "Hassan El Yacoubi", "Fatima El Amrani", "Khadija El Khatib", "Youssef El Khatib",
  "Hicham El Yacoubi", "Salma El Khatib", "Abdellah El Amrani", "Meryem El Yacoubi", "Yassine El Khatib",
  "Amina El Fadili", "Hassan El Fassi", "Fatima El Hachimi", "Khadija El Fadili", "Youssef El Fassi",
  "Hicham El Hachimi", "Salma El Fadili", "Abdellah El Fassi", "Meryem El Fadili", "Yassine El Hachimi",
  "Amina El Moudden", "Hassan El Moudden", "Fatima El Moudden", "Khadija El Moudden", "Youssef El Moudden",
  "Hicham El Moudden", "Salma El Moudden", "Abdellah El Moudden", "Meryem El Moudden", "Yassine El Moudden",
  "Amina El Moutawakkil", "Hassan El Moutawakkil", "Fatima El Moutawakkil", "Khadija El Moutawakkil", "Youssef El Moutawakkil",
  "Hicham El Moutawakkil", "Salma El Moutawakkil", "Abdellah El Moutawakkil", "Meryem El Moutawakkil", "Yassine El Moutawakkil",
  "Amina El Ouazzani", "Hassan El Ouazzani", "Fatima El Ouazzani", "Khadija El Ouazzani", "Youssef El Ouazzani",
  "Hicham El Ouazzani", "Salma El Ouazzani", "Abdellah El Ouazzani", "Meryem El Ouazzani", "Yassine El Ouazzani",
];

```




Cslab@3214

7IZFFrFKrMzttzSe


GZFZPFLE3Avc20AG