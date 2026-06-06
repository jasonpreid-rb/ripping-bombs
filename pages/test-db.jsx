import { supabase } from "../lib/supabaseClient";

export default function TestDB() {

  async function testSupabase() {
    const { data, error } = await supabase
      .from("clubs")
      .select("*");

    console.log("DATA:", data);
    console.log("ERROR:", error);

    alert(
      error
        ? "Connection failed — check console"
        : "Connected! Check console"
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Supabase Test</h1>

      <button onClick={testSupabase}>
        Test Database
      </button>
    </div>
  );
}