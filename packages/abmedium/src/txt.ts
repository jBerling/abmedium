import Automerge from "automerge";
import { txtName } from "./constants";

// export class Txt extends Automerge.Text {
//   constructor(value: string) {
//     super(value);
//     return txtInstance(this);
//   }

//   get type() {
//     return txtName;
//   }

//   get value() {
//     return this.toString();
//   }
// }

// const txtInstance = (textInstance: any) => {
//   console.log("self", self);
//   console.log("prototype", Txt.prototype);
//   return Object.create(Txt.prototype, textInstance);
// };

export type Txt = {
  type: typeof txtName;
  readonly value: string;
} & Automerge.Text;

export const createTxt = (value: string): Txt => {
  const text = new Automerge.Text(value);
  return Object.assign(text, {
    type: txtName,
    get value() {
      return text.toString();
    },
  }) as any; // TODO figure out why type: txtName doesn't work with typeof txtName ...
};
