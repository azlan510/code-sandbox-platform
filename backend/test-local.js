async function testLocalServer() {
  try {
    const response = await fetch("http://localhost:5000/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        source_code: "console.log('Zero APIs. Zero Paywalls. Executed directly on our own engine!');",
        language: "javascript" 
      })
    });

    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Output:\n", data.output);
    
  } catch (error) {
    console.error("Local Error:", error.message);
  }
}

testLocalServer();