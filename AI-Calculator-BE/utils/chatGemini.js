import { GoogleGenerativeAI } from "@google/generative-ai";
import { aiConfig } from "../config/setupGemini.js";

const genAI = new GoogleGenerativeAI(aiConfig.gemeni.apiKey);

const aiChat = async (dict_of_vars_str, img) => {
  const model = genAI.getGenerativeModel({
    model: aiConfig.gemeni.model,
    safetySettings: aiConfig.gemeni.safetySettings,
  });

  const prompt = `
    You have been given an image with some mathematical expressions, equations, or graphical problems, and you need to solve them.
    Note: Use the PEMDAS rule for solving mathematical expressions. PEMDAS stands for the Priority Order: Parentheses, Exponents, Multiplication and Division (from left to right), Addition and Subtraction (from left to right). Parentheses have the highest priority, followed by Exponents, then Multiplication and Division, and lastly Addition and Subtraction.
    
    For example:
    Q. 2 + 3 * 4
    (3 * 4) => 12, 2 + 12 = 14.
    Q. 2 + 3 + 5 * 4 - 8 / 2
    5 * 4 => 20, 8 / 2 => 4, 2 + 3 => 5, 5 + 20 => 25, 25 - 4 => 21.

    YOU CAN HAVE FIVE TYPES OF EQUATIONS/EXPRESSIONS IN THIS IMAGE, AND ONLY ONE CASE SHALL APPLY EVERY TIME:
    Following are the cases:

    1. Simple mathematical expressions like 2 + 2, 3 * 4, 5 / 6, 7 - 8, etc.: In this case, solve and return the answer in the format of a LIST OF ONE DICT [{"expr": given expression, "result": calculated answer}].

    2. Set of Equations like x^2 + 2x + 1 = 0, 3y + 4x = 0, 5x^2 + 6y + 7 = 12, etc.: In this case, solve for the given variable, and the format should be a COMMA SEPARATED LIST OF DICTS, with dict 1 as {"expr": "x", "result": 2, "assign": true} and dict 2 as {"expr": "y", "result": 5, "assign": true}. This example assumes x was calculated as 2, and y as 5. Include as many dicts as there are variables.

    3. Assigning values to variables like x = 4, y = 5, z = 6, etc.: In this case, assign values to variables and return another key in the dict called {"assign": true}, keeping the variable as "expr" and the value as "result" in the original dictionary. RETURN AS A LIST OF DICTS.

    4. Analyzing Graphical Math problems, which are word problems represented in drawing form, such as cars colliding, trigonometric problems, problems on the Pythagorean theorem, adding runs from a cricket wagon wheel, etc. These will have a drawing representing some scenario and accompanying information with the image. PAY CLOSE ATTENTION TO DIFFERENT COLORS FOR THESE PROBLEMS. You need to return the answer in the format of a LIST OF ONE DICT [{"expr": given expression, "result": calculated answer}].

    5. Detecting Abstract Concepts that a drawing might show, such as love, hate, jealousy, patriotism, or a historic reference to war, invention, discovery, quote, etc. USE THE SAME FORMAT AS OTHERS TO RETURN THE ANSWER, where "expr" will be the explanation of the drawing, and "result" will be the abstract concept.

    Analyze the equation or expression in this image and return the answer according to the given rules:
    Make sure to use extra backslashes for escape characters like \\f -> \\\\f, \\n -> \\\\n, etc.
    Here is a dictionary of user-assigned variables. If the given expression has any of these variables, use its actual value from this dictionary accordingly: ${dict_of_vars_str}.
    DO NOT USE BACKTICKS OR MARKDOWN FORMATTING.
    PROPERLY QUOTE THE KEYS AND VALUES IN THE DICTIONARY FOR EASIER PARSING WITH Python's ast.literal_eval.
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
    const chatResponse = result?.response?.text();
    const parsedResponse = JSON.parse(chatResponse);
    const formattedResponse = parsedResponse.map(answer => ({
      expr: answer.expr,
      result: answer.result.toString(), // Ensure result is a string
      assign: answer.assign ? true : false // Convert to string as per your interface
  }));
    return { result: formattedResponse };
  } catch (error) {
    console.log("Error", error);
    return { Error: "Uh oh! Caught error while fetching data, try again later...!" };
  }
};

export { aiChat };
