import type { GraphCredentials } from "../types";

const configs = new Map<string, GraphCredentials>();

export function storeConfig(configId: string, credentials: GraphCredentials) {
    configs.set(configId, credentials);
}

export function getConfig(configId: string) {
    return configs.get(configId);
}

export function removeConfig(configId: string) {
    configs.delete(configId);
}