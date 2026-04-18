const GEMINI_API_KEY = "AIzaSyAV4MqoKAkkEbYyDN8zkeFDyiMrPxIsZaQ";

async function test() {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "hello" }] }],
        systemInstruction: {
          parts: [{ text: "You are PulseGuard AI" }]
        }
      })
    }
  );
  
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
