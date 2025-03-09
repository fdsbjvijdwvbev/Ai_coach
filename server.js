// // // const express = require("express");
// // // const cors = require("cors");
// // // const dotenv = require("dotenv");
// // // const WebSocket = require("ws");
// // // const { SpeechClient } = require("@google-cloud/speech");

// // // dotenv.config();

// // // const app = express();
// // // const PORT = process.env.PORT || 5001;
// // // const WS_PORT = 5002; // WebSocket server port

// // // app.use(cors());
// // // app.use(express.json());

// // // // Initialize Google Cloud Speech Client
// // // const speechClient = new SpeechClient();

// // // // Start WebSocket server
// // // const wss = new WebSocket.Server({ port: WS_PORT }, () => {
// // //     console.log(`🚀 WebSocket server running on ws://localhost:${WS_PORT}`);
// // // });

// // // wss.on("connection", (ws) => {
// // //     console.log("📡 Client connected for live transcription");

// // //     // Configure Google Speech-to-Text streaming
// // //     const recognizeStream = speechClient
// // //         .streamingRecognize({
// // //             config: {
// // //                 encoding: "LINEAR16",
// // //                 sampleRateHertz: 16000,
// // //                 languageCode: "en-US",
// // //                 interimResults: true, // Sends real-time partial transcriptions
// // //             },
// // //             interimResults: true,
// // //         })
// // //         .on("error", (err) => {
// // //             console.error("❌ Google Speech-to-Text Error:", err);
// // //             ws.send(JSON.stringify({ error: "Speech recognition failed" }));
// // //         })
// // //         .on("data", (data) => {
// // //             if (data.results[0]?.alternatives[0]) {
// // //                 const transcript = data.results[0].alternatives[0].transcript;
// // //                 console.log("📝 Transcribed Text:", transcript);
// // //                 ws.send(JSON.stringify({ text: transcript })); // Send to Flutter
// // //             }
// // //         });

// // //         ws.on("message", (message) => {
// // //             const data = JSON.parse(message);
        
// // //             if (data.event === "start") {
// // //                 console.log("🎤 Starting transcription...");
// // //             } else if (data.event === "audio") {
// // //                 console.log("🎧 Audio received:", data.audio);  // Check if audio data is received
// // //                 recognizeStream.write(Buffer.from(data.audio, "base64"));
// // //             } else if (data.event === "stop") {
// // //                 console.log("🛑 Stopping transcription...");
// // //                 recognizeStream.end();
// // //             }
// // //         });
        

// // //     ws.on("close", () => {
// // //         console.log("🔴 Client disconnected");
// // //         recognizeStream.end();
// // //     });
// // // });

// // // // Start Express server
// // // app.listen(PORT, () => {
// // //     console.log(`🚀 HTTP Server running on http://localhost:${PORT}`);
// // // });


// // const fs = require("fs"); // For file system operations
// // const WebSocket = require("ws");

// // const WS_PORT = 5002; // WebSocket server port

// // // Start WebSocket server
// // const wss = new WebSocket.Server({ port: WS_PORT }, () => {
// //     console.log(`🚀 WebSocket server running on ws://localhost:${WS_PORT}`);
// // });

// // wss.on("connection", (ws) => {
// //     console.log("📡 Client connected for live audio");

// //     // Open a writable stream to save the received audio data
// //     const audioFile = fs.createWriteStream("received_audio.wav", { flags: "a" });

// //     ws.on("message", (message) => {
// //         const data = JSON.parse(message);

// //         if (data.event === "audio") {
// //             console.log("🎧 Audio received:", data.audio); // Log the audio data
// //             const audioBuffer = Buffer.from(data.audio, "base64");
            
// //             // Save the audio buffer to the file
// //             audioFile.write(audioBuffer);
// //         } else if (data.event === "stop") {
// //             console.log("🛑 Stopping audio recording...");
// //             audioFile.end(); // Close the file stream when stop event is received
// //         }
// //     });

// //     ws.on("close", () => {
// //         console.log("🔴 Client disconnected");
// //         audioFile.end(); // Ensure file stream is closed on WebSocket disconnect
// //     });
// // });

// // // Start WebSocket server
// // wss.on("listening", () => {
// //     console.log(`🚀 WebSocket server listening on ws://localhost:${WS_PORT}`);
// // });

// const express = require("express");
// const WebSocket = require("ws");
// const speech = require("@google-cloud/speech");
// const fs = require("fs");
// const dotenv = require("dotenv");

// dotenv.config(); // Load Google Cloud credentials from .env

// const app = express();
// const PORT = 5001;
// const WSS_PORT = 5002; // WebSocket Server Port

// // ✅ Initialize Google Cloud Speech Client
// const client = new speech.SpeechClient({
//   keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, // Set in .env
// });

// // ✅ WebSocket Server for Live Audio Streaming
// const wss = new WebSocket.Server({ port: WSS_PORT });

// wss.on("connection", (ws) => {
//   console.log("📡 Client connected for live transcription");

//   let recognizeStream = null;

//   ws.on("message", async (message) => {
//     const data = JSON.parse(message);

//     if (data.event === "start") {
//       console.log("🎤 Starting Google Cloud Speech-to-Text");

//       // ✅ Create Google Cloud Speech Recognizer Stream
//       recognizeStream = client
//         .streamingRecognize({
//           config: {
//             encoding: "LINEAR16",
//             sampleRateHertz: 16000,
//             languageCode: "en-US",
//             interimResults: true, // Send partial results
//           },
//         })
//         .on("data", (response) => {
//           const transcript = response.results
//             .map((result) => result.alternatives[0].transcript)
//             .join("\n");

//           console.log("📝 Transcribed:", transcript);
//           ws.send(JSON.stringify({ text: transcript })); // Send back to Flutter
//         })
//         .on("error", (err) => {
//           console.error("❌ Google Speech Error:", err);
//           ws.send(JSON.stringify({ error: "Transcription error" }));
//         });

//     } else if (data.event === "audio") {
//       if (recognizeStream) {
//         const audioBuffer = Buffer.from(data.audio, "base64");
//         recognizeStream.write(audioBuffer);
//       }

//     } else if (data.event === "stop") {
//       console.log("🔴 Stopping transcription");
//       if (recognizeStream) {
//         recognizeStream.end();
//       }
//     }
//   });

//   ws.on("close", () => {
//     console.log("🔴 Client disconnected");
//     if (recognizeStream) {
//       recognizeStream.end();
//     }
//   });
// });

// // ✅ Start Express Server
// app.listen(PORT, () => {
//   console.log(`🚀 Express Server running on http://localhost:${PORT}`);
//   console.log(`📡 WebSocket Server running on ws://localhost:${WSS_PORT}`);
// });

// const fs = require("fs");
// const path = require("path");
// const WebSocket = require("ws");
// const express = require("express");

// const app = express();
// const PORT = 3000;
// const AUDIO_DIR = path.join(__dirname, "audio");
// const server = app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });

// // ✅ Ensure audio directory exists
// if (!fs.existsSync(AUDIO_DIR)) {
//   fs.mkdirSync(AUDIO_DIR, { recursive: true });
// }

// const wss = new WebSocket.Server({ server });
// console.log("🟢 WebSocket Server Started...");

// wss.on("connection", (ws) => {
//   console.log("🔗 New WebSocket Connection Established");

//   let audioBuffer = [];
//   let audioFilePath = path.join(AUDIO_DIR, `audio_${Date.now()}.wav`);

//   ws.on("message", (message) => {
//     try {
//       const data = JSON.parse(message);

//       if (data.event === "audio" && data.audio) {
//         const audioChunk = Buffer.from(data.audio, "base64");
//         audioBuffer.push(audioChunk);
//       }

//       if (data.event === "stop") {
//         if (audioBuffer.length > 0) {
//           const pcmData = Buffer.concat(audioBuffer);
//           const wavData = encodeWAV(pcmData, 16000, 1); // ✅ Convert PCM to WAV
//           fs.writeFileSync(audioFilePath, wavData);
//           console.log(`✅ Audio saved: ${audioFilePath}`);
//         }
//         audioBuffer = [];
//       }
//     } catch (error) {
//       console.error("❌ Error processing message:", error);
//     }
//   });

//   ws.on("close", () => {
//     console.log("❌ WebSocket Disconnected");
//   });

//   ws.on("error", (error) => {
//     console.error("❌ WebSocket Error:", error);
//   });
// });

// // ✅ Function to Convert PCM to WAV
// function encodeWAV(pcmData, sampleRate, numChannels) {
//   const header = Buffer.alloc(44);

//   // RIFF Header
//   header.write("RIFF", 0);
//   header.writeUInt32LE(36 + pcmData.length, 4);
//   header.write("WAVE", 8);

//   // fmt Subchunk
//   header.write("fmt ", 12);
//   header.writeUInt32LE(16, 16);
//   header.writeUInt16LE(1, 20);
//   header.writeUInt16LE(numChannels, 22);
//   header.writeUInt32LE(sampleRate, 24);
//   header.writeUInt32LE(sampleRate * numChannels * 2, 28);
//   header.writeUInt16LE(numChannels * 2, 32);
//   header.writeUInt16LE(16, 34);

//   // data Subchunk
//   header.write("data", 36);
//   header.writeUInt32LE(pcmData.length, 40);

//   return Buffer.concat([header, pcmData]);
// }

const WebSocket = require("ws");
const express = require("express");
const speech = require("@google-cloud/speech");
const axios = require("axios");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
const db = mysql.createConnection({
    host: "localhost", // Change if using a remote database
    user: "root",
    password: "", // Change to your DB password
    database: "ai_coach" // Change to your DB name
});

// ✅ API to Get 4 Random Topics
app.get("/api/topics", (req, res) => {
    db.query("SELECT name, icon_svg FROM topics ORDER BY RAND() LIMIT 4", (err, results) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});


const wss = new WebSocket.Server({ server });
console.log("🟢 WebSocket Server Started...");

// ✅ Google Cloud Speech Client
const client = new speech.SpeechClient({
    keyFilename: "/Users/udula/Documents/backend/Speech-to-Text-Test.json",
});

// ✅ Mistral AI API Configuration (STREAMING)
const MISTRAL_API_KEY = "d5F1b9ljF9HUg1PfL8GzOrHV70gF59jm"; // Replace with actual API key
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

// ✅ Default AI Role
let roleDescription = "a helpful assistant";

// ✅ Google Speech-to-Text Configuration
const requestConfig = {
    config: {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: "en-US",
    },
    interimResults: true,
};

// ✅ Function to handle user speech


// ✅ Function to stream AI response from Mistral API
// Update the streamAIResponse function in your backend code
// Update the streamAIResponse function in your backend
async function streamAIResponse(ws, userMessage) {
    console.log(`🤖 Sending to AI: ${userMessage}`);
    
    try {
        const response = await axios.post(
            MISTRAL_API_URL,
            {
                model: "mistral-tiny",
                messages: [
                    { role: "system", content: `You are ${roleDescription}. Stay in character and respond professionally.` },
                    { role: "user", content: userMessage },
                ],
                stream: true,
            },
            {
                headers: {
                    "Authorization": `Bearer ${MISTRAL_API_KEY}`,
                    "Content-Type": "application/json",
                },
                responseType: "stream",
            }
        );

        let fullResponse = "";

        response.data.on("data", (chunk) => {
            const lines = chunk.toString().split("\n");
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine || trimmedLine === "data: [DONE]") continue;
                
                try {
                    if (trimmedLine.startsWith("data: ")) {
                        const jsonStr = trimmedLine.slice(6);
                        const jsonResponse = JSON.parse(jsonStr);
                        const content = jsonResponse.choices[0]?.delta?.content;
                        
                        if (content) {
                            fullResponse += content;
                            // Send the complete response so far
                            ws.send(JSON.stringify({
                                event: "text",
                                text: fullResponse,
                                role: "ai",
                                isComplete: false
                            }));
                        }
                    }
                } catch (error) {
                    console.warn("⚠️ Error parsing line:", error.message);
                }
            }
        });

        response.data.on("end", () => {
            // Send final message with isComplete flag
            ws.send(JSON.stringify({
                event: "text",
                text: fullResponse,
                role: "ai",
                isComplete: true
            }));
            console.log("✅ AI Streaming Complete");
        });

    } catch (error) {
        console.error("❌ AI API Error:", error.response?.data || error.message);
        ws.send(JSON.stringify({ 
            event: "text", 
            text: "Sorry, I encountered an error while processing your request.", 
            role: "ai",
            isComplete: true
        }));
    }
}

// Update the handleUserSpeech function
async function handleUserSpeech(ws, transcript) {
    console.log(`📝 User Transcription: ${transcript}`);
    ws.send(JSON.stringify({ 
        event: "text", 
        text: transcript, 
        role: "user",
        isComplete: true // User messages are always complete
    }));

    // Send to AI
    streamAIResponse(ws, transcript);
}




// ✅ WebSocket Server
wss.on("connection", (ws) => {
    console.log("🔗 New WebSocket Connection Established");
    let recognizeStream = null;

    ws.on("message", async (message) => {
        try {
            const data = JSON.parse(message);

            if (data.event === "setRole") {
                roleDescription = data.role;
                console.log(`🎭 AI Role Set To: ${roleDescription}`);
                return;
            }

            if (data.event === "start") {
                console.log("🎤 Starting Speech Recognition...");

                if (recognizeStream) {
                    recognizeStream.end();
                    recognizeStream = null;
                }

                recognizeStream = client.streamingRecognize(requestConfig)
                    .on("error", (error) => {
                        console.error("❌ Google Speech Error:", error);
                        if (recognizeStream) {
                            recognizeStream.destroy();
                        }
                        recognizeStream = null;
                    })
                    .on("data", (response) => {
                        console.log("🎤 Google Speech Data:", JSON.stringify(response, null, 2));
                    
                        if (response.results[0]?.isFinal) { // ✅ Process only final results
                            const transcript = response.results[0].alternatives[0]?.transcript;
                            if (transcript) {
                                handleUserSpeech(ws, transcript);
                            }
                        }
                    });
                    
                    
            }

            if (data.event === "audio" && data.audio) {
                const audioChunk = Buffer.from(data.audio, "base64");
                if (recognizeStream && !recognizeStream.destroyed) {
                    recognizeStream.write(audioChunk);
                } else {
                    console.warn("⚠️ Audio received, but no active recognizeStream.");
                }
            }

            if (data.event === "stop") {
                console.log("🛑 Stopping Speech Recognition...");
                if (recognizeStream) {
                    recognizeStream.end();
                    recognizeStream = null;
                }
            }

        } catch (error) {
            console.error("❌ Error processing message:", error);
        }
    });

    ws.on("close", () => {
        console.log("❌ WebSocket Disconnected");
        if (recognizeStream) {
            recognizeStream.end();
            recognizeStream = null;
        }
    });

    ws.on("error", (error) => {
        console.error("❌ WebSocket Error:", error);
    });
});