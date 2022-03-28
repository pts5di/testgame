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
  private spellList: SpellList;
  constructor(spellList: SpellList) {
    this.spellList = spellList;
  }
  public getAllSpells(): string[] {
    const allSpells: string[] = [];
    for (const element of Object.keys(this.spellList.elements)) {
      for (const type of Object.keys(this.spellList.spellTypes)) {
        allSpells.push(`${element} ${type}`);
      }
    }
    return allSpells;
  }
  public validate(chant: string): boolean {
    let chantWords: string[] = chant.split(" ");
    if (
      this.spellList.elements.hasOwnProperty(chantWords[0]) &&
      this.spellList.spellTypes.hasOwnProperty(chantWords[1])
    ) {
      return true;
    }
    return false;
  }
  public cast(chant: string): Spell {
    if (!this.validate(chant)) {
      return null;
    }
    let chantWords: string[] = chant.split(" ");
    const castSpell = {
      element: chantWords[0],
      ...this.spellList.spellTypes[chantWords[1]],
    };

    return castSpell;
  }
}
