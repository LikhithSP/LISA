const code = `graph TB
    subgraph Client_Application
        UI[User Interface]
        Audio[Web Speech API]
        Canvas[Handwriting Evaluator]
        State[Local Cache]
    end

    subgraph External_AI_Layer
        OR[OpenRouter Mistral]
        Gemini[Gemini API]
        Groq[Groq API]
    end

    subgraph Backend_Services
        Auth[Supabase Auth]
        Profiles[(Profiles Table)]
        Words[(Word of Day Table)]
        RLS[Security Engine]
    end

    UI -->|Speech Audio| Audio
    UI -->|Pointer Data| Canvas
    UI -->|Mutate Profile| RLS
    RLS -->|Auth Access| Profiles
    RLS -->|Read Vocab| Words
    UI -->|Primary| OR
    OR -->|Fallback| Gemini
    Gemini -->|Backup| Groq
    Profiles -.->|State Sync| State`;

const state = { code, mermaid: { theme: 'default' } };
const base64 = Buffer.from(JSON.stringify(state)).toString('base64');
console.log('https://mermaid.ink/img/' + base64);
