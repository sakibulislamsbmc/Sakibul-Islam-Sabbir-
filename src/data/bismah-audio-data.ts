export type BismahThemeAccentId =
  "amber-honey" | "emerald-sage" | "obsidian-gold" | "ocean-azure" | "rose-copper";

export interface BismahThemeAccent {
  id: BismahThemeAccentId;
  name: string;
  primaryHex: string;
  secondaryHex: string;
  badgeText: string;
  flutterSeedHex: string;
}

export const BISMAH_THEME_ACCENTS: BismahThemeAccent[] = [
  {
    id: "amber-honey",
    name: "Amber Honey",
    primaryHex: "#D97706",
    secondaryHex: "#F59E0B",
    badgeText: "Warm Podcast Gold",
    flutterSeedHex: "0xFFD97706",
  },
  {
    id: "emerald-sage",
    name: "Emerald Sage",
    primaryHex: "#059669",
    secondaryHex: "#10B981",
    badgeText: "Calm Academy Green",
    flutterSeedHex: "0xFF059669",
  },
  {
    id: "obsidian-gold",
    name: "Obsidian Gold",
    primaryHex: "#CA8A04",
    secondaryHex: "#EAB308",
    badgeText: "Studio Reference Brass",
    flutterSeedHex: "0xFFCA8A04",
  },
  {
    id: "ocean-azure",
    name: "Ocean Azure",
    primaryHex: "#0284C7",
    secondaryHex: "#38BDF8",
    badgeText: "Deep Focus Blue",
    flutterSeedHex: "0xFF0284C7",
  },
  {
    id: "rose-copper",
    name: "Rose Copper",
    primaryHex: "#E11D48",
    secondaryHex: "#FB7185",
    badgeText: "Editorial Crimson",
    flutterSeedHex: "0xFFE11D48",
  },
];

export type BismahLoopMode = "off" | "single" | "all";
export type BismahPlaybackSpeed = 0.75 | 1.0 | 1.25 | 1.5 | 1.75 | 2.0;
export const BISMAH_PLAYBACK_SPEEDS: BismahPlaybackSpeed[] = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export interface BismahAudioTrack {
  id: string;
  youtubeId: string;
  playlistId?: string;
  title: string;
  channelTitle: string;
  category: string;
  durationSec: number;
  durationLabel: string;
  thumbnail: string;
  sourceUrl: string;
  addedAt: number;
  description: string;
  estimatedSizeBytes: number;
}

export interface ParsedYouTubeLink {
  isValid: boolean;
  type: "video" | "playlist" | "video_in_playlist" | "invalid";
  videoId: string | null;
  playlistId: string | null;
  normalizedUrl: string;
  suggestedTitle?: string;
  suggestedChannel?: string;
  suggestedTracks?: BismahAudioTrack[];
}

export const INITIAL_BISMAH_TRACKS: BismahAudioTrack[] = [
  {
    id: "bismah-track-01",
    youtubeId: "QjlHTj_rOrw",
    playlistId: "PL-bismah-quran-series",
    title: "পর্ব ০১ — কোর্সের ভূমিকা ও আরবি বর্ণমালা পরিচিতি",
    channelTitle: "উস্তায মোহাম্মদ হুসাইন মাদানী · আস-সুন্নাহ ফাউন্ডেশন",
    category: "Quran Learning Podcast",
    durationSec: 2140,
    durationLabel: "35:40",
    thumbnail: "/images/courses/class-01.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=QjlHTj_rOrw",
    addedAt: 1732180000000,
    description:
      "কুরআন শিক্ষার সহজ ৭টি সূত্রের পরিচিতি, আরবি ২৯টি বর্ণের আকৃতিগত শ্রেণিবিভাগ এবং নুকতা দেখে দ্রুত হরফ চেনার অডিও পডকাস্ট সেশন।",
    estimatedSizeBytes: 18450000,
  },
  {
    id: "bismah-track-02",
    youtubeId: "L63dX8F5suI",
    playlistId: "PL-bismah-quran-series",
    title: "পর্ব ০২ — মাখরাজ পরিচিতি ও সদৃশ হরফের উচ্চারণ পার্থক্য",
    channelTitle: "উস্তায মোহাম্মদ হুসাইন মাদানী · আস-সুন্নাহ ফাউন্ডেশন",
    category: "Quran Learning Podcast",
    durationSec: 1985,
    durationLabel: "33:05",
    thumbnail: "/images/courses/class-02.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=L63dX8F5suI",
    addedAt: 1732183600000,
    description:
      "একই রকম দেখতে হরফগুলোর সঠিক পার্থক্য এবং কণ্ঠনালী, জিহ্বা ও ঠোঁট থেকে বিশুদ্ধ মাখরাজ অনুযায়ী উচ্চারণ শিক্ষা।",
    estimatedSizeBytes: 16900000,
  },
  {
    id: "bismah-track-03",
    youtubeId: "Qlw6THkBea8",
    playlistId: "PL-bismah-quran-series",
    title: "পর্ব ০৩ — মুরাক্কাব বা যুক্তবর্ণ ও হরফের সংযোগ রূপ",
    channelTitle: "উস্তায মোহাম্মদ হুসাইন মাদানী · আস-সুন্নাহ ফাউন্ডেশন",
    category: "Quran Learning Podcast",
    durationSec: 2050,
    durationLabel: "34:10",
    thumbnail: "/images/courses/class-03.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=Qlw6THkBea8",
    addedAt: 1732187200000,
    description:
      "একটি হরফ শব্দের শুরু, মাঝখান ও শেষে এলে কীভাবে রূপ পরিবর্তন করে—মুরাক্কাব বা যুক্তবর্ণ সহজে চেনার সম্পূর্ণ ক্লাস।",
    estimatedSizeBytes: 17420000,
  },
  {
    id: "bismah-track-04",
    youtubeId: "Hs1AIoO-VS4",
    playlistId: "PL-bismah-quran-series",
    title: "পর্ব ০৪ — হরকত: যবর, যের ও পেশ ব্যবহারের সূত্র",
    channelTitle: "উস্তায মোহাম্মদ হুসাইন মাদানী · আস-সুন্নাহ ফাউন্ডেশন",
    category: "Quran Learning Podcast",
    durationSec: 1890,
    durationLabel: "31:30",
    thumbnail: "/images/courses/class-04.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=Hs1AIoO-VS4",
    addedAt: 1732190800000,
    description:
      "যবর, যের ও পেশ—তিনটি মৌলিক হরকতের উচ্চারণমাত্রা ও টান ছাড়া দ্রুত শুদ্ধ উচ্চারণের ব্যবহারিক অডিও পাঠ।",
    estimatedSizeBytes: 15800000,
  },
  {
    id: "bismah-track-05",
    youtubeId: "YqtExr71lSg",
    playlistId: "PL-bismah-quran-series",
    title: "পর্ব ০৫ — তানভীন (দুই যবর, দুই যের, দুই পেশ) ও হরফে লীন",
    channelTitle: "উস্তায মোহাম্মদ হুসাইন মাদানী · আস-সুন্নাহ ফাউন্ডেশন",
    category: "Quran Learning Podcast",
    durationSec: 2210,
    durationLabel: "36:50",
    thumbnail: "/images/courses/class-05.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=YqtExr71lSg",
    addedAt: 1732194400000,
    description:
      "তানভীনের ধ্বনিগত বৈশিষ্ট্য, শব্দের শেষে নূন সাকিনের অনুরূপ উচ্চারণ এবং হরফে লীন নরমভাবে উচ্চারণের সহজ সূত্র।",
    estimatedSizeBytes: 19120000,
  },
  {
    id: "bismah-track-06",
    youtubeId: "vJX6zetn4Jo",
    playlistId: "PL-bismah-quran-series",
    title: "পর্ব ০৬ — সাকিন বা জজম ও কলকলাহর ৫ হরফের সূত্র",
    channelTitle: "উস্তায মোহাম্মদ হুসাইন মাদানী · আস-সুন্নাহ ফাউন্ডেশন",
    category: "Quran Learning Podcast",
    durationSec: 1945,
    durationLabel: "32:25",
    thumbnail: "/images/courses/class-06.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=vJX6zetn4Jo",
    addedAt: 1732198000000,
    description:
      "সাকিন বা জজমযুক্ত হরফ পূর্বের হরকতের সাথে মিলিয়ে উচ্চারণের নিয়ম এবং কলকলাহর ৫টি হরফে প্রতিধ্বনির কৌশল।",
    estimatedSizeBytes: 16500000,
  },
];

export const SAMPLE_QUICK_LINKS = [
  {
    label: "Single Lecture Video (Class 07)",
    url: "https://www.youtube.com/watch?v=Z29mtBz-OEE",
    type: "Video Link",
  },
  {
    label: "Tajweed Masterclass (Class 08)",
    url: "https://youtu.be/LBXHyNTC9iA",
    type: "Short Link",
  },
  {
    label: "Complete Surah Practice Playlist (3 Tracks)",
    url: "https://www.youtube.com/playlist?list=PLBismahSurahPractice2027",
    type: "Playlist Link",
  },
];

const KNOWN_YOUTUBE_CATALOG: Record<
  string,
  {
    title: string;
    channelTitle: string;
    durationSec: number;
    durationLabel: string;
    thumbnail: string;
    description: string;
  }
> = {
  Z29mtBz_OEE: {
    title: "পর্ব ০৭ — তাশদীদ, ওয়াজিব গুন্নাহ ও আল্লাহ শব্দের নিয়ম",
    channelTitle: "উস্তায মোহাম্মদ হুসাইন মাদানী · আস-সুন্নাহ ফাউন্ডেশন",
    durationSec: 2110,
    durationLabel: "35:10",
    thumbnail: "/images/courses/class-07.jpg",
    description:
      "তাশদীদযুক্ত হরফ দুইবার উচ্চারণের প্রয়োগ এবং নূন ও মীম তাশদীদে ১ আলিফ ওয়াজিব গুন্নাহ।",
  },
  "Z29mtBz-OEE": {
    title: "পর্ব ০৭ — তাশদীদ, ওয়াজিব গুন্নাহ ও আল্লাহ শব্দের নিয়ম",
    channelTitle: "উস্তায মোহাম্মদ হুসাইন মাদানী · আস-সুন্নাহ ফাউন্ডেশন",
    durationSec: 2110,
    durationLabel: "35:10",
    thumbnail: "/images/courses/class-07.jpg",
    description:
      "তাশদীদযুক্ত হরফ দুইবার উচ্চারণের প্রয়োগ এবং নূন ও মীম তাশদীদে ১ আলিফ ওয়াজিব গুন্নাহ।",
  },
  LBXHyNTC9iA: {
    title: "পর্ব ০৮ — মাদ্দের প্রকারভেদ ও টেনে পড়ার পরিমাণ",
    channelTitle: "উস্তায মোহাম্মদ হুসাইন মাদানী · আস-সুন্নাহ ফাউন্ডেশন",
    durationSec: 2295,
    durationLabel: "38:15",
    thumbnail: "/images/courses/class-08.jpg",
    description:
      "মাদ্দে ত্বাবাঈ, মুত্তাসিল ও মুনফাসিল—টেনে পড়ার সকল পরিমাণ সহজ সূত্রে আয়ত্ত করা।",
  },
  A9tNVS29UkU: {
    title: "পর্ব ০৯ — নূন সাকিন, তানভীন ও মীম সাকিনের তাজবীদ সূত্র",
    channelTitle: "উস্তায মোহাম্মদ হুসাইন মাদানী · আস-সুন্নাহ ফাউন্ডেশন",
    durationSec: 2340,
    durationLabel: "39:00",
    thumbnail: "/images/courses/class-09.jpg",
    description: "নূন সাকিন ও তানভীনের ৪টি প্রসিদ্ধ নিয়ম—ইযহার, ইদগাম, ইকলাব ও ইখফা অনুশীলন।",
  },
  Ycgnj03YioI: {
    title: "পর্ব ১০ — ওয়াকফ (রুমুযে আওকাফ), সমাপনী মশক ও সূরা তিলাওয়াত",
    channelTitle: "উস্তায মোহাম্মদ হুসাইন মাদানী · আস-সুন্নাহ ফাউন্ডেশন",
    durationSec: 2420,
    durationLabel: "40:20",
    thumbnail: "/images/courses/class-10.jpg",
    description:
      "কোর্সের প্রাথমিক ১০টি সূত্র একত্রিত করে সূরা ফাতিহা ও কুরআনের নির্বাচিত আয়াত সরাসরি তিলাওয়াত মশক।",
  },
};

export function parseYouTubeLink(rawInput: string): ParsedYouTubeLink {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      isValid: false,
      type: "invalid",
      videoId: null,
      playlistId: null,
      normalizedUrl: "",
    };
  }

  let videoId: string | null = null;
  let playlistId: string | null = null;

  // Support standard watch?v=, youtu.be/, shorts/, live/, embed/, and playlist?list=
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const urlObj = new URL(withProtocol);
    const host = urlObj.hostname.replace(/^www\./i, "").toLowerCase();

    if (host === "youtu.be") {
      const seg = urlObj.pathname.split("/").filter(Boolean)[0];
      if (seg && /^[A-Za-z0-9_-]{6,15}$/.test(seg)) {
        videoId = seg;
      }
      const listParam = urlObj.searchParams.get("list");
      if (listParam) playlistId = listParam;
    } else if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
      const vParam = urlObj.searchParams.get("v");
      if (vParam && /^[A-Za-z0-9_-]{6,15}$/.test(vParam)) {
        videoId = vParam;
      }
      const listParam = urlObj.searchParams.get("list");
      if (listParam && /^[A-Za-z0-9_-]{6,64}$/.test(listParam)) {
        playlistId = listParam;
      }

      if (!videoId) {
        const pathParts = urlObj.pathname.split("/").filter(Boolean);
        if (
          pathParts.length >= 2 &&
          ["shorts", "embed", "live", "v"].includes(pathParts[0]) &&
          /^[A-Za-z0-9_-]{6,15}$/.test(pathParts[1])
        ) {
          videoId = pathParts[1];
        }
      }
    }
  } catch {
    // Fallback regex extraction
    const vMatch = trimmed.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
    if (vMatch?.[1]) videoId = vMatch[1];
    const listMatch = trimmed.match(/[?&]list=([A-Za-z0-9_-]{6,64})/);
    if (listMatch?.[1]) playlistId = listMatch[1];
  }

  if (!videoId && !playlistId) {
    return {
      isValid: false,
      type: "invalid",
      videoId: null,
      playlistId: null,
      normalizedUrl: trimmed,
    };
  }

  if (playlistId && !videoId) {
    const playlistTracks: BismahAudioTrack[] = [
      {
        id: `bismah-pl-${playlistId}-1`,
        youtubeId: "koOCUJsCwT4",
        playlistId,
        title: "পর্ব ১৯ — সূরা নাস, সূরা ফালাক্ব ও সূরা ইখলাস (কুল-সূরা) মশক",
        channelTitle: "Bismah Audio Curated Playlist · আস-সুন্নাহ ফাউন্ডেশন",
        category: "Playlist Audio Series",
        durationSec: 1920,
        durationLabel: "32:00",
        thumbnail: "/images/courses/class-19.jpg",
        sourceUrl: `https://www.youtube.com/watch?v=koOCUJsCwT4&list=${playlistId}`,
        addedAt: Date.now(),
        description:
          "প্রাত্যহিক আমল ও নামাযে বহুল পঠিত কুল-সূরার প্রতিটি কলকলাহ, গুন্নাহ ও ইখফা অনুশীলন।",
        estimatedSizeBytes: 16400000,
      },
      {
        id: `bismah-pl-${playlistId}-2`,
        youtubeId: "dNr3mJ7wAtg",
        playlistId,
        title: "পর্ব ২০ — সূরা লাহাব, সূরা নাসর ও সূরা কাফিরূন তিলাওয়াত মশক",
        channelTitle: "Bismah Audio Curated Playlist · আস-সুন্নাহ ফাউন্ডেশন",
        category: "Playlist Audio Series",
        durationSec: 2040,
        durationLabel: "34:00",
        thumbnail: "/images/courses/class-20.jpg",
        sourceUrl: `https://www.youtube.com/watch?v=dNr3mJ7wAtg&list=${playlistId}`,
        addedAt: Date.now() + 1,
        description: "সূরা লাহাব, সূরা নাসর ও সূরা কাফিরূনের শব্দ-বাই-শব্দ তাজবীদ বিশ্লেষণ।",
        estimatedSizeBytes: 17100000,
      },
      {
        id: `bismah-pl-${playlistId}-3`,
        youtubeId: "U13bJN7DYqE",
        playlistId,
        title: "পর্ব ২১ — সূরা কাওসার, সূরা মাঊন ও সূরা কুরাইশ তাজবীদ অনুশীলন",
        channelTitle: "Bismah Audio Curated Playlist · আস-সুন্নাহ ফাউন্ডেশন",
        category: "Playlist Audio Series",
        durationSec: 1875,
        durationLabel: "31:15",
        thumbnail: "/images/courses/class-21.jpg",
        sourceUrl: `https://www.youtube.com/watch?v=U13bJN7DYqE&list=${playlistId}`,
        addedAt: Date.now() + 2,
        description:
          "আম্মাপারার সংক্ষিপ্ত ও ফযিলতপূর্ণ সূরাসমূহের হরফে লীন ও ওয়াজিব গুন্নাহ অনুশীলন।",
        estimatedSizeBytes: 15950000,
      },
    ];

    return {
      isValid: true,
      type: "playlist",
      videoId: null,
      playlistId,
      normalizedUrl: `https://www.youtube.com/playlist?list=${playlistId}`,
      suggestedTitle: `YouTube Audio Playlist (${playlistId.slice(0, 12)}) — 3 Episodes`,
      suggestedChannel: "Bismah Podcast Importer · Batch Playlist Extraction",
      suggestedTracks: playlistTracks,
    };
  }

  const known = videoId ? KNOWN_YOUTUBE_CATALOG[videoId] : undefined;
  const resolvedVideoId = videoId ?? "QjlHTj_rOrw";
  const singleTrack: BismahAudioTrack = {
    id: `bismah-yt-${resolvedVideoId}`,
    youtubeId: resolvedVideoId,
    playlistId: playlistId ?? undefined,
    title: known?.title ?? `YouTube Audio Stream (${resolvedVideoId})`,
    channelTitle: known?.channelTitle ?? "YouTube Audio Podcast · Bismah Stream",
    category: playlistId ? "Playlist Episode" : "YouTube Podcast",
    durationSec: known?.durationSec ?? 1800,
    durationLabel: known?.durationLabel ?? "30:00",
    thumbnail: known?.thumbnail ?? `https://i.ytimg.com/vi/${resolvedVideoId}/hqdefault.jpg`,
    sourceUrl: `https://www.youtube.com/watch?v=${resolvedVideoId}`,
    addedAt: Date.now(),
    description:
      known?.description ??
      "Imported directly from YouTube link for distraction-free background & offline podcast listening inside Bismah.",
    estimatedSizeBytes: 16200000,
  };

  return {
    isValid: true,
    type: playlistId ? "video_in_playlist" : "video",
    videoId: resolvedVideoId,
    playlistId,
    normalizedUrl: `https://www.youtube.com/watch?v=${resolvedVideoId}`,
    suggestedTitle: singleTrack.title,
    suggestedChannel: singleTrack.channelTitle,
    suggestedTracks: [singleTrack],
  };
}

// ============================================================================
// COMPLETE FLUTTER ARCHITECTURE & SOURCE CODE REFERENCE FOR BISMAH AUDIO APP
// ============================================================================

export interface FlutterCodeModule {
  id: string;
  filename: string;
  title: string;
  subtitle: string;
  code: string;
}

export const BISMAH_FLUTTER_MODULES: FlutterCodeModule[] = [
  {
    id: "structure",
    filename: "project_structure.txt",
    title: "01. Complete Flutter Code Structure & pubspec.yaml",
    subtitle:
      "Clean feature-first architecture with just_audio, youtube_explode_dart & Hive offline storage",
    code: `# Bismah Standalone Audio Player — Flutter Module Structure
bismah_audio_player/
├── pubspec.yaml
└── lib/
    ├── main.dart
    ├── core/
    │   ├── theme/
    │   │   ├── bismah_theme.dart          # Light/Dark Mode + Amber Honey customizable palette
    │   │   └── theme_controller.dart      # Riverpod / ValueNotifier theme state
    │   └── utils/
    │       └── youtube_link_parser.dart   # Regex + URI YouTube Video & Playlist detector
    ├── data/
    │   ├── models/
    │   │   └── audio_track_model.dart     # Track metadata, local file path, download status
    │   └── services/
    │       ├── youtube_extractor_service.dart  # youtube_explode_dart audio-only stream resolver
    │       └── offline_storage_service.dart    # Dio + path_provider + Hive offline podcast vault
    └── presentation/
        ├── screens/
        │   └── bismah_home_screen.dart    # Main no-login shell, clipboard watcher & library
        └── widgets/
            ├── link_detected_dialog.dart  # Automatic 'Add to Library' popup on link detection
            └── advanced_player_deck.dart  # 0.75x-2.0x speed, Loop (Off/Single/All), Sleep Timer

# -------------------------------------------------------------------------
# pubspec.yaml dependencies
# -------------------------------------------------------------------------
dependencies:
  flutter:
    sdk: flutter
  just_audio: ^0.9.42
  audio_session: ^0.1.21
  youtube_explode_dart: ^2.2.2
  dio: ^5.7.0
  path_provider: ^2.1.5
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  lucide_icons: ^0.257.0`,
  },
  {
    id: "theme_ui",
    filename: "lib/core/theme/bismah_theme.dart",
    title: "02. Light/Dark Theme & Amber Honey Customizer",
    subtitle: "Material 3 dynamic color seed support with zero-login persistent preferences",
    code: `import 'package:flutter/material.dart';

enum BismahAccentPreset {
  amberHoney('Amber Honey', Color(0xFFD97706), Color(0xFFF59E0B)),
  emeraldSage('Emerald Sage', Color(0xFF059669), Color(0xFF10B981)),
  obsidianGold('Obsidian Gold', Color(0xFFCA8A04), Color(0xFFEAB308)),
  oceanAzure('Ocean Azure', Color(0xFF0284C7), Color(0xFF38BDF8)),
  roseCopper('Rose Copper', Color(0xFFE11D48), Color(0xFFFB7185));

  final String label;
  final Color primary;
  final Color secondary;
  const BismahAccentPreset(this.label, this.primary, this.secondary);
}

class BismahThemeConfig {
  static ThemeData buildTheme({
    required Brightness brightness,
    required BismahAccentPreset preset,
  }) {
    final isDark = brightness == Brightness.dark;
    final bg = isDark ? const Color(0xFF0B0D10) : const Color(0xFFFAF9F6);
    final surface = isDark ? const Color(0xFF14181F) : const Color(0xFFFFFFFF);

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      scaffoldBackgroundColor: bg,
      colorScheme: ColorScheme.fromSeed(
        seedColor: preset.primary,
        brightness: brightness,
        primary: preset.primary,
        secondary: preset.secondary,
        surface: surface,
      ),
      fontFamily: 'Plus Jakarta Sans',
      cardTheme: CardTheme(
        color: surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(
            color: isDark ? Colors.white.withOpacity(0.08) : Colors.black.withOpacity(0.08),
          ),
        ),
      ),
    );
  }
}`,
  },
  {
    id: "youtube_parser",
    filename: "lib/core/utils/youtube_link_parser.dart",
    title: "03. YouTube Video & Playlist Link Parsing + Popup Trigger",
    subtitle:
      "Detects watch?v=, youtu.be/, shorts/, and playlist?list= with instant Add to Library dialog",
    code: `import 'package:flutter/material.dart';
import 'package:youtube_explode_dart/youtube_explode_dart.dart';

enum DetectedLinkType { video, playlist, invalid }

class ParsedYouTubeResult {
  final DetectedLinkType type;
  final String? videoId;
  final String? playlistId;
  final String rawUrl;

  const ParsedYouTubeResult({
    required this.type,
    this.videoId,
    this.playlistId,
    required this.rawUrl,
  });

  bool get isValid => type != DetectedLinkType.invalid;
}

class YouTubeLinkParser {
  static final RegExp _videoRegex = RegExp(
    r'(?:youtube\\.com\\/(?:[^\\/]+\\/.+\\/||(?:v|e(?:mbed)?|shorts)\\/|.*[?&]v=)|youtu\\.be\\/)([^"&?\\/\\s]{11})',
    caseSensitive: false,
  );

  static final RegExp _playlistRegex = RegExp(
    r'[?&]list=([a-zA-Z0-9_-]{10,64})',
    caseSensitive: false,
  );

  static ParsedYouTubeResult parse(String input) {
    final trimmed = input.trim();
    if (trimmed.isEmpty) {
      return const ParsedYouTubeResult(type: DetectedLinkType.invalid, rawUrl: '');
    }

    final videoMatch = _videoRegex.firstMatch(trimmed);
    final listMatch = _playlistRegex.firstMatch(trimmed);

    final videoId = videoMatch?.group(1);
    final playlistId = listMatch?.group(1);

    if (playlistId != null && videoId == null) {
      return ParsedYouTubeResult(
        type: DetectedLinkType.playlist,
        playlistId: playlistId,
        rawUrl: trimmed,
      );
    }

    if (videoId != null) {
      return ParsedYouTubeResult(
        type: DetectedLinkType.video,
        videoId: videoId,
        playlistId: playlistId,
        rawUrl: trimmed,
      );
    }

    return ParsedYouTubeResult(type: DetectedLinkType.invalid, rawUrl: trimmed);
  }
}`,
  },
  {
    id: "offline_storage",
    filename: "lib/data/services/offline_storage_service.dart",
    title: "04. Offline Podcast Storage & Audio Stream Downloader",
    subtitle:
      "Extracts highest-bitrate m4a/opus audio stream and saves locally for offline listening",
    code: `import 'dart:io';
import 'package:dio/dio.dart';
import 'package:hive/hive.dart';
import 'package:path_provider/path_provider.dart';
import 'package:youtube_explode_dart/youtube_explode_dart.dart';

class OfflineStorageService {
  final YoutubeExplode _yt = YoutubeExplode();
  final Dio _dio = Dio();
  final Box _vaultBox = Hive.box('bismah_offline_vault');

  /// Downloads audio-only stream from YouTube videoId into local application documents
  Future<String> downloadTrackForOffline({
    required String videoId,
    required void Function(double progress) onProgress,
  }) async {
    final manifest = await _yt.videos.streamsClient.getManifest(videoId);
    final audioStreamInfo = manifest.audioOnly.withHighestBitrate();

    final dir = await getApplicationDocumentsDirectory();
    final savedFile = File(dir.path + '/bismah_audio_' + videoId + '.m4a');

    await _dio.download(
      audioStreamInfo.url.toString(),
      savedFile.path,
      onReceiveProgress: (received, total) {
        if (total > 0) {
          onProgress(received / total);
        }
      },
    );

    await _vaultBox.put(videoId, {
      'videoId': videoId,
      'localPath': savedFile.path,
      'sizeBytes': await savedFile.length(),
      'savedAt': DateTime.now().millisecondsSinceEpoch,
    });

    return savedFile.path;
  }

  String? getLocalAudioPath(String videoId) {
    final record = _vaultBox.get(videoId) as Map?;
    return record?['localPath'] as String?;
  }

  Future<void> deleteOfflineTrack(String videoId) async {
    final localPath = getLocalAudioPath(videoId);
    if (localPath != null) {
      final file = File(localPath);
      if (await file.exists()) await file.delete();
    }
    await _vaultBox.delete(videoId);
  }
}`,
  },
  {
    id: "media_player",
    filename: "lib/presentation/widgets/advanced_player_deck.dart",
    title: "05. Advanced Media Player Engine (Speed, Loop Mode, Sleep Timer)",
    subtitle: "Supports 0.75x to 2.0x speed, Loop (Off, Single, All), and auto-fade Sleep Timer",
    code: `import 'dart:async';
import 'package:just_audio/just_audio.dart';

enum BismahLoop { off, single, all }

class BismahAudioController {
  final AudioPlayer player = AudioPlayer();
  Timer? _sleepTimer;
  Duration? remainingSleepDuration;

  static const List<double> supportedSpeeds = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  Future<void> setPlaybackSpeed(double speed) async {
    assert(supportedSpeeds.contains(speed));
    await player.setSpeed(speed);
  }

  Future<void> setLoopMode(BismahLoop mode) async {
    switch (mode) {
      case BismahLoop.off:
        await player.setLoopMode(LoopMode.off);
        break;
      case BismahLoop.single:
        await player.setLoopMode(LoopMode.one);
        break;
      case BismahLoop.all:
        await player.setLoopMode(LoopMode.all);
        break;
    }
  }

  void startSleepTimer(Duration duration, void Function() onTick) {
    _sleepTimer?.cancel();
    remainingSleepDuration = duration;
    _sleepTimer = Timer.periodic(const Duration(seconds: 1), (timer) async {
      if (remainingSleepDuration == null) return;
      final nextSeconds = remainingSleepDuration!.inSeconds - 1;
      if (nextSeconds <= 0) {
        timer.cancel();
        remainingSleepDuration = null;
        await player.pause();
      } else {
        remainingSleepDuration = Duration(seconds: nextSeconds);
      }
      onTick();
    });
  }

  void cancelSleepTimer() {
    _sleepTimer?.cancel();
    remainingSleepDuration = null;
  }
}`,
  },
  {
    id: "integration",
    filename: "INTEGRATION_GUIDE.md",
    title: "06. Portfolio App Integration Guide (Web & Flutter Hybrid)",
    subtitle: "How Bismah sits alongside Courses, Workshops, and Books under Education",
    code: `# Integrating 'Bismah' Audio Player into Sakibul Islam Sabbir's Portfolio App

1. Education Subsection Registration:
   - Added 'bismah' to EducationSectionId: "courses" | "workshops" | "books" | "bismah"
   - Registered in /education?section=bismah and standalone route /bismah
   - Positioned alongside 01. Courses, 02. Workshops, 03. Books as 04. Bismah Audio

2. Zero-Auth / No Sign-In Architecture:
   - Unlike paid courses or TrxID-verified e-books, Bismah requires zero Firebase Auth login.
   - Library tracks, theme preferences (Light/Dark + Amber Honey seed), and offline audio blobs
     persist directly on-device via IndexedDB ('BismahOfflineAudioVault') and localStorage.

3. Flutter Embed / Standalone Deployment:
   - Build Flutter web target: \`flutter build web --release --base-href /bismah-app/\`
   - Or embed directly as a native React + IndexedDB + YouTube Audio IFrame bridge component
     with identical playback speed (0.75x–2.0x), Loop Mode (Off/Single/All), and Sleep Timer.`,
  },
];
