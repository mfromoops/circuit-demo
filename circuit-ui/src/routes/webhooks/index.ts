import type { RequestHandler } from "@builder.io/qwik-city";
import cryptojs from "crypto-js";
import { DriverObject, RouteResponse, StopObject } from "~/business-logic/types";
import { CircuitAPI } from "~/business-logic/utils";
import { DirectusClient } from "~/business-logic/utils/directus.utils";
type WebhookEvent = {
  type:
    | "stop.allocated"
    | "stop.out_for_delivery"
    | "stop.attempted_delivery"
    | "test.send_event";
  version: string;
  created: number;
  data: StopObject & { route: RouteResponse };
};

export const onGet: RequestHandler = async ({ json }) => {
  json(200, {
    message: "Webhook received",
  });
  return;
};

export const onPost: RequestHandler = async ({ json, request, env }) => {
  const signature = request.headers.get("circuit-signature");
  if (!signature) {
    json(401, { message: "Signature not found" });
    return;
  }

  const secret = env.get("CICRCUIT_SECRET_KEY") as string;
  const message = await request.text();
  const expectedSignature = cryptojs.HmacSHA256(message, secret).toString();
  const compareResult = safeCompare(expectedSignature, signature);
  if (!compareResult) {
    json(401, { message: "Signature not found" });
    return;
  }

  const data = JSON.parse(message) as WebhookEvent;
  const orderId = data.data.orderInfo?.sellerOrderId;

  if (!orderId) {
    json(401, { message: "Order not found" });
    return;
  }
  const updatedItem = await handleStopAllocated(
    data.type,
    data.data,
    orderId,
    env.get("DIRECTUS_TOKEN") as string,
    env.get("CIRCUIT_API_KEY") as string,
  );
  json(200, {
    message: "Webhook received",
    success: expectedSignature === signature,
    type: data.type,
    data: updatedItem,
  });
  return;
};

function safeCompare(expectedSignature: string, signature: string) {
  const encode = new TextEncoder();
  const encodedExpectedSignature = encode.encode(btoa(expectedSignature));
  const encodedSignature = encode.encode(btoa(signature));

  let difference = -1;
  if (encodedExpectedSignature.byteLength !== encodedSignature.byteLength) {
    difference = 0;
  }

  const length = expectedSignature.length;

  for (let i = 0; i < length; i++) {
    if (encodedExpectedSignature.at(i) !== encodedSignature.at(i)) {
      difference = i;
    }
  }

  return difference === -1;
}

async function handleStopAllocated(
  type: WebhookEvent["type"],
  data: WebhookEvent["data"],
  orderId: string,
  directusToken: string,
  circuitAPIKey: string,
) {
  if (type === "stop.attempted_delivery") {
    const order = await new DirectusClient(directusToken).getOrder(orderId);
    const signatures = JSON.parse(
      order.signature_url ?? JSON.stringify([]),
    ) as string[];
    let pictures = JSON.parse(
      order.pictures_urls ?? JSON.stringify([]),
    ) as string[];
    if (data.deliveryInfo.signatureUrl) {
      signatures.push(data.deliveryInfo.signatureUrl);
    }
    if (data.deliveryInfo.photoUrls) {
      pictures = pictures.concat(data.deliveryInfo.photoUrls);
    }
    if (data.route.driver && data.id) {
      const driver = (await new CircuitAPI(circuitAPIKey).getDriver(
        data.route.driver,
      )) as DriverObject;
      const directusClient = new DirectusClient(directusToken);
      await directusClient.saveDriverOrder(
        orderId,
        driver.email,
        data.route.driver,
        data.id,
        data.route.state.startedAt,
        data.deliveryInfo.attemptedAt,
      );
      await new DirectusClient(directusToken).setSignatureAndPictures(
        orderId,
        JSON.stringify(signatures),
        JSON.stringify(pictures),
      );
    }
  }
}
