const protocol = window.location.protocol;
const socketHost = import.meta.env.DEV
  ? import.meta.env.VITE_DEV_SOCKET
  : import.meta.env.VITE_PROD_SOCKET;

// raw server
export const apiUrl = import.meta.env.DEV
  ? import.meta.env.VITE_DEV_API
  : import.meta.env.VITE_PROD_API;
// derivative server
export const derivativeUrl = import.meta.env.DEV
  ? import.meta.env.VITE_DERIVATIVE_DEV_API
  : import.meta.env.VITE_DERIVATIVE_PROD_API;

// socket server
export const socketUrl = (protocol === "http:" ? "ws" : "wss") + socketHost;
// peer server
export const peerHost = import.meta.env.DEV
  ? import.meta.env.VITE_DEV_PEER_HOST
  : import.meta.env.VITE_PROD_PEER_HOST;
export const peerPORT = import.meta.env.DEV
  ? import.meta.env.VITE_DEV_PEER_PORT
  : import.meta.env.VITE_PROD_PEER_PORT;
