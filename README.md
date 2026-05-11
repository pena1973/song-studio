# Song Studio

**Song Studio** is an experimental music creation tool and an early product prototype for AI-assisted songwriting.

The project is not fully finished. It was created as a first attempt in a field that is personally very important to me: music, songwriting, melody, style, and creative expression.

I love music and write songs myself. While experimenting with AI music tools such as Suno, I found many things that would be valuable in a more flexible and personal song editor.

At the same time, I also found a major limitation: many AI-generated songs sound too generic. The voices often feel similar, the arrangements follow similar patterns, and the final songs can lose the recognizable sound of a specific author.

Song Studio was my attempt to think about a different kind of AI music tool — not just a generator, but an editable creative studio.

---

## Project Idea

The main idea of Song Studio is to give a person more control over AI-generated music.

Instead of generating a finished song that the user can only accept or reject, the product should help create a musical structure that can be edited, played, changed and developed.

The concept:

1. The user uploads 20–100 favorite tracks.
2. The system analyzes these tracks.
3. It extracts musical preferences: melody, harmony, rhythm, arrangement style and general mood.
4. The user uploads lyrics.
5. AI generates a musical draft based on the user’s taste.
6. The result is created as editable MIDI-like material.
7. The user can change the melody, harmony, bass or drums manually with a mouse.
8. The user can listen, experiment, adjust and gradually shape the song.

The goal is not to replace the author, but to give the author a better instrument.

---

## Why I Started This Project

I started this project because I wanted a music tool that understands personal taste.

My main concern with many AI music generators is that the result often becomes too average.

The songs may sound polished, but they often lack:

- individuality;
- recognizable author style;
- unique melodic identity;
- emotional precision;
- editable structure;
- real creative control.

For me, music is not only a generated audio file. Music is a process: listening, changing, searching, trying again, moving one note, changing harmony, simplifying the rhythm, strengthening the chorus.

Song Studio was created around this idea.

---

## Core Product Vision

Song Studio is imagined as a creative environment where AI helps generate the musical skeleton, but the user remains the author.

The system should generate and edit four basic musical tracks:

- **Melody**
- **Harmony**
- **Bass**
- **Drums**

These four tracks are enough to form the core structure of many songs.

The user should be able to:

- play the generated draft;
- edit notes visually;
- change the melodic line;
- experiment with harmony;
- adjust bass movement;
- change rhythm and drums;
- test different versions by ear;
- keep the creative process alive.

---

## What Makes This Idea Different

The product idea is different from simple “generate a song” tools.

The focus is not only on fast generation, but on:

- personal musical taste;
- editable MIDI structure;
- recognizable author style;
- human control over the result;
- melody and harmony as editable material;
- AI as a co-creator, not a replacement;
- experimentation instead of one-click generation.

The dream is to build a tool where a person can hear an idea, touch it, change it, and make it truly their own.

---

## Current Status

This project is an unfinished prototype.

It was created as a research and product experiment.

The current repository represents an early frontend/product exploration rather than a complete production-ready music engine.

The project helped me test the idea, design the direction, and understand the main technical challenge.

---

## Main Technical Challenge

The biggest obstacle I encountered was MIDI extraction from existing songs.

For this product idea to work properly, the system needs to analyze uploaded tracks and extract useful musical structure from them.

Ideally, it should be able to understand:

- melody;
- harmony;
- bass line;
- rhythm;
- arrangement patterns;
- stylistic features;
- musical preferences of the user.

The problem is that I did not find a free library that can accurately decompose an uploaded song into high-quality MIDI tracks.

Existing tools are not enough for the level of quality needed for this idea.

To solve this properly, it would likely be necessary to train or fine-tune AI models for music analysis and MIDI extraction.

At the moment, I do not yet have enough practical experience in training free/open models for this specific task.

---

## Looking for Collaboration

I still believe the idea is interesting.

If this project resonates with you, especially if you have experience in:

- machine learning;
- music information retrieval;
- MIDI generation;
- audio-to-MIDI transcription;
- AI music generation;
- model training;
- music technology;
- digital audio tools;

I would be very glad to discuss the idea and possibly continue it as a startup project.

Contact me:

```txt
ip.portu.me@gmail.com
```

---

## Planned Features

The original product vision included:

- upload of favorite tracks;
- analysis of personal musical taste;
- extraction of melody, harmony, bass and rhythm patterns;
- lyrics upload;
- AI-assisted melody generation;
- editable MIDI-style tracks;
- four-track song skeleton: melody, harmony, bass and drums;
- playback inside the browser;
- visual editing with the mouse;
- experiments with different arrangements;
- saving song drafts;
- generating several melodic variants;
- supporting the user as a songwriter, not replacing them.

---

## Tech Stack

The current prototype is built with:

- **Next.js**
- **React**
- **TypeScript**
- **Sass / SCSS**
- **i18next**
- **react-i18next**
- **ESLint**

Main dependencies:

- `next`
- `react`
- `react-dom`
- `i18next`
- `react-i18next`
- `sass`

---

## Project Structure

```txt
song-studio/
├── components/          # UI components
├── lib/
│   └── music/           # Music-related logic and experiments
├── pages/               # Next.js pages
├── public/
│   └── locales/         # Translation files
├── styles/              # SCSS styles
├── i18n.ts              # Internationalization configuration
├── next.config.ts       # Next.js configuration
├── package.json         # Scripts and dependencies
└── tsconfig.json        # TypeScript configuration
```

---

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the project in the browser:

```txt
http://localhost:3000
```

Build the project:

```bash
npm run build
```

Run production build locally:

```bash
npm run start
```

Run linting:

```bash
npm run lint
```

---

## Product Direction

The long-term idea is to create a new kind of AI-assisted songwriting studio.

Not a tool that produces anonymous songs.

Not a tool that makes every user sound the same.

But a tool that helps a person discover and develop their own sound.

A good AI music tool should not erase the author.  
It should help the author become more precise, more expressive, and more recognizable.

---

## Possible Future Development

Possible next steps:

- research open-source audio-to-MIDI models;
- test melody extraction models;
- test harmony and chord recognition;
- build a MIDI editor prototype;
- add browser playback;
- generate melody from lyrics;
- generate harmony and bass from melody;
- create editable four-track arrangement;
- add export to MIDI;
- add export to audio;
- add user style profile based on favorite songs;
- collaborate with ML engineers and musicians.

---

## Author

Created by **Natalia Barinova**.

I am a full-stack developer and songwriter.  
This project combines two areas that are very important to me: software development and music.

Song Studio is a prototype, but also a personal product idea that I would be happy to continue with the right people.

---

## License and Usage

This project is available for portfolio review and non-commercial use only.

Commercial use, copying, redistribution, resale, implementation for clients, or use inside a business process requires written permission from the author.

For commercial licensing, collaboration, or startup discussion, contact:

```txt
ip.portu.me@gmail.com
```
