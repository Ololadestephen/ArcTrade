import { useEffect } from "react";
import { useToast } from "./useToast";

export function useMatching(program) {
    const { show } = useToast(4000);

    useEffect(() => {
        if (!program) return;

        const listenerId = program.addEventListener("OrderMatched", (event, slot) => {
            console.log("⚡ OrderMatched event caught:", event, slot);
            show("⚡ Order matched privately by Arcium MPC network!");
        });

        return () => {
            program.removeEventListener(listenerId).catch(console.error);
        };
    }, [program, show]);
}
