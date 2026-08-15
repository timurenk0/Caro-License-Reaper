import { describe, expect, it } from "vitest" 
import { GraphCredentials } from "../../src/types"
import { getConfig, storeConfig } from "../../src/services/config-store.service";


describe("pending config storage", () => {
    it("should register and retrieve a pending config", () => {
        const config: GraphCredentials = {
            TENANT_ID: "test-tenant-id",
            CLIENT_ID: "test-client-id",
            CLIENT_SECRET: "test-client-secret"
        }; 

        storeConfig("config-1", config);

        const result = getConfig("config-1");
        
        expect(result).toEqual(config);
    });
})