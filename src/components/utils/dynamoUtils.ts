import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';


const client = new DynamoDBClient({
    region: process.env.REACT_APP_AWS_REGION,
    credentials: {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY!,
    }
});

export const getAllItems = async (tableName: any) => {
    try {
        const command = new ScanCommand({ TableName: tableName });
        const response = await client.send(command);
        return response.Items || [];
    } catch (err) {
        console.error('Error fetching items:', err);
        throw err;
    }
}

export const checkEmailExists = async (tableName: string, email: string) => {
    try {
        const command = new GetCommand({
            TableName: tableName,
            Key: {
                email: email
            }
        });
        const response = await client.send(command);
        return !!response.Item;
    } catch (err) {
        console.error('Error checking email:', err);
        throw err;
    }
}

export const putItem = async (tableName: string, item: any) => {
    try {
        // First check if email exists
        const emailExists = await checkEmailExists(tableName, item.email);
        
        if (emailExists) {
            throw new Error('EmailExistsError');
        }

        const command = new PutCommand({
            TableName: tableName,
            Item: item,
            // Add condition to prevent overwriting existing items
            ConditionExpression: "attribute_not_exists(email)"
        });

        await client.send(command);
        console.log('Item put successfully');
    } catch (err: any) {
        console.error('Error putting item:', err);
        // Convert DynamoDB condition check failure to our custom error
        if (err.name === 'ConditionalCheckFailedException') {
            throw new Error('EmailExistsError');
        }
        throw err;
    }
}