import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { assert } from "chai";

describe("private_trading", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  it("loads private trading program in workspace", async () => {
    const program = anchor.workspace.PrivateTrading as Program;
    assert.isDefined(program.programId);
  });
});
