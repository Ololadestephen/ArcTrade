import { ArcisModule, ArcisValueField, createPacker } from "@arcium-hq/client";
import placeOrderData from "../build/place_order.ts"; // hypothetical check

async function buildArcisPayload() {
    try {
        console.log("Loading arcis module...");
        const rawTypes = placeOrderData;
        console.log(rawTypes);
    } catch (e) {
        console.error(e);
    }
}
buildArcisPayload();
