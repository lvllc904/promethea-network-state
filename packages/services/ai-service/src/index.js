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
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { askPrometheaFlow } from './flows/promethea-assistant';
var app = express();
var port = process.env.PORT || 4002;
// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: '10mb' })); // Increase JSON payload limit
// Routes
app.post('/api/ask-promethea', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var input, result, error_1, errorMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                input = req.body;
                // Basic validation
                if (!input || typeof input.query !== 'string' || typeof input.constitutionContent !== 'string') {
                    return [2 /*return*/, res.status(400).json({ error: 'Invalid input. "query" and "constitutionContent" are required.' })];
                }
                return [4 /*yield*/, askPrometheaFlow(input)];
            case 1:
                result = _a.sent();
                res.json(result);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error processing /api/ask-promethea:', error_1);
                errorMessage = error_1 instanceof Error ? error_1.message : 'An unknown error occurred.';
                res.status(500).json({ error: "Failed to get response from AI: ".concat(errorMessage) });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/self-heal', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var selfHealingFlow, result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, import('@promethea/ai')];
            case 1:
                selfHealingFlow = (_a.sent()).selfHealingFlow;
                return [4 /*yield*/, selfHealingFlow(req.body)];
            case 2:
                result = _a.sent();
                res.json(result);
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.error('Error processing /api/self-heal:', error_2);
                res.status(500).json({ error: 'Failed to execute self-healing flow.' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.post('/api/cognitive-heal', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cognitiveHealingFlow, result, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, import('@promethea/ai')];
            case 1:
                cognitiveHealingFlow = (_a.sent()).cognitiveHealingFlow;
                return [4 /*yield*/, cognitiveHealingFlow(req.body)];
            case 2:
                result = _a.sent();
                res.json(result);
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                console.error('Error processing /api/cognitive-heal:', error_3);
                res.status(500).json({ error: 'Failed to execute cognitive-healing flow.' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/health', function (req, res) {
    res.status(200).send('OK');
});
// Start the server
app.listen(port, function () {
    console.log("AI service listening on http://localhost:".concat(port));
});
