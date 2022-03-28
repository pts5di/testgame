import { Room, Client } from "colyseus";
import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";
import Incantengine, { Spell } from "../incantengine";
import spells from "../incantengine/spells.json";

export class Player extends Schema {
  @type("number") health: number = 100;
  @type("string") name: string;
  @type("string") currentSpell: string;
}

export class ActiveSpell extends Schema {
  // string that matches the spell incantation,
  // if we pass this to incantengine.cast(...) it should return the correct spellInfo
  @type("string") spellName: string;

  // the sessionId of the player that cast this spell
  @type("string") caster: string;

  // the clock.elapsedTime when the spell was cast
  @type("number") castStartTime: number;

  // the clock.elapsedTime when the spell should take effect
  @type("number") castFinishTime: number;
}

export class State extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();
  @type(["string"])
  spells = new ArraySchema<string>();
  @type([ActiveSpell])
  activeSpells = new ArraySchema<ActiveSpell>();
  @type("number") elapsedTime = 0;
}
export class WizardBattleRoom extends Room<State> {
  incantengine = new Incantengine(spells);

  onCreate(options: any) {
    this.setState(new State());
    this.state.spells = new ArraySchema(...this.incantengine.getAllSpells());
    this.clock.start();
    this.clock.setInterval(() => {
      const currentTime = this.clock.elapsedTime;
      //TODO: iterate over state.activeSpells, and if a spell is finished, remove it from state.activeSpells and do its effect
      for (let i = 0; i < this.state.activeSpells.length; i++) {
        const spell = this.state.activeSpells[i];
        const spellInfo = this.incantengine.cast(spell.spellName);
        if (currentTime >= spell.castFinishTime) {
          const opponent = this.getOpponentFromId(spell.caster);
          opponent.health -= spellInfo.baseDamage;
          this.state.activeSpells.deleteAt(i);
          i--;
        }
      }
      this.state.elapsedTime = currentTime;
    }, 0);

    this.onMessage("spellInProgress", (client, message) => {
      const player = this.getPlayer(client);
      player.currentSpell = message.currentSpell;
      // if (this.incantengine.validate(message)) {
      //   let userSpell = this.incantengine.cast(message);
      // }
      // else
    });
    this.onMessage("spellCast", (client) => {
      const player = this.getPlayer(client);
      if (this.incantengine.validate(player.currentSpell)) {
        const spell = this.incantengine.cast(player.currentSpell);
        //TODO: add a new ActiveSpell to state.activeSpells array (be sure to set all of the new ActiveSpell's properties)
        const newActiveSpell = new ActiveSpell();
        newActiveSpell.castStartTime = this.clock.elapsedTime;
        newActiveSpell.castFinishTime =
          this.clock.elapsedTime + spell.castTime * 1000;
        newActiveSpell.caster = client.sessionId;
        newActiveSpell.spellName = player.currentSpell;

        this.state.activeSpells.push(newActiveSpell);
      }

      player.currentSpell = "";
    });
  }

  getPlayer(client: Client) {
    return this.getPlayerFromId(client.sessionId);
  }

  getPlayerFromId(clientSessionId: string) {
    return this.state.players.get(clientSessionId);
  }

  getOpponent(client: Client) {
    return this.getOpponentFromId(client.sessionId);
  }

  getOpponentFromId(clientSessionId: string) {
    let opponentId: string | null = null;
    for (const key of this.state.players.keys()) {
      if (key != clientSessionId) {
        if (!!opponentId) {
          throw `More than one opponent. Tried to set opponentId but opponentId is already set to ${opponentId}`;
        }
        opponentId = key;
      }
    }
    return this.state.players.get(opponentId);
  }

  onJoin(client: Client, options: any) {
    console.log(`Player ${options.name} (${client.sessionId}) joined!`);
    const player = new Player();
    player.name = options.name;
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
