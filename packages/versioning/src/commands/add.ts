import { Observable } from "rxjs";
import { Argv } from "yargs";
import { document, layer, num, nil } from "@abrovink/abmedium";
import defaultFileHandler from "../util/file-handler";
import { FileHandler } from "../util/types";
import { mainDir, timestampsLayer, counter, head } from "../constants";

export const command = "add <id>";

export const describe = "add an entity";

export const builder = (yargs: Argv<{ id: string; all: boolean }>) => {
  return yargs.positional("id", {
    describe: "the ID of the entity",
  });
};

const add = ({
  fileHandler: { resolve, writeFile } = defaultFileHandler,
  archiveName,
  id,
}: {
  fileHandler?: FileHandler;
  archiveName: string;
  id: string;
}): Observable<void> => {
  return writeFile(
    resolve(archiveName, mainDir, id),
    JSON.stringify(
      document({
        [head]: nil,
        [counter]: num(0),
        [timestampsLayer]: layer(),
      }),
      undefined,
      4
    ),
    "utf8"
  );
};

export const handler = async (argv) =>
  new Promise((resolve) => {
    add({ archiveName: process.cwd(), id: argv.id }).subscribe(resolve);
  });

export default add;
