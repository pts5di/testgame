import { default as Incantengine, Spell } from "../../src/incantengine";
import assert from "assert";

describe("Incantengine", () => {
  it("validates", () => {
    //arrange
    const ie = new Incantengine();

    //act
    const actual = ie.validate("rock bolt");

    //assert
    assert.equal(actual, true);
  });
  it("validatesn't", () => {
    //arrange
    const ie = new Incantengine();

    //act
    const actual = ie.validate("bock rolt");

    //assert
    assert.equal(actual, false);
  });
  it("casts", () => {
    const ie = new Incantengine();

    const casttest = ie.cast("rock bolt");

    const realSpell = {
      element: "rock",
      type: "attack",
      baseDamage: 10,
      castTime: 10,
    };

    assert.deepEqual(casttest, realSpell);
  });
  it("castsn't", () => {
    const ie = new Incantengine();

    const casttest = ie.cast("bock rolt");

    assert.deepEqual(casttest, null);
  });
});
