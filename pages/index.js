import { useEffect, useState } from "react";

export default function Home() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetch("https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/gviz/tq?tqx=out:json")
      .then((res) => res.text())
      .then((text) => {
        const json = JSON.parse(text.substring(47, text.length - 2));
        const table = json.table.rows.map(row => row.c.map(cell => cell?.v));
        setRows(table);
      });
  }, []);

  return (
    <main className="p-6 font-mono bg-yellow-50 min-h-screen">
      <h1 className="text-3xl mb-4">🔥 RoastShiba Leaderboard</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th>User</th>
            <th>Art</th>
            <th>Roast</th>
            <th>Score</th>
            <th>Tweet</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td>@{row[0]}</td>
              <td>{row[1]}</td>
              <td>{row[2]}</td>
              <td>{row[3]}</td>
              <td><a href={row[4]} target="_blank">View</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
