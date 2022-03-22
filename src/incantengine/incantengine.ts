import spells from "./spells.json";

export type Spell = {
  element: string;
  type: string;
  baseDamage: number;
  castTime: number;
};
type Element = {
  weakAgainst: string;
};

type SpellType = {
  type: string;
  baseDamage: number;
  castTime: number;
};

type SpellList = {
  elements: { [key: string]: Element };
  spellTypes: {
    [key: string]: SpellType;
  };
};
export default class Incantengine {
  public validate(chant: string): boolean {
    let chantWords: string[] = chant.split(" ");
    if (
      spells.elements.hasOwnProperty(chantWords[0]) &&
      spells.spellTypes.hasOwnProperty(chantWords[1])
    ) {
      return true;
    }
    return false;
  }
  public cast(chant: string): Spell {
    if (!this.validate(chant)) {
      return null;
    }
    const spellList: SpellList = spells;
    let chantWords: string[] = chant.split(" ");
    const castSpell = {
      element: chantWords[0],
      ...spellList.spellTypes[chantWords[1]],
    };

    return castSpell;
  }
}
