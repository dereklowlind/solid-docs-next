import { createSignal } from "solid-js";
import { isServer } from "solid-js/web";

const stub = Promise.resolve({ default: function () {} as any });
const editorWorker = isServer
  ? stub
  : import("monaco-editor/esm/vs/editor/editor.worker?worker");
const tsWorker = isServer
  ? stub
  : import("monaco-editor/esm/vs/language/typescript/ts.worker?worker");
const cssWorker = isServer
  ? stub
  : import("monaco-editor/esm/vs/language/css/css.worker?worker");
const formatterWorker = isServer
  ? stub
  : import("solid-repl/lib/formatter?worker");
const compilerWorker = isServer
  ? stub
  : import("solid-repl/lib/compiler?worker");

if (!isServer)
  (window as any).MonacoEnvironment = {
    async getWorker(_moduleId: unknown, label: string) {
      switch (label) {
        case "css":
          return new (await cssWorker).default();
        case "typescript":
        case "javascript":
          return new (await tsWorker).default();
        default:
          return new (await editorWorker).default();
      }
    },
  };

const srepl = isServer ? undefined : import("solid-repl");

const Repl = isServer ? () => {} : (await srepl).Repl;
const createTabList = isServer
  ? () => [() => {}, () => {}]
  : (await srepl).createTabList;
const formatter = new (await formatterWorker).default();
const compiler = new (await compilerWorker).default();

import "solid-repl/lib/bundle.css";

export const MyRepl = () => {
  const [tabs, setTabs] = createTabList([
    {
      name: "main",
      type: "tsx",
      source:
        'import { render } from "solid-js/web";\n' +
        'import { createSignal } from "solid-js";\n' +
        "\n" +
        "function Counter() {\n" +
        "  const [count, setCount] = createSignal(0);\n" +
        "  const increment = () => setCount(count() + 1);\n" +
        "\n" +
        "  return (\n" +
        '    <button type="button" onClick={increment}>\n' +
        "      {count()}\n" +
        "    </button>\n" +
        "  );\n" +
        "}\n" +
        "\n" +
        'render(() => <Counter />, document.getElementById("app"));\n',
    },
  ]);
  const [current, setCurrent] = createSignal("main.tsx");

  return (
    <Repl
      isHorizontal={true}
      dark={false}
      interactive
      editableTabs
      actionBar
      id="HI"
      tabs={tabs()}
      current={current()}
      setCurrent={setCurrent}
      setTabs={setTabs}
      compiler={compiler}
      formatter={formatter}
    />
  );
};
