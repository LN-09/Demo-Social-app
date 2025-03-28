import Link from "next/link";

export default function notfound() {
  return (
    <div>
      <div>
        <h2>Not Found</h2>
        <p>Could not find requested resource</p>
        <p>This is our custom not found page</p>
        <Link href="/">Return Home</Link>
      </div>
    </div>
  );
}
