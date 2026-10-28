// Forwarding module from legacy DOKU to Xendit Gateway
export * from "./xendit";
export {
  createXenditPayment as createDokuDirectPayment,
  generateQrisPayloadString,
} from "./xendit";
