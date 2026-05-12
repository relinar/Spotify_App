import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// FMA folders
const FMA_ROOT = path.join(__dirname, "..", "fma");
const META_DIR = path.join(FMA_ROOT, "fma_metadata");
const SMALL_DIR = path.join(FMA_ROOT, "fma_small");

// Output folder for MP3s
const CLIENT_PUBLIC = path.join(__dirname, "..", "..", "client", "public");
const AUDIO_OUT = path.join(CLIENT_PUBLIC, "audio");

if (!fs.existsSync(AUDIO_OUT)) fs.mkdirSync(AUDIO_OUT, { recursive: true });

// Helper to load CSV
async function loadCSV(filePath) {
  const records = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on("data", (row) => records.push(row))
      .on("end", () => resolve(records))
      .on("error", reject);
  });
}

async function main() {
  console.log("🎵 Importing FMA dataset...");

  // RAW metadata filenames
  const tracksCsv = path.join(META_DIR, "raw_tracks.csv");
  const artistsCsv = path.join(META_DIR, "raw_artists.csv");

  const [tracks, artists] = await Promise.all([
    loadCSV(tracksCsv),
    loadCSV(artistsCsv),
  ]);

  // Map FMA artist_id → DB artist.id
  const artistMap = {};

  console.log("🎤 Creating artists...");

  for (const a of artists) {
    let name = a.name || a.artist_name || null;

    // If missing, generate fallback
    if (!name || name.trim() === "") {
      name = `Artist_${a.artist_id}`;
    }

    // Normalize name
    name = name.trim();

    // Check if artist already exists
    let artist = await prisma.artist.findFirst({
      where: { name },
    });

    if (!artist) {
      // If name exists but belongs to another artist, make unique
      const exists = await prisma.artist.findFirst({ where: { name } });
      if (exists) {
        name = `${name}_${a.artist_id}`;
      }

      artist = await prisma.artist.create({
        data: {
          name,
          bio: null,
          image: null,
        },
      });
    }

    artistMap[a.artist_id] = artist.id;
  }

  console.log("🎶 Importing songs...");
  let songIndex = 0;

  for (const t of tracks) {
    const trackId = t.track_id || t.id;
    const artistIdRaw = t.artist_id;
    const artistId = artistMap[artistIdRaw];

    if (!artistId) continue;

    // FMA small folder structure: 000/000001.mp3
    const idNum = Number(trackId);
    const folder = String(Math.floor(idNum / 1000)).padStart(3, "0");
    const fileName = String(idNum).padStart(6, "0") + ".mp3";
    const srcPath = path.join(SMALL_DIR, folder, fileName);

    if (!fs.existsSync(srcPath)) continue;

    // Copy MP3 to client/public/audio
    const audioFileName = `song_${songIndex}.mp3`;
    const audioDest = path.join(AUDIO_OUT, audioFileName);
    fs.copyFileSync(srcPath, audioDest);

    const duration = Number(t.duration) || 30;
    const genre = t.genre_top || null;

    await prisma.song.create({
      data: {
        title: t.title || `Track ${trackId}`,
        duration,
        genre,
        image: null,
        audioPath: `/audio/${audioFileName}`,
        artistId,
      },
    });

    songIndex++;
    if (songIndex % 100 === 0)
      console.log(`Imported ${songIndex} songs...`);
  }

  console.log("✅ DONE! Imported all FMA songs.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => prisma.$disconnect());
