import { Router, Request, Response } from "express";
import { TasksRepository } from "../repositories/tasksRepository";

const SUPORTED_LANGUAGES = ["pt", "en", "es"];
const router = Router();
const tasksRepository = new TasksRepository();
tasksRepository.loadTasks();

// POST: Cria uma tarefa e solicita resumo ao serviço Python
router.post("/", async (req: Request, res: Response) => {
  try {
    const { text, lang } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Campo "text" é obrigatório.' });
    }

    // Verifica se o idioma é suportado
    if (!lang || !SUPORTED_LANGUAGES.includes(lang)) {
      return res
        .status(400)
        .json({ error: "Language not supported" });
    }

    // Cria a "tarefa"
    const task = tasksRepository.createTask(text, lang);

    // Deve solicitar o resumo do texto ao serviço Python
    const payload = {
      text: text,
      lang: lang,
    };
    const llm_url = process.env.PYTHON_LLM_URL;

    if (!llm_url) {
      throw new Error('The URL is required and must be a valid string');
    }

    const response = await fetch(llm_url + "/summarize/", {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Atualiza a tarefa com o resumo
    tasksRepository.updateTask(task.id, data.summary);

    return res.status(201).json({
      message: "Tarefa criada com sucesso!",
      task: tasksRepository.getTaskById(task.id),
    });
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    return res
      .status(500)
      .json({ error: "Ocorreu um erro ao criar a tarefa." });
  }
});

// GET: Lista todas as tarefas
router.get("/", (req, res) => {
  const tasks = tasksRepository.getAllTasks();
  return res.json(tasks);
});

// GET: Retorna as informações de uma Task especifica
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const idNumber = parseInt(id);
  if (isNaN(idNumber)) {
    return res.status(400).json({ message: "Invalid id format" });
  }

  const task = tasksRepository.getTaskById(idNumber);
  
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  return res.json(task);
});

// GET: Deleta uma tarefa especifica
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const idNumber = parseInt(id);
    if (isNaN(idNumber)) {
      return res.status(400).json({ message: "Invalid id format" });
    }

    const task = tasksRepository.removeTask(idNumber);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res
        .status(200)
        .json({ 
          "message": "Task deleted",
          "task": task      
        });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while deleting the task." });
  }
});

export default router;
