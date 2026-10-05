export default async function handler(req, res) {
 if(req.method !== 'POST'){
   return res.status(405).json({error: 'Method not allowed'});
 }
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey){
  return res.status(500).json({ 
    error: 'Server nicht konfiguriert: GROQ_API_KEY fehlt' 
});
  }
  try{
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
     method: "POST",
     headers:{
       "Content-Type": "application/json",
       "Authorization": ˋBearer ${apiKey}ˋ
     },
     body: JSON.stringify(req.body)
    });
    const data = await response.json();
    if(!response.ok){
      console.error("Groq Fehler", data);
      return res.status(response.status).json({
        error: data.error?.message || "Groq Anfrage fehlgeschlagen"
      });
    }
    res.status(200).json(data)
  } catch (error){
    console.error("Server Fehler:", error);
res.status(500).json({ error: 'Interner Serverfehler' });
  }
}
