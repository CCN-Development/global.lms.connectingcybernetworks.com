const isProduction = process.env.NODE_ENV === "production";
const environment_variables = {
    api_base_url: isProduction
        ? "https://api.connectingcybernetworks.com"
        : "http://localhost:8000",
    websocket_url: isProduction
        ? "wss://api.connectingcybernetworks.com"
        : "ws://localhost:8000",
    intelligence_url: isProduction
        ? "https://intelligence.connectingcybernetworks.com"
        : "http://localhost:8001",
    link_sharing_domain: isProduction ? "https://connectingcybernetworks.com"
        : "http://localhost:3000",
};
export default environment_variables;
