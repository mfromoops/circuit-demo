export function BasicAuthentication(user: string, password: string) {
    return "Basic " + btoa(user + ":" + password);
}
export * from './maps.utils';
export * from './circuit.utils';