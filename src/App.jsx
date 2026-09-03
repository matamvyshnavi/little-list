
import { useState, useEffect } from "react";
import "./App.css";

function App() {
  // =========================
  // TASKS
  // =========================

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("littleListTasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  // =========================
  // INPUT
  // =========================

  const [input, setInput] = useState("");

  // =========================
  // SEARCH
  // =========================

  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState(false);

  // =========================
  // FILTER
  // =========================

  const [filter, setFilter] = useState("all");

  // =========================
  // EDIT
  // =========================

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  // =========================
  // SAVE TO LOCAL STORAGE
  // =========================

  useEffect(() => {
    localStorage.setItem(
      "littleListTasks",
      JSON.stringify(tasks)
    );
  }, [tasks]);

  // =========================
  // ADD TASK
  // =========================

  const addTask = () => {
    if (input.trim() === "") return;

    const newTask = {
      id: Date.now(),
      text: input.trim(),
      completed: false,
    };

    setTasks((previousTasks) => [
      ...previousTasks,
      newTask,
    ]);

    setInput("");
  };

  // =========================
  // ENTER KEY
  // =========================

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      if (searchMode) {
        return;
      }

      addTask();
    }
  };

  // =========================
  // TOGGLE TASK
  // =========================

  const toggleTask = (id) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
            }
          : task
      )
    );
  };

  // =========================
  // DELETE TASK
  // =========================

  const deleteTask = (id) => {
    setTasks((previousTasks) =>
      previousTasks.filter(
        (task) => task.id !== id
      )
    );
  };

  // =========================
  // START EDIT
  // =========================

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  // =========================
  // SAVE EDIT
  // =========================

  const saveEdit = (id) => {
    if (editText.trim() === "") return;

    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              text: editText.trim(),
            }
          : task
      )
    );

    setEditingId(null);
    setEditText("");
  };

  // =========================
  // SEARCH MODE
  // =========================

  const toggleSearchMode = () => {
    setSearchMode((previousMode) => !previousMode);

    setSearch("");
    setInput("");
  };

  // =========================
  // STATISTICS
  // =========================

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const remainingTasks =
    tasks.length - completedTasks;

  const progress =
    tasks.length === 0
      ? 0
      : Math.round(
          (completedTasks / tasks.length) * 100
        );

  // =========================
  // FILTER + SEARCH
  // =========================

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.text
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "active" && !task.completed) ||
      (filter === "completed" && task.completed);

    return matchesSearch && matchesFilter;
  });

  // =========================
  // UI
  // =========================

  return (
    <div className="app">

      <div className="todo-container">

        {/* HEADER */}

        <h1>LittleList ✨</h1>

        <p className="tagline">
          Little tasks. Big progress.
        </p>

        {/* =========================
            STATISTICS
        ========================= */}

        <div className="stats">

          <div className="stat-card">
            <span className="stat-number">
              {tasks.length}
            </span>

            <span className="stat-label">
              Total
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-number">
              {completedTasks}
            </span>

            <span className="stat-label">
              Completed
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-number">
              {remainingTasks}
            </span>

            <span className="stat-label">
              Remaining
            </span>
          </div>

        </div>

        {/* =========================
            PROGRESS
        ========================= */}

        <div className="progress-section">

          <div className="progress-header">
            <span>Your progress</span>

            <strong>
              {progress}%
            </strong>
          </div>

          <div className="progress-bar">

            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
              }}
            ></div>

          </div>

        </div>

        {/* =========================
            MAIN INPUT BAR
        ========================= */}

        <div className="main-input">

          <input
            type="text"
            placeholder={
              searchMode
                ? "Search your tasks..."
                : "What needs to be done?"
            }
            value={
              searchMode
                ? search
                : input
            }
            onChange={(event) => {
              if (searchMode) {
                setSearch(event.target.value);
              } else {
                setInput(event.target.value);
              }
            }}
            onKeyDown={handleKeyDown}
            autoFocus={searchMode}
          />

          {/* SEARCH BUTTON */}

          <button
            className="search-button"
            onClick={toggleSearchMode}
            title={
              searchMode
                ? "Close search"
                : "Search tasks"
            }
          >
            {searchMode ? "✕" : "🔍"}
          </button>

          {/* ADD BUTTON */}

          {!searchMode && (
            <button
              className="add-button"
              onClick={addTask}
              title="Add task"
            >
              +
            </button>
          )}

        </div>

        {/* =========================
            FILTERS
        ========================= */}

        <div className="filters">

          <button
            className={
              filter === "all"
                ? "active-filter"
                : ""
            }
            onClick={() => setFilter("all")}
          >
            All
          </button>

          <button
            className={
              filter === "active"
                ? "active-filter"
                : ""
            }
            onClick={() => setFilter("active")}
          >
            Active
          </button>

          <button
            className={
              filter === "completed"
                ? "active-filter"
                : ""
            }
            onClick={() =>
              setFilter("completed")
            }
          >
            Completed
          </button>

        </div>

        {/* =========================
            TASK INFO
        ========================= */}

        <div className="task-info">

          <span>
            {filteredTasks.length} task
            {filteredTasks.length !== 1
              ? "s"
              : ""}
          </span>

          <span>
            {remainingTasks} remaining
          </span>

        </div>

        {/* =========================
            TASK LIST
        ========================= */}

        <div className="task-list">

          {filteredTasks.length === 0 ? (

            <p className="empty-message">
              {searchMode && search
                ? "No matching tasks."
                : "No tasks yet. Add your first task."}
            </p>

          ) : (

            filteredTasks.map((task) => (

              <div
                className={`task ${
                  task.completed
                    ? "completed"
                    : ""
                }`}
                key={task.id}
              >

                {/* COMPLETE */}

                <button
                  className="complete-btn"
                  onClick={() =>
                    toggleTask(task.id)
                  }
                  title={
                    task.completed
                      ? "Mark as active"
                      : "Mark as completed"
                  }
                >
                  {task.completed
                    ? "✓"
                    : "○"}
                </button>

                {/* EDIT MODE */}

                {editingId === task.id ? (

                  <>

                    <input
                      className="edit-input"
                      type="text"
                      value={editText}
                      onChange={(event) =>
                        setEditText(
                          event.target.value
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter"
                        ) {
                          saveEdit(task.id);
                        }
                      }}
                      autoFocus
                    />

                    <button
                      className="save-btn"
                      onClick={() =>
                        saveEdit(task.id)
                      }
                    >
                      Save
                    </button>

                  </>

                ) : (

                  <>

                    {/* TASK TEXT */}

                    <span className="task-text">
                      {task.text}
                    </span>

                    {/* EDIT */}

                    <button
                      className="edit-btn"
                      onClick={() =>
                        startEdit(task)
                      }
                      title="Edit task"
                    >
                      ✎
                    </button>

                    {/* DELETE */}

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteTask(task.id)
                      }
                      title="Delete task"
                    >
                      ×
                    </button>

                  </>

                )}

              </div>

            ))

          )}

        </div>

      </div>

    </div>
  );
}

export default App;

