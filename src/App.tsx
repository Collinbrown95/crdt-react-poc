import { CtxAsync, useCachedState, useQuery, useSync } from "@vlcn.io/react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import vlcnLogo from "./assets/vlcn.png";
import "./App.css";
import randomWords from "./support/randomWords.js";
import { useDB } from "@vlcn.io/react";
import SyncWorker from "./sync-worker.js?worker";

import MyForm, { FormProps } from "./components/Form.js";

type TestRecord = {
  id: string;
  date: string;
  status: string;
};
const wordOptions = { exactly: 3, join: " " };

function getEndpoint() {
  let proto = "ws:";
  const host = window.location.host;
  if (window.location.protocol === "https:") {
    proto = "wss:";
  }

  return `${proto}//${host}/sync`;
}

const worker = new SyncWorker();
function App({ dbname }: { dbname: string }) {
  const ctx = useDB(dbname);
  useSync({
    dbname,
    endpoint: getEndpoint(),
    room: dbname,
    worker,
  });
  const data = useQuery<TestRecord>(
    ctx,
    "SELECT * FROM test ORDER BY id DESC"
  ).data;

  const addData = (formData: FormProps) => {
    console.log("form data is ", formData);
    ctx.db.exec("INSERT INTO test (id, date, status) VALUES (?, ?, ?);", [
      nanoid(10),
      `${formData.date.$D}/${formData.date.$M}/${formData.date.$y}` as string,
      formData.status,
    ]);
  };

  const dropData = () => {
    ctx.db.exec("DELETE FROM test;");
  };

  return (
    <>
      <h1>CRDT React PWA Demo</h1>
      <div className="card">
        <MyForm onSubmit={addData} />
      </div>
      <div className="card">
        <button onClick={dropData}>Drop Data</button>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>
                  <EditableItem ctx={ctx} id={row.id} value={row.date} />
                </td>
                <td>
                  <EditableItem ctx={ctx} id={row.id} value={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Open another browser and navigate to{" "}
          <a href={window.location.href} target="_blank">
            this window's url
          </a>{" "}
          to test sync.
        </p>
      </div>
    </>
  );
}

function EditableItem({
  ctx,
  id,
  value,
}: {
  ctx: CtxAsync;
  id: string;
  value: string;
}) {
  // Generally you will not need to use `useCachedState`. It is only required for highly interactive components
  // that write to the database on every interaction (e.g., keystroke or drag) or in cases where you want
  // to de-bounce your writes to the DB.
  //
  // `useCachedState` will never be required once when one of the following is true:
  // a. We complete the synchronous Reactive SQL layer (SQLiteRX)
  // b. We figure out how to get SQLite-WASM to do a write + read round-trip in a single event loop tick
  const [cachedValue, setCachedValue] = useCachedState(value);
  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setCachedValue(e.target.value);
    // You could de-bounce your write to the DB here if so desired.
    return ctx.db.exec("UPDATE test SET name = ? WHERE id = ?;", [
      e.target.value,
      id,
    ]);
  };

  return <input type="text" value={cachedValue} onChange={onChange} />;
}

export default App;

const nanoid = (t = 21) =>
  crypto
    .getRandomValues(new Uint8Array(t))
    .reduce(
      (t, e) =>
      (t +=
        (e &= 63) < 36
          ? e.toString(36)
          : e < 62
            ? (e - 26).toString(36).toUpperCase()
            : e > 62
              ? "-"
              : "_"),
      ""
    );
