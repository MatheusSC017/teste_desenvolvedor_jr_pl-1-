import * as fs from 'fs';

const PERSISTENT_TASKS_PATH = "tasks.json";

interface Task {
  id: number;
  text: string;
  summary: string | null;
  lang: string
}

export class TasksRepository {
  private tasks: Task[] = [];
  private currentId: number = 1;

  createTask(text: string, lang: string): Task {
    const task: Task = {
      id: this.currentId++,
      text,
      summary: null,
      lang
    };
    this.tasks.push(task);
    this.saveTasks()
    return task;
  }

  updateTask(id: number, summary: string): Task | null {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
      this.tasks[taskIndex].summary = summary;
      this.saveTasks()
      return this.tasks[taskIndex];
    }
    return null;
  }

  removeTask(id:number): Task | null {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
      const deleted_task = this.tasks[taskIndex];
      this.tasks.splice(taskIndex, 1);
      this.saveTasks();
      return deleted_task;
    }
    return null;
  }

  getTaskById(id: number): Task | null {
    return this.tasks.find(t => t.id === id) || null;
  }

  getAllTasks(): Task[] {
    return this.tasks;
  }

  saveTasks(): null {
    fs.writeFileSync(PERSISTENT_TASKS_PATH, JSON.stringify(this.tasks, null, 2))
    return null;
  }

  loadTasks(): null {
    if (fs.existsSync(PERSISTENT_TASKS_PATH)) {
      const tasksJson = fs.readFileSync(PERSISTENT_TASKS_PATH, 'utf-8');
      this.tasks = JSON.parse(tasksJson);
      this.currentId = this.tasks.reduce((max, task) => (task.id > max ? task.id : max), 0) + 1;
    }
    return null
  }
}