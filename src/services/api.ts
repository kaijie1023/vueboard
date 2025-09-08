const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let DB = {
  boards: [
    {
      id: "b1",
      name: "Product",
      tasks: [{ id: "t1", title: "Spec", done: false }],
    },
    {
      id: "b2",
      name: "Marketing",
      tasks: [{ id: "t2", title: "Launch plan", done: true }],
    },
  ],
};

export async function getBoards() {
  await delay(300);
  return structuredClone(DB.boards);
}
export async function createBoard(board: any) {
  await delay(300);
  DB.boards.push(board);
}
export async function updateTask(boardId: string, task: any) {
  await delay(150);
  return true;
}
