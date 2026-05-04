const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function analyzeSentiment(text) {
  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Analiza el sentimiento del siguiente texto y proporciona:
1. La polaridad general (positivo, negativo, neutral)
2. Una puntuación de sentimiento de -1 (muy negativo) a 1 (muy positivo)
3. Las emociones detectadas
4. Una explicación breve del análisis

Texto a analizar: "${text}"

Responde en formato JSON con las siguientes claves: polaridad, puntuacion, emociones (array), explicacion`,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Extract JSON from the response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return {
    polaridad: "error",
    puntuacion: 0,
    emociones: [],
    explicacion: responseText,
  };
}

async function main() {
  console.log("🎭 Bot de Análisis de Sentimiento");
  console.log("================================");
  console.log(
    "Utiliza Claude para analizar sentimientos en textos en español.\n"
  );

  const examples = [
    "¡Me encanta este producto! Es increíble y superó mis expectativas.",
    "El servicio fue terrible, estoy muy decepcionado con la experiencia.",
    "El clima está nublado hoy.",
    "No puedo creer cuánto me aman mis amigos, son lo mejor que me pasó.",
    "Esto es lo peor que he visto en mi vida, estoy furioso.",
  ];

  console.log("Analizando ejemplos de sentimiento...\n");

  for (const exampleText of examples) {
    console.log(`📝 Texto: "${exampleText}"`);

    const analysis = await analyzeSentiment(exampleText);

    console.log(`   Polaridad: ${analysis.polaridad}`);
    console.log(`   Puntuación: ${analysis.puntuacion}`);
    console.log(`   Emociones: ${analysis.emociones.join(", ")}`);
    console.log(`   Explicación: ${analysis.explicacion}`);
    console.log("---");
  }

  console.log("\n¿Deseas analizar tu propio texto? (s/n)");
  const response = await prompt("> ");

  if (response.toLowerCase() === "s" || response.toLowerCase() === "si") {
    while (true) {
      const userText = await prompt(
        "\nIngresa un texto para analizar (o 'salir' para terminar):\n> "
      );

      if (userText.toLowerCase() === "salir") {
        break;
      }

      if (userText.trim()) {
        console.log("\nAnalizando tu texto...");
        const analysis = await analyzeSentiment(userText);

        console.log(`\n📊 Resultados del análisis:`);
        console.log(`   Polaridad: ${analysis.polaridad}`);
        console.log(`   Puntuación: ${analysis.puntuacion}`);
        console.log(`   Emociones: ${analysis.emociones.join(", ")}`);
        console.log(`   Explicación: ${analysis.explicacion}`);
      }
    }
  }

  console.log("\n¡Gracias por usar el Bot de Análisis de Sentimiento!");
  rl.close();
}

main().catch(console.error);