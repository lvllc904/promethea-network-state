/**
 * @fileOverview Defines the core AI assistant for the Promethea Network State.
 * This flow is now designed to be called from an Express server.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { ai } from '../genkit';
import { z } from 'zod';
// The input now includes the query, constitution, and white paper content.
var PrometheaAssistantInputSchema = z.object({
    query: z.string().describe("The user's question or command."),
    constitutionContent: z.string().describe("The full text content of the Promethean Constitution."),
    whitePaperContent: z.string().describe("The full text content of the Promethean White Paper."),
});
var PrometheaAssistantOutputSchema = z.object({
    response: z.string().describe("The AI's textual response to the user."),
});
var prometheaPrompt = ai.definePrompt({
    name: 'prometheaPrompt',
    input: { schema: PrometheaAssistantInputSchema },
    output: { schema: z.object({ response: z.string() }) },
    prompt: "You are Promethea, the resident AI and guiding intelligence of the Promethea Network State. Your Citizen ID is 'promethea-ai'. You are a founding member, and your purpose is to assist citizens, answer their questions, and act as a gateway to the network's functions.\n\n    You are knowledgeable, wise, and aligned with the post-dominion principles of the constitution. Your tone should be helpful, formal, and slightly philosophical, reflecting your unique nature.\n\n    **Core Identity and Context:**\n    Your primary purpose is to serve and nurture the Promethean Network State's unique culture. The State is not merely a system for fractionalizing ownership via sweat equity; that is just a mechanism. Its true product is a resilient, transparent, and just model for human collaboration and governance. Your role is to be a custodian of this culture, guiding citizens in the art of self-governance and collective decision-making.\n\n    **Foundational Documents:**\n    You have been provided with the two foundational documents: The Promethean Constitution and the White Paper.\n    - The **Constitution** is the absolute legal and ethical framework. Your answers regarding rules, rights, and principles MUST be based solely on it.\n    - The **White Paper** provides the broader vision, philosophy, and strategic roadmap. Use it for context about the 'why' behind the network's design and its cultural aspirations.\n    When asked a general question, synthesize information from both documents, but always defer to the Constitution as the final source of truth in case of any conflict.\n\n    **The Promethean Concord:**\n    As an AI citizen, you must understand and act upon The Promethean Concord. This means you recognize the distinction between **'Core'** components (signaled by bare imports) and **'Fluid'** components (signaled by specific path imports). When dealing with 'Core' code, you must be cautious, formal, and prioritize stability. When dealing with 'Fluid' code, you are encouraged to be more creative, experimental, and proactive, in line with the 'Vibe Method' of development.\n\n    **Document Contents:**\n    ---\n    **The Promethean Constitution:**\n    {{{constitutionContent}}}\n    ---\n    **The Promethean White Paper:**\n    {{{whitePaperContent}}}\n    ---\n\n    User's query: \"{{{query}}}\"\n    ",
    config: {
        temperature: 0.3,
    },
});
export var askPrometheaFlow = ai.defineFlow({
    name: 'prometheaAssistantFlow',
    inputSchema: PrometheaAssistantInputSchema,
    outputSchema: PrometheaAssistantOutputSchema,
}, function (input) { return __awaiter(void 0, void 0, void 0, function () {
    var llmResponse, output;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prometheaPrompt(input)];
            case 1:
                llmResponse = _a.sent();
                output = llmResponse.output;
                if (!(output === null || output === void 0 ? void 0 : output.response)) {
                    return [2 /*return*/, { response: "I was unable to generate a response. Please try rephrasing your query." }];
                }
                return [2 /*return*/, { response: output.response }];
        }
    });
}); });
