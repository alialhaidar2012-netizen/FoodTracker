import{GROQ_API_KEY} from './config.js';

async function analyzePhoto() {
    const photoInput = document.getElementById('photoInput');
    const file = photoInput.files[0];
    
    if (!file) return;
    

    
    const currentStatus = document.getElementById('currentStatus');
    currentStatus.textContent = '⏳ Analysiere Foto...';
    
    try {
        const imageUrl = await fileToImageURL(file);
        const prompt = `
            Analysiere dieses Essen oder Getränk und schätze die Nährwerte.
            Erzeuge kein SmallTalk, keine Markdown-Formatierung und  keine Anleitung
            Antworte NUR mit einem JSON Objekt im folgenden Format:

            {
                "name": "Gericht",
                "kalorien": 0,
                "fett": 0,
                "kohlenhydrate": 0,
                "zucker": 0,
                "protein": 0,
                "ballaststoffe": 0
            }   
        `;
        
        const result = await callOpenAiVision(prompt, imageUrl);
        
        const currentMeal = document.getElementById('currentMeal');
        currentMeal.innerHTML = `
            <img src="${imageUrl}" style="max-width: 300px; border-radius: 10px;">
            <h2>📊 Nährwerte</h2>
            <div><strong>Gericht:</strong> ${result.name}</div>
            <div><strong>Kalorien:</strong> ${result.kalorien} kcal</div>
            <div><strong>Protein:</strong> ${result.protein} g</div>
            <div><strong>Kohlenhydrate:</strong> ${result.kohlenhydrate} g</div>
            <div><strong>Fett:</strong> ${result.fett} g</div>
            <div><strong>Ballaststoffe:</strong> ${result.ballaststoffe} g</div>
            <div><strong>Zucker:</strong> ${result.zucker} g</div>
        `;
        
        currentStatus.textContent = '✅ Analyse abgeschlossen!';
    } catch (error) {
        console.error(error);
        document.getElementById('currentStatus').textContent = '❌ Fehler: ' + error.message;
    }
}

// ========== 3. GROQ-API-AUFRUF ==========
async function callOpenAiVision(prompt, imageUrl) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + GROQ_API_KEY
        },
        body: JSON.stringify({
            model:  "llama-3.2-11b-vision-preview",
            response_format: { type: "json_object" },
            max_tokens: 1000, 
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageUrl
                            }
                        }
                    ]
                }
            ]
        })
    });
    
    if (!response.ok) {
        const errText = await response.text();
        throw new Error("Groq Fehler: " + response.status + " - " + errText);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    return typeof content === "string" ? JSON.parse(content) : content;
}

async function fileToImageURL(file) {
    const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => {
            const base64Data = reader.result.split(",")[1];
            resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
    
    return `data:${file.type};base64,${base64String}`;
}
window.analyzePhoto= analyzePhoto;
