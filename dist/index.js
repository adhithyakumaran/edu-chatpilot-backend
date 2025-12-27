"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./db"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const actions_routes_1 = __importDefault(require("./routes/actions.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const course_routes_1 = __importDefault(require("./routes/course.routes")); // Import
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
// Routes
app.use('/api/user', user_routes_1.default);
app.use('/api/actions', actions_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/courses', course_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
const mentor_routes_1 = __importDefault(require("./routes/mentor.routes"));
app.use('/api/mentor', mentor_routes_1.default);
// Uptime Endpoint
app.get('/ping', (req, res) => {
    res.status(200).send('Pong ðŸ“');
});
// Health Check
app.get('/', (req, res) => {
    res.send('ChatPilot Education API is Running ðŸš€');
});
// Database Check
app.get('/db-check', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.default.$connect();
        res.json({ status: 'Connected to Database' });
    }
    catch (error) {
        res.status(500).json({ status: 'Database Connection Failed', error });
    }
}));
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop');
});
process.on('exit', (code) => {
    console.log(`Process exiting with code: ${code}`);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
