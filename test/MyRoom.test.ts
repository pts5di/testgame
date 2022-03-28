import assert from "assert";
import { ColyseusTestServer, boot } from "@colyseus/testing";
import incantengine from "../src/incantengine";
import { State } from "../src/rooms/MyRoom";
// import your "arena.config.ts" file here.
import appConfig from "../src/arena.config";

describe("testing your Colyseus app", () => {
  let colyseus: ColyseusTestServer;

  before(async () => (colyseus = await boot(appConfig)));
  after(async () => colyseus.shutdown());

  beforeEach(async () => await colyseus.cleanup());

  it("connecting into a room", async () => {
    // `room` is the server-side Room instance reference.
    const room = await colyseus.createRoom<State>("battle_room", {});

    // `client1` is the client-side `Room` instance reference (same as JavaScript SDK)
    const client1 = await colyseus.connectTo(room);

    // make your assertions
    assert.strictEqual(client1.sessionId, room.clients[0].sessionId);

    // wait for state sync
    await room.waitForNextPatch();

    assert.deepStrictEqual(client1.state.toJSON(), {
      players: { [client1.sessionId]: { health: 100 } },
      spells: ["rock bolt", "paper bolt"],
    });
  });
  it("casts a spell correctly", async () => {
    const room = await colyseus.createRoom<State>("battle_room", {});

    const clientRoom = await colyseus.connectTo(room);

    assert.strictEqual(clientRoom.sessionId, room.clients[0].sessionId);

    await room.waitForNextPatch();

    room.onMessage("farts", (client) => room.send(client, "piss", "butts"));

    clientRoom.send("farts");

    const result = await clientRoom.waitForMessage("piss");

    assert.equal(result, "butts");
  });
});
