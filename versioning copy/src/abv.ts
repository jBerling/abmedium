import yargs from "yargs";
import * as ver from "./commands/ver";
import * as alt from "./commands/alt";
import * as add from "./commands/add";
import * as init from "./commands/init";
import * as proj from "./commands/proj";

yargs
  .command(proj)
  .command(alt)
  .command(ver)
  .command(add)
  .command(init).argv;
