import axios from "axios";
import mainconfig from "../config/index.js";


const promptGemini = async (promptMessage) => {
  const response = await axios.post(
    mainconfig.gemini.url,
    {
        contents: [
            {
                parts: [
                    {
                        text: promptMessage,
                    },
                ],
            },
        ],
    },
    {
        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": mainconfig.gemini.apiKey,
        },
    }
  );

  return response.data.candidates[0].content.parts[0].text;
};

export default promptGemini;
    
// const promptGemini = async (promptMessage) => {
//   const response = await axios.post(
//     mainconfig.gemini.url,
//     {
//       contents: [
//         {
//           parts: [
//             {
//               text: promptMessage,
//             },
//           ],
//         },
//       ],
//     },
//     {
//       headers: {
//         "x-goog-api-key": mainconfig.gemini.apiKey,
//         "Content-Type": "application/json",
//       },
//     }
//   );

//   return response.data.candidates[0].content.parts[0].text;
// };

// export default promptGemini;