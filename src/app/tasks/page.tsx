async function Taskpage() {
  const response = await fetch("http://localhost:3000/api/task", {
    cache: "no-store",
  });
  const tasks = await response.json();
  console.log("tasks: " + tasks);
  return <div>page</div>;
}

export default Taskpage;
