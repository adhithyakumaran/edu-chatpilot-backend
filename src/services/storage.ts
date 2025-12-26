import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME;

const s3 = new AWS.S3({
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
});

export const uploadFile = async (fileBuffer: Buffer, fileName: string, contentType: string) => {
    if (!BUCKET_NAME) throw new Error('R2_BUCKET_NAME not defined');

    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: contentType,
        // R2 doesn't support ACLs the same way, usually public read is handled via bucket settings or custom domains
    };

    try {
        const data = await s3.upload(params).promise();
        // Return the public URL. Needs R2 public domain or similar setup. 
        // For now returning the default endpoint URL structure
        return data.Location || `https://${process.env.R2_PUBLIC_DOMAIN}/${fileName}`;
    } catch (error) {
        console.error('R2 Upload Error:', error);
        throw error;
    }
};

export default s3;
