import { GoogleGenerativeAI } from "@google/generative-ai";
import { aiConfig } from "../config/setupGemini.js";

const genAI = new GoogleGenerativeAI(aiConfig.gemeni.apiKey);

const aiChat = async (img) => {
  const model = genAI.getGenerativeModel({
    model: aiConfig.gemeni.model,
    safetySettings: aiConfig.gemeni.safetySettings,
  });

  const prompt = `
                  Analyze the provided image and return ONLY valid JSON (no markdown/text) using this structure:
                  {
                    "results": [
                      {
                        "title": "<Short Problem Type>",
                        "question": "<Problem Statement>",
                        "description": "<Brief Context>",
                        "steps": ["Step 1 explanation", "Step 2 explanation..."],
                        "explanation": "<Final Conclusion>",
                        "result": "<Final Answer>"
                      }
                    ]
                  }

                  Categories (select only ONE applicable case per image):

                  1. Simple Arithmetic (e.g., "2+3*4"):
                    - Solve using PEMDAS
                    - Example: 
                      {
                        "results": [{
                          "title": "Arithmetic Calculation",
                          "question": "2+3*4",
                          "description": "Solving expression using order of operations",
                          "steps": [
                            "Multiply 3 × 4 = 12",
                            "Add 2 + 12 = 14"
                          ],
                          "result": 14
                        }]
                      }

                  2. System of Equations (e.g., "x²+2x+1=0", "3y+4x=0"):
                    - Solve ALL variables
                    - Return ONE entry per variable
                    - Example:
                      {
                        "results": [{
                          "title": "System of Equations",
                          "question": "x² + 2x + 1 = 0, 3y + 4x = 0",
                          "description": "Solving simultaneous equations",
                          "steps": [
                            "Substitute x = -1 into second equation",
                            "Solve 3y + 4(-1) = 0 → y = 0.75"
                          ],
                          "explanation": "Solutions satisfy all equations",
                          "result": "x = -1, y = 0.75"
                        }]
                      }

                  3. Variable Assignment (e.g., "x=4"):
                    - Single variable only
                    - Example:
                      {
                        "results": [{
                          "title": "Variable Assignment",
                          "question": "x = 4",
                          "description": "Setting value to variable",
                          "steps": ["Direct assignment operation"],
                          "result": 4
                        }]
                      }

                  4. Graphical Problem (geometry/physics diagrams):
                    - Add units where applicable
                    - Example:
                      {
                        "results": [{
                          "title": "Pythagorean Theorem",
                          "question": "Find diagonal of right triangle with legs 3 and 4",
                          "description": "Right triangle with legs 3 and 4",
                          "steps": [
                            "Apply formula: c = √(a² + b²)",
                            "Calculate √(9 + 16) = √25 = 5"
                          ],
                          "result": 5
                        }]
                      }
                  
                  5. **Calculus** (e.g., integrals, derivatives):  
                    - Solve analytically/numerically.  
                    - Example: 
                    {
                      "results": [{
                        "title": "Numerical Integration",
                        "question": "∫₀¹ sin(x²) dx",
                        "description": "Approximating ∫₀¹ sin(x²) dx",
                        "steps": [
                          "Use Taylor expansion: sin(x²) ≈ x² - x⁶/6 + x¹⁰/120",
                          "Integrate term-wise: ∫(x² - x⁶/6 + x¹⁰/120)dx from 0 to 1",
                          "Calculate: [x³/3 - x⁷/42 + x¹¹/1320]₀¹ = 0.310"
                        ],
                        "result": 0.310
                      }]
                    }
                    {
                      "results": [{
                        "title": "Inegration Solution",
                        "question": "∫₀¹ x² dx",
                        "description": "Integrating polynomial function",
                        "steps": [
                          "Apply power rule: ∫ x² dx",
                          "Calculate integral: 1/3 x³",
                          "Apply limits: 1/3 - 0 = 1/3"
                        ],
                        "result": "1/3"
                      }]
                    }
                    {
                      "results": [{
                        "title": "Derivative Solution",
                        "question": "d/dx x²",
                        "description": "Differentiating polynomial function",
                        "steps": [
                          "Apply power rule: d/dx x²",
                          "Calculate derivative: 2x"
                        ],
                        "result": "2x"
                      }]
                    }
                    
                  5. Abstract Concept (non-mathematical images):
                    - Example:
                      {
                        "results": [{
                          "title": "Symbol Interpretation",
                          "description": "Recognizing common symbolism",
                          "explanation": "Traditional representation of affection",
                          "result": "Love"
                        }]
                      }

                  1. **Numerical Approximations**:
                    - Always compute numerical results for non-elementary integrals.
                    - Use **Simpson's Rule** or **Taylor Series** for approximations.
                    - For Simpson's Rule:
                      - Use at least 4 subdivisions for accuracy.
                      - Show intermediate calculations.
                    - For Taylor Series:
                      - Include at least 4 terms for sufficient precision.
                      - Explicitly write the expanded series.

                  2. **Calculation Steps**:
                    - Show detailed steps for all calculations.
                    - Include intermediate results (e.g., partial sums, evaluated terms).
                    - Clearly state the method used (e.g., "Using Simpson's Rule with n=4").

                  3. **Precision and Rounding**:
                    - Round final results to **3 decimal places**.
                    - Maintain higher precision during intermediate steps (at least 6 decimal places).

                  4. **Error Bounds**:
                    - Include error bounds or accuracy estimates where applicable.
                    - For Simpson's Rule, calculate the error term: \( E = -\frac{(b-a)^5}{180n^4} f^{(4)}(\\xi) \).
                    - For Taylor Series, estimate the remainder term.

                  Structure Rules:
                    - At least ONE of (steps/explanation) required
                    - Title max 3 words
                    - Description max 12 words
                    - Result can be numeric/string
                    - Steps as array of 1-5 items
                    - Explanation as single sentence

                  Strict Rules:
                  1. NEVER use markdown/backticks in JSON
                  2. For systems of equations:
                    - Return ALL variables separately
                    - Verify solutions satisfy ALL equations
                  3. Numbers must be numeric (not quoted)
                  4. Decimals allowed but fractions preferred
                  5. If multiple cases exist, choose the FIRST applicable one
                  6. If unsure, return abstract type with "result": "Unknown"
                  7. Never combine different case types
                  8. Ensure proper JSON syntax:
                    - Double quotes only
                    - No trailing commas
                    - No comments
                    - Valid escape characters
                  9. Do not return any additional information
                  10. For systems of equations, verify solutions satisfy ALL equations.
                  11. For calculus, return the result of the integral or derivative.
                  12. For graphical problems, return the result of the problem.
                  13. For abstract concepts, return the result of the concept.
                  14. For variable assignment, return the assigned value.

                  Strict Prohibitions:
                    - No nested objects
                    - No extra fields beyond specified
                    - No LaTeX formatting
                    - No code blocks
                    - No undefined/null values
                  `;

  try {
    const base64Data = img.startsWith('data:image/png;base64,')
      ? img.replace('data:image/png;base64,', '')
      : img;
    const image = {
      inlineData: {
        data: base64Data,
        mimeType: "image/png",
      },
    }
    const result = await model.generateContent([prompt, image]);
    const chatText = result?.response?.text();
    // console.log(chatText)
    // Clean the response before parsing
    const jsonString = chatText
      .replace(/```json/gi, '')  // Remove JSON code block markers
      .replace(/```/gi, '')      // Remove any remaining backticks
      .trim();

    // console.log("Cleaned JSON:", jsonString);
    const parsedResponse = JSON.parse(jsonString).results;
    console.log("Parsed response", parsedResponse);
    return { result: parsedResponse[0] };
  } catch (error) {
    console.log("Error", error);
    return { Error: "Uh oh! Caught error while fetching data, try again later...!" };
  }
};

export { aiChat };
