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
exports.uploadFile = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const s3 = new aws_sdk_1.default.S3({
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
});
const uploadFile = (fileBuffer, fileName, contentType) => __awaiter(void 0, void 0, void 0, function* () {
    if (!BUCKET_NAME)
        throw new Error('R2_BUCKET_NAME not defined');
    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: contentType,
        // R2 doesn't support ACLs the same way, usually public read is handled via bucket settings or custom domains
    };
    try {
        const data = yield s3.upload(params).promise();
        // Return the public URL. Needs R2 public domain or similar setup. 
        // For now returning the default endpoint URL structure
        return data.Location || `https://${process.env.R2_PUBLIC_DOMAIN}/${fileName}`;
    }
    catch (error) {
        console.error('R2 Upload Error:', error);
        throw error;
    }
});
exports.uploadFile = uploadFile;
exports.default = s3;
