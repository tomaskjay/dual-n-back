import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
    region: process.env.REACT_APP_AWS_REGION,
    credentials: {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY!,
    }
});

export const authenticateUser = async (email: string, password: string) => {
    try {
        const command = new GetCommand({
            TableName: "gameBuilder",
            Key: {
                email: email
            }
        });

        const response = await client.send(command);
        const user = response.Item;

        if (!user) {
            throw new Error('User not found');
        }

        if (user.password !== password) {
            throw new Error('Invalid password');
        }

        // Return user data (excluding sensitive information)
        return {
            email: user.email,
            name: user.name,
            createdAt: user.createdAt
        };
    } catch (err) {
        console.error('Authentication error:', err);
        throw err;
    }
}