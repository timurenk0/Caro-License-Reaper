import { ClientSecretCredential } from "@azure/identity";
import { GraphCredentials } from "../types";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { Client } from "@microsoft/microsoft-graph-client";

export function createGraphClient(credentials: GraphCredentials) {
    const tokenCredential = new ClientSecretCredential(credentials.TENANT_ID, credentials.CLIENT_ID, credentials.CLIENT_SECRET);
    const authProvider = new TokenCredentialAuthenticationProvider(tokenCredential, { scopes: ["https://graph.microsoft.com/.default"] });

    return Client.initWithMiddleware({
        authProvider
    });
}