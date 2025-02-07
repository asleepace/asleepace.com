import { e as endpoint } from '../../../chunks/index_BajHgFuI.mjs';
import { h as http } from '../../../chunks/http_NXgto6Mv.mjs';
export { renderers } from '../../../renderers.mjs';

const Seperator = {
  NEW_LINE: "\n",
  WHITE_SPACE: /\s+/,
  TAB: "	"
};
const parsers = {
  VSZ: Number,
  PID: Number,
  RSS: Number,
  CPU: Number,
  MEM: Number,
  STARTED: (val) => {
    return val;
  },
  TIME: (val) => {
    if (!val) return 0;
    const [hoursMins, seconds] = val.split(".");
    const [hours, minutes] = hoursMins.split(":");
    return Number(hours) * 36e5 + Number(minutes) * 6e4 + Number(seconds) * 1e3;
  },
  USER: String,
  TT: String,
  STAT: String,
  COMMAND: String
};
async function getProcessInfo() {
  const proc = Bun.spawn(["ps", "aux"], {
    stdout: "pipe"
  });
  const output = await new Response(proc.stdout).text();
  const processInfo = parseProcessData(output);
  return processInfo;
}
const parseProcessData = (rawData) => {
  const [tableHeaders, ...tableData] = rawData.trim().split(Seperator.NEW_LINE);
  const columns = tableHeaders.split(Seperator.WHITE_SPACE).filter((line) => line.length > 1 && line.at(1)).map((name) => name.replace("%", ""));
  return tableData.map((line) => iterate(columns, line));
};
function iterate(columns, text) {
  const values = text.split(Seperator.WHITE_SPACE);
  const lastColumnIndex = columns.length - 1;
  const lastColumn = columns[lastColumnIndex];
  let columnsWithValues = {};
  for (let i = 0; i < lastColumnIndex; i++) {
    const parse = parsers[columns[i]];
    columnsWithValues[columns[i]] = parse(values[i]);
  }
  columnsWithValues[lastColumn] = values.slice(lastColumnIndex).join(" ");
  return columnsWithValues;
}

const prerender = false;
const GET = endpoint(async ({ locals }) => {
  if (!locals.isLoggedIn) return http.failure(401, "Unauthorized");
  const rows = await getProcessInfo();
  return http.success(rows);
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
